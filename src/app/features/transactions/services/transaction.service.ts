import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
    Transaction,
    TransactionRequest,
    PageResponse
} from '../../../core/models/transaction.model';
import { TransactionType } from '../../../core/enums/transaction-type.enum';

@Injectable({ providedIn: 'root' })
export class TransactionService {
    private readonly apiUrl = `${environment.apiUrl}/transactions`;

    constructor(private http: HttpClient) { }

    getAll(page: number = 0, size: number = 10, sort: string = 'createdAt,desc', type?: TransactionType): Observable<PageResponse<Transaction>> {
        let params = new HttpParams()
            .set('page', page)
            .set('size', size)
            .set('sort', sort);

        if (type) {
            params = params.set('type', type);
        }

        return this.http.get<PageResponse<Transaction>>(`${this.apiUrl}/findAll`, { params });
    }

    getById(id: number): Observable<Transaction> {
        return this.http.get<Transaction>(`${this.apiUrl}/findById/${id}`);
    }

    create(request: TransactionRequest): Observable<Transaction> {
        return this.http.post<Transaction>(`${this.apiUrl}/create`, request);
    }

    update(id: number, request: TransactionRequest): Observable<Transaction> {
        return this.http.put<Transaction>(`${this.apiUrl}/update/${id}`, request);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
    }

    exportToExcel(type?: TransactionType): Observable<Blob> {
        const endpoint = type === TransactionType.INCOME ? 'export/incomes' : 'export/expenses';
        return this.http.get(`${environment.apiUrl}/dashboard/${endpoint}`, { responseType: 'blob' });
    }
}
