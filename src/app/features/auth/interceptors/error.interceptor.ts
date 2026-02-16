import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ApiErrorResponse } from '../../../core/models/api-error.model';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const messageService = inject(MessageService);

    return next(req).pipe(
        catchError(error => {
            const apiError: ApiErrorResponse = error.error;
            let message = 'Ha ocurrido un error inesperado';
            let summary = 'Error';

            switch (error.status) {
                case 401:
                    message = 'Sesión expirada. Por favor inicie sesión nuevamente.';
                    localStorage.removeItem('token');
                    router.navigate(['/login']);
                    break;
                case 403:
                    message = 'No tiene permisos para realizar esta acción.';
                    break;
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

            messageService.add({
                severity: 'error',
                summary: summary,
                detail: message,
                life: 6000
            });

            return throwError(() => error);
        })
    );
};
