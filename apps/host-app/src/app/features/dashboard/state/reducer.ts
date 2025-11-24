import { createReducer, on } from '@ngrx/store';
import * as BalanceActions from './actions';
import { BalanceState } from './model';

export const initialState: BalanceState = {
  amount: 0,
  loading: false,
  error: null
};

export const balanceReducer = createReducer(
  initialState,
  on(BalanceActions.loadBalance, state => ({ ...state, loading: true })),
  on(BalanceActions.loadBalanceSuccess, (state, { amount }) => ({ ...state, amount, loading: false })),
  on(BalanceActions.loadBalanceFailure, (state, { error }) => ({ ...state, error, loading: false }))
);
