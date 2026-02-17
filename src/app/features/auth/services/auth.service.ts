import { Injectable, signal, computed, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthenticationRequest, RegistrationRequest, AuthenticationResponse, ForgotPasswordRequest, ResetPasswordRequest } from '../../../core/models/auth.model';
import { UserResponse } from '../../../core/models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly apiUrl = `${environment.apiUrl}/auth`;
    private readonly userUrl = `${environment.apiUrl}/users`;
    private readonly tokenKey = 'token'; // Standardized to 'token' as per usage in the edit

    currentUser = signal<UserResponse | null>(null);

    private readonly _isAuthenticated = signal(this.hasValidToken());

    readonly isAuthenticated = this._isAuthenticated.asReadonly();

    constructor(
        private http: HttpClient,
        private injector: Injector
    ) {
        if (this.isAuthenticated()) {
            this.getMe().subscribe();
        }
    }

    login(request: AuthenticationRequest): Observable<AuthenticationResponse> {
        return this.http.post<AuthenticationResponse>(`${this.apiUrl}/authenticate`, request).pipe(
            tap(response => {
                localStorage.setItem(this.tokenKey, response.token);
                this._isAuthenticated.set(true);
                this.getMe().subscribe();
            })
        );
    }

    register(request: RegistrationRequest): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/register`, request);
    }

    activateAccount(token: string): Observable<void> {
        return this.http.get<void>(`${this.apiUrl}/activate-account`, {
            params: { token }
        });
    }

    forgotPassword(request: ForgotPasswordRequest): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/forgot-password`, request);
    }

    resetPassword(request: ResetPasswordRequest): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/reset-password`, request);
    }

    getMe(): Observable<UserResponse> {
        return this.http.get<UserResponse>(`${this.userUrl}/me`)
            .pipe(
                tap(user => this.currentUser.set(user))
            );
    }

    logout(): void {
        localStorage.removeItem(this.tokenKey);
        this._isAuthenticated.set(false);
        this.currentUser.set(null);
        this.injector.get(Router).navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    private hasValidToken(): boolean {
        const token = this.getToken();
        if (!token) return false;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    }
}
