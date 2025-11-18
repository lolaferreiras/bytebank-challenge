import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { appRoutes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideStore } from '@ngrx/store';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

// Imports de 'balance' (existentes)
import { balanceReducer } from './state/balance/reducer';
import { BalanceEffects } from './state/balance/effects';

// --- ADICIONE ESSES IMPORTS PARA 'TRANSACTIONS' ---
import { transactionsFeature } from './state/transactions/transactions.reducer';
import { TransactionEffects } from './state/transactions/transactions.effects';
// ----------------------------------------------------

import { ITransactionRepository } from '@bytebank-challenge/application';
import { TransactionApiService } from '@bytebank-challenge/infrastructure';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(BrowserModule),
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes, withPreloading(PreloadAllModules)),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideAnimations(), 

    {
      provide: ITransactionRepository,
      useClass: TransactionApiService,
    },

    provideStore(),
    provideStoreDevtools(),

    // --- NOSSAS MUDANÇAS ESTÃO AQUI ---

    // 1. Registra o state de 'balance' (como já estava)
    provideState('balance', balanceReducer), 

    // 2. Registra o state de 'transactions' (usando o createFeature)
    provideState(transactionsFeature), 

    // 3. Registra TODOS os effects de uma vez
    provideEffects([BalanceEffects, TransactionEffects]), 
  ],
};