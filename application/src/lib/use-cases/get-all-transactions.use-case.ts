import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ITransactionRepository } from '../ports/itransaction.repository';

@Injectable({
  providedIn: 'root',
})
export class GetAllTransactionsUseCase {
  private repository = inject(ITransactionRepository);

  execute(
    page: number, 
    limit: number, 
    sort: string, 
    order: string,
    userId: string | null = null
  ): Observable<any> {
    return this.repository.getAllTransactions(page, limit, sort, order, userId);
  }
}
