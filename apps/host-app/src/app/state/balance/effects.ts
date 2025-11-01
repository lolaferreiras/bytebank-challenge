import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import * as BalanceActions from './actions';
import { TransactionService } from '@core/services/transaction';
import { BalanceResponse } from '../../../../../../domain/src';

@Injectable()
export class BalanceEffects {
  constructor(
    private actions$: Actions,
    private transactionService: TransactionService
  ) {}

  loadBalance$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BalanceActions.loadBalance),
      tap(() => console.log('[Effect] Balance Load acionado!')),
      switchMap(() =>
        this.transactionService.getBalance().pipe(
          map((response: BalanceResponse) => {
            const amount = response.result.balance;
            return BalanceActions.loadBalanceSuccess({ amount });
          }),

          catchError((error) => {
            console.error('[Effect] Erro ao carregar saldo:', error);
            return of(BalanceActions.loadBalanceFailure({ error }));
          })
        )
      )
    )
  );

  autoRefreshBalance$ = createEffect(() =>
    this.transactionService.transactionsChanged$.pipe(
      tap(() => console.log('[Effect] Transações alteradas, recarregando saldo automaticamente')),
      map(() => BalanceActions.loadBalance())
    )
  );
}
