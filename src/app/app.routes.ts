import { Routes } from '@angular/router';
import { authGuard } from './features/auth/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () =>
            import('./features/auth/components/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () =>
            import('./features/auth/components/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'forgot-password',
        loadComponent: () =>
            import('./features/auth/components/forgot-password.component').then(m => m.ForgotPasswordComponent)
    },
    {
        path: 'reset-password',
        loadComponent: () =>
            import('./features/auth/components/reset-password.component').then(m => m.ResetPasswordComponent)
    },
    {
        path: 'activate-account',
        loadComponent: () =>
            import('./features/auth/components/activate-account.component').then(m => m.ActivateAccountComponent)
    },
    {
        path: '',
        loadComponent: () =>
            import('./layout/layout.component').then(m => m.LayoutComponent),
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () =>
                    import('./features/dashboard/components/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'incomes',
                loadComponent: () =>
                    import('./features/transactions/pages/income-page.component').then(m => m.IncomePageComponent)
            },
            {
                path: 'expenses',
                loadComponent: () =>
                    import('./features/transactions/pages/expense-page.component').then(m => m.ExpensePageComponent)
            },
            {
                path: 'categories',
                loadComponent: () =>
                    import('./features/categories/components/category-list.component').then(m => m.CategoryListComponent)
            },
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];
