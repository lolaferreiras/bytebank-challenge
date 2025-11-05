import { createFeature, createReducer, on } from '@ngrx/store';
import { Transaction } from '@bytebank-challenge/domain';
// Importe AMBOS os grupos de ações
import {
  TransactionsActions,
  TransactionsApiActions,
} from './transactions.actions';

export interface State {
  transactions: Transaction[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  status: 'pending' | 'loading' | 'error' | 'success';
  error: any;
}

export const initialState: State = {
  transactions: [],
  totalItems: 0,
  currentPage: 1,
  pageSize: 10,
  status: 'pending',
  error: null,
};

export const transactionsFeature = createFeature({
  name: 'transactions',
  reducer: createReducer(
    initialState,

    // Ouve a ação 'loadTransactions' do 'TransactionsActions'
    on(TransactionsActions.loadTransactions, (state, { page, limit }) => ({
      ...state,
      status: 'loading' as const,
      currentPage: page,
      pageSize: limit,
    })),

    // CORREÇÃO: Ouve a ação 'loadTransactionsSuccess' do 'TransactionsApiActions'
    on(TransactionsApiActions.loadTransactionsSuccess, (state, { response }) => ({
      ...state,
      status: 'success' as const,
      transactions: response.result.transactions,
      totalItems: response.result.pagination.totalItems,
      error: null,
    })),

    // CORREÇÃO: Ouve a ação 'loadTransactionsFailure' do 'TransactionsApiActions'
    on(TransactionsApiActions.loadTransactionsFailure, (state, { error }) => ({
      ...state,
      status: 'error' as const,
      error: error,
    }))

    // TODO: Adicionar reducers para o status de CUD (Create, Update, Delete)
    // (ex: setar status para 'loading' quando 'Create Transaction' for disparado)
  ),
});

export const {
  selectTransactions,
  selectTotalItems,
  selectStatus,
  selectError,
} = transactionsFeature;