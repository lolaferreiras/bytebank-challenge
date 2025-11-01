import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Transaction } from '@bytebank-challenge/domain';

import { ITransactionRepository } from '../ports/itransaction.repository';

@Injectable({
  providedIn: 'root',
})
export class CreateTransactionUseCase {
  
  private repository = inject(ITransactionRepository);

  execute(transaction: Partial<Transaction>): Observable<any> { 
    return this.repository.createTransaction(transaction);
  }
}

