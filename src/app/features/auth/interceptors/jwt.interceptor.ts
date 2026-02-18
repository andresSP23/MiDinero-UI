import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
    const token = localStorage.getItem('token');

    const excludedUrlPatterns = [
        '/auth/authenticate',
        '/auth/register',
        '/auth/activate-account',
        '/auth/forgot-password',
        '/auth/reset-password'
    ];

    const isExcluded = excludedUrlPatterns.some(pattern => req.url.includes(pattern));

    if (token && !isExcluded) {
        const cloned = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        return next(cloned);
    }

    return next(req);
};
