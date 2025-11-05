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
  // TODO: Precisamos de um UseCase para 'UploadAttachment'
} from '@bytebank-challenge/application';

// Importe o 'loadBalance' do state de balance
import { loadBalance } from '../balance/actions';
// Importe o TransactionService antigo (para o upload, por enquanto)
import { TransactionService } from '@core/services/transaction';

@Injectable()
export class TransactionEffects {
  private actions$ = inject(Actions);

  // Use Cases
  private getAllTransactionsUseCase = inject(GetAllTransactionsUseCase);
  private createTransactionUseCase = inject(CreateTransactionUseCase);
  private updateTransactionUseCase = inject(UpdateTransactionUseCase);
  private deleteTransactionUseCase = inject(DeleteTransactionUseCase);

  // Service antigo (apenas para upload, por enquanto)
  private transactionService = inject(TransactionService);

  // --- LOAD EFFECT (Corrigido) ---
  loadTransactions$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TransactionsActions.loadTransactions),
      switchMap(({ page, limit, sort, order }) =>
        this.getAllTransactionsUseCase.execute(page, limit, sort, order).pipe(
          // CORREÇÃO: Dispara a ação do 'TransactionsApiActions'
          map((response) =>
            TransactionsApiActions.loadTransactionsSuccess({ response })
          ),
          // CORREÇÃO: Dispara a ação do 'TransactionsApiActions'
          catchError((error) =>
            of(TransactionsApiActions.loadTransactionsFailure({ error }))
          )
        )
      )
    );
  });

  // --- CREATE EFFECT (Novo) ---
  createTransaction$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TransactionsActions.createTransaction),
      concatMap(({ transaction, file }) =>
        this.createTransactionUseCase.execute(transaction).pipe(
          concatMap((response: any) => {
            const createdTransactionId = response.result.id;
            // Se tiver anexo, faz o upload
            if (file && createdTransactionId) {
              return this.transactionService
                .uploadAttachment(createdTransactionId, file)
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
            // Se não tiver anexo, apenas retorna sucesso
            return of(TransactionsApiActions.createTransactionSuccess());
          }),
          catchError((error) =>
            of(TransactionsApiActions.createTransactionFailure({ error }))
          )
        )
      )
    );
  });

  // --- UPDATE EFFECT (Novo) ---
  updateTransaction$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TransactionsActions.updateTransaction),
      concatMap(({ transactionId, transaction, file }) =>
        this.updateTransactionUseCase
          .execute(transaction, transactionId)
          .pipe(
            concatMap(() => {
              // Se tiver anexo, faz o upload
              if (file && transactionId) {
                return this.transactionService
                  .uploadAttachment(transactionId, file)
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
              // Se não tiver anexo, apenas retorna sucesso
              return of(TransactionsApiActions.updateTransactionSuccess());
            }),
            catchError((error) =>
              of(TransactionsApiActions.updateTransactionFailure({ error }))
            )
          )
      )
    );
  });

  // --- DELETE EFFECT (Novo) ---
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

  // --- RELOAD (Existente e Corrigido) ---
  // Recarrega a lista E o saldo após qualquer CUD
  reloadAfterCUD$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        TransactionsApiActions.createTransactionSuccess,
        TransactionsApiActions.updateTransactionSuccess,
        TransactionsApiActions.deleteTransactionSuccess
      ),
      concatMap(() => [
        loadBalance(), // Recarrega o saldo
        TransactionsActions.loadTransactions({ // Recarrega as transações
          page: 1, // TODO: Usar a página atual do state
          limit: 10, // TODO: Usar o limit atual do state
          sort: 'date',
          order: 'desc',
        }),
      ])
    );
  });
}