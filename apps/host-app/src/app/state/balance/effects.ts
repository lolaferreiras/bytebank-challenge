import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import * as BalanceActions from './actions';
import { BalanceResponse } from '../../../../../../domain/src';

import { GetBalanceUseCase } from '@bytebank-challenge/application';

@Injectable()
export class BalanceEffects {
  private actions$ = inject(Actions);
  private getBalanceUseCase = inject(GetBalanceUseCase);

  loadBalance$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BalanceActions.loadBalance),
      tap(() => console.log('[Effect] Balance Load acionado!')),
      switchMap(() =>
        this.getBalanceUseCase.execute().pipe(
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
}