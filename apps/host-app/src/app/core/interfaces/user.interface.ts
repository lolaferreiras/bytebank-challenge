import { User } from '../models/user';
import { Observable } from "rxjs";

export interface IUserService {
  setLoggedInUser(user: Partial<User> | null): void;
  getUsers(): Observable<User[]>;
  setUser(user: Partial<User>): Observable<unknown>;
}