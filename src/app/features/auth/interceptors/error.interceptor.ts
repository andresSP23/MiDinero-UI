import { HttpInterceptorFn } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ApiErrorResponse } from '../../../core/models/api-error.model';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const messageService = inject(MessageService);
    const injector = inject(Injector); // Inject Injector instead of AuthService directly

    return next(req).pipe(
        catchError(error => {
            const apiError: ApiErrorResponse = error.error;
            let message = 'Ha ocurrido un error inesperado';
            let summary = 'Error';

            switch (error.status) {
                case 401:
                    if (req.url.includes('/auth/authenticate') || req.url.includes('/auth/register')) {
                        message = apiError?.error || 'Credenciales incorrectas. Verifique e intente de nuevo.';
                    } else {
                        // Lazily get AuthService to avoid circular dependency
                        const authService = injector.get(AuthService);
                        authService.notifySessionExpired();
                        return throwError(() => error);
                    }
                    break;
                case 403: {
                    // message = 'No tiene permisos para realizar esta acción.';
                    // If the backend returns 403 for expired tokens, we should treat it as session expired.

                    // BUT: If it's an auth endpoint (like login/register), it might mean "Account not activated" or "Forbidden"
                    if (req.url.includes('/auth/authenticate') || req.url.includes('/auth/register') || req.url.includes('/auth/activate-account')) {
                        message = apiError?.error || 'No tiene permisos para realizar esta acción.';
                    } else {
                        const authService = injector.get(AuthService);
                        authService.notifySessionExpired();
                        return throwError(() => error);
                    }
                    break;
                }
                case 404:
                    message = 'El recurso solicitado no fue encontrado.';
                    break;
                case 422:
                    summary = 'Error de Validación';
                    if (apiError.validationErrors && apiError.validationErrors.length > 0) {
                        message = apiError.validationErrors.join(', ');
                    } else if (apiError.errors) {
                        message = Object.values(apiError.errors).join(', ');
                    } else {
                        message = 'Datos inválidos. Verifique la información.';
                    }
                    break;
                case 500:
                    message = apiError?.businessErrorDescription || 'Error interno del servidor. Intente más tarde.';
                    break;
                default:
                    message = apiError?.error || apiError?.businessErrorDescription || message;
            }

            // Mostrar Toast solo si NO es una ruta de autenticación (que se maneja localmente)
            if (!req.url.includes('/auth/')) {
                messageService.add({
                    severity: 'error',
                    summary: summary,
                    detail: message,
                    life: 6000
                });
            }

            return throwError(() => error);
        })
    );
};
