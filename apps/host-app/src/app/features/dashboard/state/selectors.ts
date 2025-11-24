import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BalanceState } from './model';

export const selectBalanceState = createFeatureSelector<BalanceState>('balance');

export const selectBalance = createSelector(selectBalanceState, state => state.amount);
export const selectBalanceLoading = createSelector(selectBalanceState, state => state.loading);
export const selectBalanceError = createSelector(selectBalanceState, state => state.error);
