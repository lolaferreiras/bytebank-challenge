import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { NotificationService } from '../../shared/services/notification';
import { EMPTY } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const notificationService = inject(NotificationService);

  //@to do validar exibição de toast para token expirado
  if (!auth.isAuthenticated() && !req.url.includes('user/auth') && !req.url.includes('user')) {
    notificationService.showToast('Sessão expirada', 'error');
    auth.logout();
    return EMPTY
  }

  const token = sessionStorage.getItem('authToken');
  const isFileUpload = req.body instanceof FormData;

  if (token) {
    const headers: any = {
      Authorization: `Bearer ${token}`,
      'Accept': 'application/json'
    };

    // Não definir Content-Type para uploads de arquivo (deixar o navegador definir automaticamente)
    if (!isFileUpload) {
      headers['Content-Type'] = 'application/json';
    }

    req = req.clone({
      setHeaders: headers
    });
  } else {
    const headers: any = {
      'Accept': 'application/json'
    };

    // Não definir Content-Type para uploads de arquivo
    if (!isFileUpload) {
      headers['Content-Type'] = 'application/json';
    }

    req = req.clone({
      setHeaders: headers
    });
  }

  return next(req);
};
