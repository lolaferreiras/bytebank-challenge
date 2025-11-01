import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ITransactionRepository } from '@bytebank-challenge/application';
import { environment } from '../../environments/environment';
import { Transaction } from '@bytebank-challenge/domain';

@Injectable({
  providedIn: 'root',
})
export class TransactionApiService implements ITransactionRepository {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAllTransactions(
    page: number,
    limit: number,
    sort: string,
    order: string
  ): Observable<any> {
    const userId = localStorage.getItem('userId');
    const url = `${this.apiUrl}/user/${userId}/statement`;

    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sort', sort)
      .set('order', order);

    return this.http.get<any>(url, { params });
  }

  deleteTransaction(id: number): Observable<void> {
    const url = `${this.apiUrl}/account/transaction/${id}`;
    return this.http.delete<void>(url);
  }

  updateTransaction(
    transaction: Partial<Transaction>,
    transactionId: number
  ): Observable<Transaction> {
    const url = `${this.apiUrl}/account/transaction/${transactionId}`;
    return this.http.put<Transaction>(url, transaction);
  }

  createTransaction(
    transaction: Partial<Transaction>
  ): Observable<any> {
    const url = `${this.apiUrl}/account/transaction`;
    return this.http.post<any>(url, transaction);
  }
}

