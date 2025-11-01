import { Observable } from 'rxjs';

export abstract class ITransactionRepository {
  abstract getAllTransactions(
    page: number, 
    limit: number, 
    sort: string, 
    order: string
  ): Observable<any>;
}
