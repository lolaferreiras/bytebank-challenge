import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { IAuthService } from '../interfaces/auth.interface';
import { User } from '../models/user';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CryptoService } from './crypto.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements IAuthService {
  private router = inject(Router);
  private http = inject(HttpClient);
  private cryptoService = inject(CryptoService);
  private apiUrl = environment.apiUrl;
  private tokenKey = 'authToken';
  private userIdKey = 'userId';

  public login(credentials: Pick<User, 'email' | 'password'>): Observable<any> {
    // Validação para garantir que a senha existe
    if (!credentials.password) {
      throw new Error('Senha é obrigatória');
    }
    
    const hashedCredentials = {
      ...credentials,
      password: this.cryptoService.hashPassword(credentials.password)
    };
    
    return this.http.post<any>(`${this.apiUrl}/user/auth`, hashedCredentials).pipe(
      tap(response => {
        if (response && response.result) {
          if (response.result.token) {
            sessionStorage.setItem(this.tokenKey, response.result.token);
          }
          if (response.result.id) {
            sessionStorage.setItem(this.userIdKey, response.result.id);
          }
        }
      })
    );
  }

  /*
  public setAccountId() {
    return this.http.get<any>(`${this.apiUrl}/account`).pipe(
      tap((response) => {
        if (response &&  response.result.account) {
          localStorage.setItem(this.accountId, response.result.account[0].id);
        }
      })
    );
  }
    */

  public getUserId(): string | null {
    return sessionStorage.getItem(this.userIdKey);
  }

  signUp(userData: Partial<User>): Observable<any> {
    // Hash da senha antes de enviar
    const hashedUserData = {
      ...userData,
      password: userData.password ? this.cryptoService.hashPassword(userData.password) : undefined
    };
    
    return this.http.post<any>(`${this.apiUrl}/user`, hashedUserData);
  }

  getTokenPayload(): User & { exp: number } | null {
    const token = sessionStorage.getItem('token');
    if (!token) return null;

    try {
      const decoded = atob(token);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return null;
    }
  }

  getUser() {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  logout(): void {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userIdKey);
    sessionStorage.clear();
    this.router.navigate(['']);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private _generateJwt(user: User): void {
    const payload: User & { exp: number } = {
      id: user.id,
      email: user.email,
      username: user.username,
      exp: Date.now() + 10 * 60 * 1000 // 10 minutos
    };
    sessionStorage.setItem('token', btoa(JSON.stringify(payload)));
  }
}
