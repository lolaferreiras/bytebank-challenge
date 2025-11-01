import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Transaction, BalanceResponse } from '../../../../../../domain/src';
import { Observable, Subject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth';

interface CategorySuggestion {
  detectedCategory: string;
  suggestions: string[];
  description: string;
  type: string;
}

interface CategorySuggestionResponse {
  message: string;
  result: CategorySuggestion;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private apiUrl = environment.apiUrl;
  private transactionsChanged = new Subject<void>();

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  transactionsChanged$ = this.transactionsChanged.asObservable();

  getTransactions(page: number, limit: number, sort: string, order: string): Observable<Transaction[]> {
    const userId = this.authService.getUserId();
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sort', sort)
      .set('order', order);

    const url = `${this.apiUrl}/user/${userId}/statement`;
    return this.http.get<Transaction[]>(url, { params });
  }

  getBalance(): Observable<BalanceResponse> {
    const userId = this.authService.getUserId();

    const url = `${this.apiUrl}/account/balance/${userId}`;
    return this.http.get<BalanceResponse>(url, {});
  }

  getCategorySuggestions(description: string, type: 'income' | 'expense'): Observable<CategorySuggestionResponse> {
    const params = new HttpParams()
      .set('description', description)
      .set('type', type);

    const url = `${this.apiUrl}/account/category-suggestions`;
    return this.http.get<CategorySuggestionResponse>(url, { params });
  }

  createTransaction(
    transaction: Partial<Transaction>
  ): Observable<Transaction> {
    return this.http
      .post<Transaction>(this.apiUrl + `/account/transaction`, transaction)
      .pipe(tap(() => this.transactionsChanged.next()));
  }

  updateTransaction(transaction: Partial<Transaction>, transactionId: number): Observable<Transaction> {
    return this.http
      .put<Transaction>(`${this.apiUrl}/account/transaction/${transactionId}`, transaction)
      .pipe(tap(() => this.transactionsChanged.next()));
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/account/transaction/${id}`)
      .pipe(tap(() => this.transactionsChanged.next()));
  }

  uploadAttachment(transactionId: number | string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    const url = `${this.apiUrl}/account/transaction/${transactionId}/attachment`;

    console.log('Upload URL:', url);
    console.log('Transaction ID:', transactionId);
    console.log('File:', file.name, file.size, file.type);

    return this.http.post(url, formData).pipe(
      tap((response) => {
        console.log('Upload response:', response);
        this.transactionsChanged.next();
      })
    );
  }

  downloadAttachment(filename: string): Observable<Blob> {
    console.log(filename);
    const url = `${this.apiUrl}/account/transaction/attachment/${filename}`;

    return this.http.get(url, { responseType: 'blob' });
  }
}
