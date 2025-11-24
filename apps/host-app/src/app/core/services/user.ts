import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { IUserService } from '../interfaces';
import { User } from '../models/user';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService implements IUserService {
  http = inject(HttpClient)
  #loggedInUser = signal<Partial<User>>({});

  get loggedInUser(): Partial<User> {
    return this.#loggedInUser();
  }

  setLoggedInUser(user: Partial<User>): void {
    this.#loggedInUser.set(user);
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/user`)
  }

  setUser(user: Partial<User>): Observable<unknown> {
    return this.http.post<unknown>(`${environment.apiUrl}/user`, user)
  }
}