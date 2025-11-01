import { Observable } from 'rxjs';
import { Transaction } from '@bytebank-challenge/domain';

export abstract class ITransactionRepository {
  abstract getAllTransactions(
    page: number,
    limit: number,
    sort: string,
    order: string
  ): Observable<any>;

  abstract deleteTransaction(id: number): Observable<void>;

  abstract updateTransaction(
    transaction: Partial<Transaction>,
    transactionId: number
  ): Observable<Transaction>;

  abstract createTransaction(
    transaction: Partial<Transaction>
  ): Observable<any>;
}
