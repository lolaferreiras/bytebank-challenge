import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Transaction } from '@bytebank-challenge/domain';
import {
  CreateTransactionUseCase,
  DeleteTransactionUseCase,
  GetAllTransactionsUseCase,
  UpdateTransactionUseCase,
  UploadAttachmentUseCase,
  DownloadAttachmentUseCase,
  GetCategorySuggestionsUseCase,
} from '@bytebank-challenge/application';
import {
  selectTransactions,
  selectTotalItems,
  selectStatus,
} from './state/transactions/transactions.reducer';
import { TransactionsActions } from './state/transactions/transactions.actions';

/**
 * Facade para o módulo de Transações
 * Centraliza toda a lógica de negócio e comunicação com o state management
 * Simplifica o uso nos componentes, escondendo a complexidade do NgRx
 */
@Injectable({
  providedIn: 'root',
})
export class TransactionsFacade {
  private store = inject(Store);
  private getAllUseCase = inject(GetAllTransactionsUseCase);
  private createUseCase = inject(CreateTransactionUseCase);
  private updateUseCase = inject(UpdateTransactionUseCase);
  private deleteUseCase = inject(DeleteTransactionUseCase);
  private uploadAttachmentUseCase = inject(UploadAttachmentUseCase);
  private downloadAttachmentUseCase = inject(DownloadAttachmentUseCase);
  private getCategorySuggestionsUseCase = inject(GetCategorySuggestionsUseCase);

  // Selectors públicos - Estado observável
  transactions$ = this.store.select(selectTransactions);
  totalItems$ = this.store.select(selectTotalItems);
  status$ = this.store.select(selectStatus);

  /**
   * Carrega transações com paginação
   */
  loadTransactions(
    page = 1,
    limit = 10,
    sort = 'date',
    order = 'desc',
    userId: string | null = null
  ): void {
    this.store.dispatch(
      TransactionsActions.loadTransactions({ page, limit, sort, order, userId })
    );
  }

  /**
   * Cria uma nova transação
   * @param transaction Dados da transação
   * @param file Arquivo anexo opcional
   */
  createTransaction(
    transaction: Partial<Transaction>,
    file?: File | null
  ): void {
    this.store.dispatch(
      TransactionsActions.createTransaction({ 
        transaction: transaction as Transaction, 
        file: file ?? null 
      })
    );
  }

  /**
   * Atualiza uma transação existente
   * @param transactionId ID da transação
   * @param transaction Dados atualizados
   * @param file Novo arquivo anexo opcional
   */
  updateTransaction(
    transactionId: number,
    transaction: Partial<Transaction>,
    file?: File | null
  ): void {
    this.store.dispatch(
      TransactionsActions.updateTransaction({
        transactionId,
        transaction,
        file: file ?? null,
      })
    );
  }

  /**
   * Deleta uma transação
   * @param transactionId ID da transação a ser deletada
   */
  deleteTransaction(transactionId: number): void {
    this.store.dispatch(
      TransactionsActions.deleteTransaction({ transactionId })
    );
  }

  /**
   * Faz upload de um anexo para uma transação
   * @param transactionId ID da transação
   * @param file Arquivo a ser anexado
   */
  uploadAttachment(
    transactionId: number | string,
    file: File
  ): Observable<unknown> {
    return this.uploadAttachmentUseCase.execute(transactionId, file);
  }

  /**
   * Baixa um anexo de uma transação
   * @param filename Nome do arquivo a ser baixado
   */
  downloadAttachment(filename: string): Observable<Blob> {
    return this.downloadAttachmentUseCase.execute(filename);
  }

  /**
   * Obtém sugestões de categoria baseadas na descrição
   * @param description Descrição da transação
   * @param type Tipo da transação (income ou expense)
   */
  getCategorySuggestions(
    description: string,
    type: 'income' | 'expense'
  ): Observable<unknown> {
    return this.getCategorySuggestionsUseCase.execute(description, type);
  }

  /**
   * Método utilitário para download de arquivo
   * Encapsula a lógica de criação de link e download
   */
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}
