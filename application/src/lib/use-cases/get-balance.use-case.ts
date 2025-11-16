import { Injectable, inject } from '@angular/core';
import { ITransactionRepository } from '../ports/itransaction.repository';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GetBalanceUseCase {
  private repository = inject(ITransactionRepository);

  execute(): Observable<any> {
    return this.repository.getBalance();
  }
}