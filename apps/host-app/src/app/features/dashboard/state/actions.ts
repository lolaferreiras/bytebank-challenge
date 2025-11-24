import { createAction, props } from '@ngrx/store';

export const loadBalance = createAction('[Balance] Load');
export const loadBalanceSuccess = createAction('[Balance] Load Success', props<{ amount: number }>());
export const loadBalanceFailure = createAction('[Balance] Load Failure', props<{ error: string }>());
