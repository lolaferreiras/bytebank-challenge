import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ITransactionRepository } from '../ports/itransaction.repository';

@Injectable({
  providedIn: 'root',
})
export class DeleteTransactionUseCase {
  private repository = inject(ITransactionRepository);

  execute(id: number): Observable<void> {
    return this.repository.deleteTransaction(id);
  }
}
