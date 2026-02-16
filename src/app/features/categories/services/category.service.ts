import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Category, CategoryRequest } from '../../../core/models/category.model';
import { PageResponse } from '../../../core/models/transaction.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
    private readonly apiUrl = `${environment.apiUrl}/categories`;

    constructor(private http: HttpClient) { }

    getAll(page: number = 0, size: number = 100): Observable<PageResponse<Category>> {
        const params = new HttpParams()
            .set('page', page)
            .set('size', size);
        return this.http.get<PageResponse<Category>>(`${this.apiUrl}/findAll`, { params });
    }

    create(request: CategoryRequest): Observable<Category> {
        return this.http.post<Category>(`${this.apiUrl}/create`, request);
    }

    getById(id: number): Observable<Category> {
        return this.http.get<Category>(`${this.apiUrl}/findById/${id}`);
    }

    update(id: number, request: CategoryRequest): Observable<Category> {
        return this.http.put<Category>(`${this.apiUrl}/update/${id}`, request);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
    }
}
