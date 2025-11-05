import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Transaction } from '@bytebank-challenge/domain'; // Importe seu modelo

export const TransactionsActions = createActionGroup({
  source: 'Transactions Page',
  events: {
    // ---- LOAD (Existente) ----
    'Load Transactions': props<{
      page: number;
      limit: number;
      sort: string;
      order: string;
    }>(),
    
    // ---- CREATE (Novo) ----
    'Create Transaction': props<{
      transaction: Transaction;
      file: File | null; // Incluímos o anexo aqui
    }>(),

    // ---- UPDATE (Novo) ----
    'Update Transaction': props<{
      transactionId: number;
      transaction: Partial<Transaction>;
      file: File | null; // Incluímos o anexo aqui
    }>(),

    // ---- DELETE (Novo) ----
    'Delete Transaction': props<{ transactionId: number }>(),
  },
});

export const TransactionsApiActions = createActionGroup({
  source: 'Transactions API',
  events: {
    // ---- LOAD (Existente) ----
    'Load Transactions Success': props<{ response: any }>(),
    'Load Transactions Failure': props<{ error: any }>(),
    
    // ---- CREATE (Existente/Novo) ----
    'Create Transaction Success': emptyProps(),
    'Create Transaction Failure': props<{ error: any }>(), // Ação de falha

    // ---- UPDATE (Existente/Novo) ----
    'Update Transaction Success': emptyProps(),
    'Update Transaction Failure': props<{ error: any }>(), // Ação de falha

    // ---- DELETE (Existente/Novo) ----
    'Delete Transaction Success': emptyProps(),
    'Delete Transaction Failure': props<{ error: any }>(), // Ação de falha
  },
});