import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ITransactionRepository } from '../ports/itransaction.repository';
import { Transaction } from '@bytebank-challenge/domain';

@Injectable({
  providedIn: 'root',
})
export class UpdateTransactionUseCase {
  private repository = inject(ITransactionRepository);

  execute(
    transaction: Partial<Transaction>,
    transactionId: number
  ): Observable<Transaction> {
    return this.repository.updateTransaction(transaction, transactionId);
  }
}
