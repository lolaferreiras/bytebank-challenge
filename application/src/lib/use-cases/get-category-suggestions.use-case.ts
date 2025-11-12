import { Injectable, inject } from '@angular/core';
import { ITransactionRepository } from '../ports/itransaction.repository';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GetCategorySuggestionsUseCase {
  private repository = inject(ITransactionRepository);

  execute(
    description: string,
    type: 'income' | 'expense'
  ): Observable<any> {
    return this.repository.getCategorySuggestions(description, type);
  }
}
