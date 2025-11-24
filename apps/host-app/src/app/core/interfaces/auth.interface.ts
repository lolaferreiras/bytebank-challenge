import { User } from '../models/user';
import { Observable } from "rxjs";

export interface IAuthService {
  login(formLogin: Partial<User>): Observable<boolean>;
  signUp(formLogin: Partial<User>): Observable<boolean>;
  logout(): void;
  getTokenPayload(): User & {exp: number} | null;
  getUser(): User | null;
  isAuthenticated(): boolean;
}
