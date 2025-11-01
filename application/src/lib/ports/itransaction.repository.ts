import { Observable } from 'rxjs';
import { Transaction } from '@bytebank-challenge/domain'; 

export abstract class ITransactionRepository {
    
  abstract getAllTransactions(): Observable<Transaction[]>;

}