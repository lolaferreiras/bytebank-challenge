import { Route } from '@angular/router';
import { authGuard } from './core/guards/auth';

export const appRoutes: Route[] = [
  // Rota inicial
  { 
    path: '', 
    redirectTo: 'home',
    pathMatch: 'full' 
  },
  // Rotas públicas - Auth Feature
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home').then(m => m.Home)
  },
  // Rotas protegidas
  {
    path: '',
    loadComponent: () => import('./pages/base/base').then(m => m.Base),
    canActivate: [authGuard],
    children: [
      // Dashboard Feature Module (lazy loaded)
      {
        path: 'dashboard',
        loadChildren: () => 
          import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
      },
      // Transactions Feature Module (lazy loaded)
      {
        path: 'extract',
        loadChildren: () => 
          import('./features/transactions/transactions.routes').then(m => m.TRANSACTIONS_ROUTES)
      },
      // Microfrontends
      {
        path: 'resume-account-mf',
        data: {preload: false},
        loadChildren: () =>
          import('resume-account-mf/Routes').then((m) => m.remoteRoutes),
      },
    ]
  },
  // Fallback para rotas não encontradas
  {
    path: 'not-found',
    loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFound)
  },
  { 
    path: '**', 
    redirectTo: 'not-found'
  }
];
