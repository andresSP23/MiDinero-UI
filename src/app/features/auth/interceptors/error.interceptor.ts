import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const messageService = inject(MessageService);

    return next(req).pipe(
        catchError(error => {
            let message = 'Ha ocurrido un error inesperado';

            switch (error.status) {
                case 401:
                    message = 'Sesión expirada. Por favor inicie sesión nuevamente.';
                    localStorage.removeItem('midinero_token');
                    router.navigate(['/login']);
                    break;
                case 403:
                    message = 'No tiene permisos para realizar esta acción.';
                    break;
                case 404:
                    message = 'El recurso solicitado no fue encontrado.';
                    break;
                case 422:
                    message = error.error?.message || 'Datos inválidos. Verifique la información.';
                    break;
                case 500:
                    message = 'Error interno del servidor. Intente más tarde.';
                    break;
                default:
                    if (error.error?.message) {
                        message = error.error.message;
                    }
            }

            messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: message,
                life: 5000
            });

            return throwError(() => error);
        })
    );
};
