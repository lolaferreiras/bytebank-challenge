import { Component, ElementRef, HostListener, inject, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TransactionService } from '@core/services/transaction';
import { groupBy } from 'lodash';
import { MatDialog } from '@angular/material/dialog';
import { EditTransactionModal } from '@components/edit-transaction-modal/edit-transaction-modal';
import { ConfirmDeleteDialog } from '@components/confirm-delete-dialog/confirm-delete-dialog';
import { Transaction } from '../../../../../../domain/src';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Injectable()
export class MatPaginatorIntlPtBr extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Itens por página';
  override nextPageLabel = 'Próxima página';
  override previousPageLabel = 'Página anterior';
  override firstPageLabel = 'Primeira página';
  override lastPageLabel = 'Última página';

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    const totalPages = Math.ceil(length / pageSize);
    const currentPage = page + 1;

    if (length === 0 || pageSize === 0) {
      return `Página 0 de 0`;
    }

    return `Página ${currentPage} de ${totalPages}`;
  };
}

interface FilterOptions {
  income: boolean;
  expense: boolean;
  startDate: Date | null;
  endDate: Date | null;
  minAmount: number | null;
  maxAmount: number | null;
  category: string;
  hasAttachment: boolean;
  noAttachment: boolean;
}

@Component({
  selector: 'app-extract',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatOptionModule,
    MatSelectModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [{ provide: MatPaginatorIntl, useClass: MatPaginatorIntlPtBr }],
  templateUrl: './extract.html',
  styleUrl: './extract.scss',
})
export class Extract {
  groupedTransactions: { month: string; transactions: Transaction[] }[] = [];
  filteredTransactions: Transaction[] = [];
  allTransactions: Transaction[] = [];
  length = 50;
  pageSize = 10;
  pageIndex = 1;
  pageSizeOptions = [5, 10, 25];
  pageEvent!: PageEvent;
  totalItems = 1;
  sort = 'date';
  order = 'desc';
  showFilter = false;
  searchTerm = '';
  availableCategories: string[] = [];
  private searchSubject = new Subject<string>();

  filters: FilterOptions = {
    income: true,
    expense: true,
    startDate: null,
    endDate: null,
    minAmount: null,
    maxAmount: null,
    category: '',
    hasAttachment: false,
    noAttachment: false
  };

  dialog = inject(MatDialog);
  elementRef = inject(ElementRef);
  transactionService = inject(TransactionService);

  constructor() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {
        this.performSearch(searchTerm);
      });
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    const clickedInsideComponent = this.elementRef.nativeElement.contains(target);
    const clickedOnOverlay = target.closest('.cdk-overlay-pane');

    if (!clickedInsideComponent && !clickedOnOverlay) {
      this.showFilter = false;
    }
  }

  ngOnInit(): void {
    this.loadStatement();

    this.transactionService.transactionsChanged$.subscribe(() => {
      this.loadStatement();
    });
  }

  private loadStatement(): void {
    this.transactionService.getTransactions(this.pageIndex, this.pageSize, this.sort, this.order).subscribe((statement: any) => {
      this.totalItems = statement.result.pagination.totalItems;
      const itens: Array<any> = statement.result.transactions;

      this.allTransactions = itens;

      this.extractCategories(itens);

      const filteredItems = this.applyFiltersToTransactions(itens);

      const grouped = groupBy(filteredItems, (t: Transaction) => {
        const d = new Date(t.date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
      });

      const sortedEntries = Object.entries(grouped).sort((a, b) => {
        const dateA = new Date(a[0] + '-01');
        const dateB = new Date(b[0] + '-01');
        return dateB.getTime() - dateA.getTime();
      });

      this.groupedTransactions = sortedEntries.map(([key, transactions]) => {
        const sampleDate = new Date(`${key}-01`);
        const formattedMonth = sampleDate.toLocaleDateString('pt-BR', {
          month: 'long',
          year: 'numeric',
          timeZone: 'UTC',
        });

        return {
          month: formattedMonth,
          transactions: transactions as Transaction[],
        };
      });

      if (this.searchTerm) {
        this.performSearch(this.searchTerm);
      }
    });
  }

  private extractCategories(transactions: Transaction[]): void {
    const categories = new Set<string>();
    transactions.forEach(transaction => {
      if (transaction.category) {
        categories.add(transaction.category);
      }
    });
    this.availableCategories = Array.from(categories).sort();
  }

  private applyFiltersToTransactions(transactions: Transaction[]): Transaction[] {
    return transactions.filter(transaction => {
      if (!this.filters.income && transaction.type === 'income') return false;
      if (!this.filters.expense && transaction.type === 'expense') return false;

      if (this.filters.startDate) {
        const transactionDate = new Date(transaction.date);
        if (transactionDate < this.filters.startDate) return false;
      }

      if (this.filters.endDate) {
        const transactionDate = new Date(transaction.date);
        if (transactionDate > this.filters.endDate) return false;
      }

      if (this.filters.minAmount !== null && Math.abs(transaction.amount) < this.filters.minAmount) {
        return false;
      }

      if (this.filters.maxAmount !== null && Math.abs(transaction.amount) > this.filters.maxAmount) {
        return false;
      }

      if (this.filters.category && transaction.category !== this.filters.category) {
        return false;
      }

      if (this.filters.hasAttachment && !transaction.anexo?.filename) return false;
      if (this.filters.noAttachment && transaction.anexo?.filename) return false;

      return true;
    });
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  private performSearch(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.filteredTransactions = [];
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    this.filteredTransactions = this.allTransactions.filter(transaction => {
      if (transaction.description && transaction.description.toLowerCase().includes(term)) {
        return true;
      }

      if (transaction.category && transaction.category.toLowerCase().includes(term)) {
        return true;
      }

      const typeText = transaction.type === 'income' ? 'depósito' : 'transferência';
      if (typeText.includes(term)) {
        return true;
      }

      const amountText = `R$ ${Math.abs(transaction.amount).toFixed(2).replace('.', ',')}`;
      if (amountText.includes(term)) {
        return true;
      }

      const dateText = new Date(transaction.date).toLocaleDateString('pt-BR');
      if (dateText.includes(term)) {
        return true;
      }

      return false;
    });
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredTransactions = [];
  }

  applyFilter(): void {
    this.loadStatement();
  }

  clearAllFilters(): void {
    this.filters = {
      income: true,
      expense: true,
      startDate: null,
      endDate: null,
      minAmount: null,
      maxAmount: null,
      category: '',
      hasAttachment: false,
      noAttachment: false
    };
    this.loadStatement();
  }

  trackByTransaction(index: number, transaction: Transaction): number {
    return transaction.id || index;
  }

  trackByGroup(index: number, group: { month: string; transactions: Transaction[] }): string {
    return group.month;
  }

  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex + 1;
    this.loadStatement();
  }

  openFilterDialog(): void {
    this.showFilter = !this.showFilter;
  }

  getPositiveAmount(amount: number): number {
    return Math.abs(amount);
  }

  getIcon(t: Transaction): string {
    return t.amount > 0 ? 'call_received' : 'call_made';
  }

  downloadAttachment(transaction: Transaction): void {
    if (!transaction.anexo || !transaction.anexo.filename) {
      console.error('Esta transação não possui anexo para download.');
      return;
    }

    const filename = transaction.anexo.filename;
    const originalName = transaction.anexo.originalName || filename;

    this.transactionService.downloadAttachment(filename).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = url;
        a.download = originalName;
        a.click();

        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err) => {
        console.error('Erro ao baixar o anexo:', err);
      }
    });
  }

  openEditModal(transaction: Transaction): void {
    const dialogRef = this.dialog.open(EditTransactionModal, {
      data: { transaction },
      width: '700px',
      height: '500px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const updatedTransactionData: Partial<Transaction> = result.transaction;
        const newFile: File | null = result.file;
        const transactionId = updatedTransactionData.id!;

        this.transactionService
          .updateTransaction(updatedTransactionData, transactionId)
          .subscribe({
            next: () => {
              if (newFile) {
                this.transactionService
                  .uploadAttachment(transactionId, newFile)
                  .subscribe({
                    next: () => {
                      this.loadStatement();
                    },
                    error: (err) => console.error("Erro no upload do anexo", err)
                  });
              } else {
                this.loadStatement();
              }
            },
            error: (err) => console.error("Erro ao atualizar transação", err)
          });
      }
    });
  }

  deleteTransaction(id: number, description: string): void {
    const dialogRef = this.dialog.open(ConfirmDeleteDialog, {
      data: { description },
      width: '300px',
      height: '200px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.transactionService.deleteTransaction(id).subscribe();
      }
    });
  }
} 