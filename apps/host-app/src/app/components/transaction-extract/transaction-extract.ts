import {
  Component,
  ElementRef,
  HostListener,
  inject,
  Injectable,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TransactionService } from '@core/services/transaction'; 
import { groupBy } from 'lodash';
import { MatDialog } from '@angular/material/dialog';
import { EditTransactionModal } from '@components/edit-transaction-modal/edit-transaction-modal';
import { ConfirmDeleteDialog } from '@components/confirm-delete-dialog/confirm-delete-dialog';
import { Transaction } from '@bytebank-challenge/domain';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  MatPaginatorIntl,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';

import { Store } from '@ngrx/store';
import {
  selectTransactions,
  selectTotalItems,
  selectStatus,
} from '../../state/transactions/transactions.reducer';
import { TransactionsActions } from '../../state/transactions/transactions.actions';

@Injectable()
export class MatPaginatorIntlPtBr extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Itens por página';
  override nextPageLabel = 'Próxima página';
  override previousPageLabel = 'Página anterior';
  override firstPageLabel = 'Primeira página';
  override lastPageLabel = 'Última página';

  override getRangeLabel = (
    page: number,
    pageSize: number,
    length: number
  ): string => {
    const totalPages = Math.ceil(length / pageSize);
    const currentPage = page + 1;

    if (length === 0 || pageSize === 0) {
      return `Página 0 de 0`;
    }

    return `Página ${currentPage} de ${totalPages}`;
  };
}

@Component({
  selector: 'app-transaction-extract',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatOptionModule,
    MatSelectModule,
    FormsModule,
  ],
  providers: [{ provide: MatPaginatorIntl, useClass: MatPaginatorIntlPtBr }],
  templateUrl: './transaction-extract.html',
  styleUrl: './transaction-extract.scss',
})
export class TransactionExtract implements OnInit {
  groupedTransactions: { month: string; transactions: Transaction[] }[] = [];
  pageSize = 10;
  pageIndex = 0; 
  pageSizeOptions = [5, 10, 25];
  pageEvent!: PageEvent;
  sort = 'date';
  order = 'desc';
  showFilter = false;

  private store = inject(Store);
  transactionService = inject(TransactionService); // AINDA USADO PARA downloadAttachment
  dialog = inject(MatDialog);
  elementRef = inject(ElementRef);

  transactions$ = this.store.select(selectTransactions);
  totalItems$ = this.store.select(selectTotalItems);
  status$ = this.store.select(selectStatus);

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
    this.loadTransactions();

    this.transactions$.subscribe((transactions) => {
      this.groupedTransactions = this.groupTransactions(transactions);
    });
  }

  private groupTransactions(
    transactions: Transaction[]
  ): { month: string; transactions: Transaction[] }[] {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    const grouped = groupBy(transactions, (t) => {
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

    return sortedEntries.map(([key, transactions]) => {
      const sampleDate = new Date(`${key}-01`);
      const formattedMonth = sampleDate.toLocaleString('pt-BR', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      });

      return {
        month: formattedMonth,
        transactions,
      };
    });
  }

  private loadTransactions(): void {
    this.store.dispatch(
      TransactionsActions.loadTransactions({
        page: this.pageIndex + 1,
        limit: this.pageSize,
        sort: this.sort,
        order: this.order,
      })
    );
  }

  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.loadTransactions();
  }

  openFilterDialog(): void {
    this.showFilter = !this.showFilter;
  }

  applyFilter(): void {
    // ... (código inalterado) ...
    this.pageIndex = 0;
    this.loadTransactions();
    this.openFilterDialog();
  }

  getPositiveAmount(amount: number): number {
    return Math.abs(amount);
  }

  getIcon(t: Transaction): string {
    return t.type === 'income' ? 'call_received' : 'call_made';
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
      },
    });
  }

  openEditModal(transaction: Transaction): void {
    const dialogRef = this.dialog.open(EditTransactionModal, {
      data: { transaction },
      width: '700px',
      height: '500px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const updatedTransactionData: Partial<Transaction> = result.transaction;
        const newFile: File | null = result.file;
        const transactionId = updatedTransactionData.id!;

        this.store.dispatch(
          TransactionsActions.updateTransaction({
            transactionId: transactionId,
            transaction: updatedTransactionData,
            file: newFile,
          })
        );
        
        // TODO: Adicionar notificação de sucesso/erro
        // (idealmente ouvindo as ações 'updateTransactionSuccess'/'Failure')
      }
    });
  }

  deleteTransaction(id: number, description: string): void {
    const dialogRef = this.dialog.open(ConfirmDeleteDialog, {
      data: { description },
      width: '300px',
      height: '200px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.store.dispatch(
          TransactionsActions.deleteTransaction({ transactionId: id })
        );

        // TODO: Adicionar notificação de sucesso/erro
        // (ouvindo as ações 'deleteTransactionSuccess'/'Failure')
      }
    });
  }
}