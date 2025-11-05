import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Transaction } from '@bytebank-challenge/domain';

export const TransactionsActions = createActionGroup({
  source: 'Transactions Page',
  events: {
    'Load Transactions': props<{
      page: number;
      limit: number;
      sort: string;
      order: string;
    }>(),
    
    'Create Transaction': props<{
      transaction: Transaction;
      file: File | null;
    }>(),

    'Update Transaction': props<{
      transactionId: number;
      transaction: Partial<Transaction>;
      file: File | null;
    }>(),

    'Delete Transaction': props<{ transactionId: number }>(),
  },
});

export const TransactionsApiActions = createActionGroup({
  source: 'Transactions API',
  events: {
    'Load Transactions Success': props<{ response: any }>(),
    'Load Transactions Failure': props<{ error: any }>(),
    
    'Create Transaction Success': emptyProps(),
    'Create Transaction Failure': props<{ error: any }>(),

    'Update Transaction Success': emptyProps(),
    'Update Transaction Failure': props<{ error: any }>(),

    'Delete Transaction Success': emptyProps(),
    'Delete Transaction Failure': props<{ error: any }>(),
  },
});