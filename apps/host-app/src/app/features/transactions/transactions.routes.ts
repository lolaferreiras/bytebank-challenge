import { Route } from '@angular/router';

export const TRANSACTIONS_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => 
      import('./pages/extract/extract').then(m => m.Extract)
  }
];
