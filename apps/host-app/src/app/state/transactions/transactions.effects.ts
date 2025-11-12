import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, concatMap, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import {
  TransactionsActions,
  TransactionsApiActions,
} from './transactions.actions';
import {
  CreateTransactionUseCase,
  DeleteTransactionUseCase,
  GetAllTransactionsUseCase,
  UpdateTransactionUseCase,
  UploadAttachmentUseCase,
} from '@bytebank-challenge/application';

import { loadBalance } from '../balance/actions';

@Injectable()
export class TransactionEffects {
  private actions$ = inject(Actions);

  private getAllTransactionsUseCase = inject(GetAllTransactionsUseCase);
  private createTransactionUseCase = inject(CreateTransactionUseCase);
  private updateTransactionUseCase = inject(UpdateTransactionUseCase);
  private deleteTransactionUseCase = inject(DeleteTransactionUseCase);
  private uploadAttachmentUseCase = inject(UploadAttachmentUseCase);

  loadTransactions$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TransactionsActions.loadTransactions),
      switchMap(({ page, limit, sort, order }) =>
        this.getAllTransactionsUseCase.execute(page, limit, sort, order).pipe(
          map((response) =>
            TransactionsApiActions.loadTransactionsSuccess({ response })
          ),
          catchError((error) =>
            of(TransactionsApiActions.loadTransactionsFailure({ error }))
          )
        )
      )
    );
  });

  createTransaction$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TransactionsActions.createTransaction),
      concatMap(({ transaction, file }) =>
        this.createTransactionUseCase.execute(transaction).pipe(
          concatMap((response: any) => {
            const createdTransactionId = response.result.id;
            if (file && createdTransactionId) {
              return this.uploadAttachmentUseCase
                .execute(createdTransactionId, file)
                .pipe(
                  map(() =>
                    TransactionsApiActions.createTransactionSuccess()
                  ),
                  catchError((error) =>
                    of(
                      TransactionsApiActions.createTransactionFailure({ error })
                    )
                  )
                );
            }
            return of(TransactionsApiActions.createTransactionSuccess());
          }),
          catchError((error) =>
            of(TransactionsApiActions.createTransactionFailure({ error }))
          )
        )
      )
    );
  });

  updateTransaction$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TransactionsActions.updateTransaction),
      concatMap(({ transactionId, transaction, file }) =>
        this.updateTransactionUseCase
          .execute(transaction, transactionId)
          .pipe(
            concatMap(() => {
              if (file && transactionId) {
                return this.uploadAttachmentUseCase
                  .execute(transactionId, file)
                  .pipe(
                    map(() =>
                      TransactionsApiActions.updateTransactionSuccess()
                    ),
                    catchError((error) =>
                      of(
                        TransactionsApiActions.updateTransactionFailure({
                          error,
                        })
                      )
                    )
                  );
              }
              return of(TransactionsApiActions.updateTransactionSuccess());
            }),
            catchError((error) =>
              of(TransactionsApiActions.updateTransactionFailure({ error }))
            )
          )
      )
    );
  });

  deleteTransaction$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TransactionsActions.deleteTransaction),
      concatMap(({ transactionId }) =>
        this.deleteTransactionUseCase.execute(transactionId).pipe(
          map(() => TransactionsApiActions.deleteTransactionSuccess()),
          catchError((error) =>
            of(TransactionsApiActions.deleteTransactionFailure({ error }))
          )
        )
      )
    );
  });

  reloadAfterCUD$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        TransactionsApiActions.createTransactionSuccess,
        TransactionsApiActions.updateTransactionSuccess,
        TransactionsApiActions.deleteTransactionSuccess
      ),
      concatMap(() => [
        loadBalance(),
        TransactionsActions.loadTransactions({
          page: 1, // TODO: Usar a página atual do state
          limit: 10, // TODO: Usar o limit atual do state
          sort: 'date',
          order: 'desc',
        }),
      ])
    );
  });
}