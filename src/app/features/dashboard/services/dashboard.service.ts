import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
    RecentTransaction,
    DailyChartResponse,
    IncomeExpenseDailyChartsResponse,
    BalanceSummary
} from '../../../core/models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private readonly apiUrl = `${environment.apiUrl}/dashboard`;

    constructor(private http: HttpClient) { }

    getBalanceSummary(): Observable<BalanceSummary> {
        return this.http.get<BalanceSummary>(`${this.apiUrl}/balance-summary`);
    }

    getRecentIncomes(limit: number = 5): Observable<RecentTransaction[]> {
        return this.http.get<RecentTransaction[]>(`${this.apiUrl}/recent-incomes`, {
            params: new HttpParams().set('limit', limit)
        });
    }

    getRecentExpenses(limit: number = 5): Observable<RecentTransaction[]> {
        return this.http.get<RecentTransaction[]>(`${this.apiUrl}/recent-expenses`, {
            params: new HttpParams().set('limit', limit)
        });
    }

    getDailyIncome(from: string, to: string): Observable<DailyChartResponse> {
        return this.http.get<DailyChartResponse>(`${this.apiUrl}/income/daily`, {
            params: new HttpParams().set('from', from).set('to', to)
        });
    }

    getDailyExpense(from: string, to: string): Observable<DailyChartResponse> {
        return this.http.get<DailyChartResponse>(`${this.apiUrl}/expense/daily`, {
            params: new HttpParams().set('from', from).set('to', to)
        });
    }

    getDailyIncomeExpense(from: string, to: string): Observable<IncomeExpenseDailyChartsResponse> {
        return this.http.get<IncomeExpenseDailyChartsResponse>(`${this.apiUrl}/income-expense/daily`, {
            params: new HttpParams().set('from', from).set('to', to)
        });
    }

    exportIncomes(): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/export/incomes`, {
            responseType: 'blob'
        });
    }

    exportExpenses(): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/export/expenses`, {
            responseType: 'blob'
        });
    }
}
