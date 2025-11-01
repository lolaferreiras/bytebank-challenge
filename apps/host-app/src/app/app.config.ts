import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { appRoutes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideStore } from '@ngrx/store';
import { provideState } from '@ngrx/store';
import { balanceReducer } from './state/balance/reducer';
import { BalanceEffects } from './state/balance/effects';
import { provideEffects } from '@ngrx/effects';

import { ITransactionRepository } from '@bytebank-challenge/application';
import { TransactionApiService } from '@bytebank-challenge/infrastructure';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideAnimations(), // Necessário para MatDialog,

    {
      provide: ITransactionRepository,
      useClass: TransactionApiService,
    },

    provideStore(),
    provideStoreDevtools(),
    provideState('balance', balanceReducer),
    provideEffects([BalanceEffects]),
  ],
};
