import { Component, ElementRef, HostListener, inject, Injectable, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-transaction-extract',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule, MatPaginatorModule, MatOptionModule, MatSelectModule, FormsModule],
  providers: [{provide: MatPaginatorIntl, useClass: MatPaginatorIntlPtBr}],
  templateUrl: './transaction-extract.html',
  styleUrl: './transaction-extract.scss',
})
export class TransactionExtract implements OnInit {
  groupedTransactions: { month: string; transactions: Transaction[] }[] = [];
  length = 50;
  pageSize = 10;
  pageIndex = 1;
  pageSizeOptions = [5, 10, 25];
  pageEvent!: PageEvent;
  totalItems = 1;
  sort = 'date';
  order = 'desc';
  showFilter = false;

  transactionService = inject(TransactionService);
  dialog = inject(MatDialog);
  elementRef = inject(ElementRef);

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

      const grouped = groupBy(itens, (t) => {
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
          transactions,
        };
      });
    });
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

  applyFilter(): void {
    this.loadStatement();
    this.openFilterDialog();
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
      // mostrar uma notificação para o usuário
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
        // mostrar uma notificação de erro para o usuário
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
      // Verifica se o usuário salvou (result não é 'false')
      if (result) {
        const updatedTransactionData: Partial<Transaction> = result.transaction;
        const newFile: File | null = result.file;
        const transactionId = updatedTransactionData.id!;

        // 1. Atualiza os dados de texto da transação
        this.transactionService
          .updateTransaction(updatedTransactionData, transactionId)
          .subscribe({
            next: () => {
              // 2. Se houver um novo arquivo, faz o upload
              if (newFile) {
                this.transactionService
                  .uploadAttachment(transactionId, newFile)
                  .subscribe({
                    next: () => {
                      // Sucesso total
                      this.loadStatement();
                    },
                    error: (err) => console.error("Erro no upload do anexo", err)
                  });
              } else {
                // Se não houver arquivo novo, apenas recarrega a lista
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
