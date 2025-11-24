import { Route } from '@angular/router';

export const AUTH_ROUTES: Route[] = [
  {
    path: 'login',
    loadComponent: () => 
      import('../../pages/home/home').then(m => m.Home)
  }
];
