import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-activate-account',
    imports: [CommonModule, RouterLink, ButtonModule, ProgressSpinnerModule],
    template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <i class="pi pi-wallet auth-logo"></i>
          <h1>MiDinero</h1>
        </div>

        @if (loading()) {
          <div class="activate-status">
            <p-progressSpinner strokeWidth="4" />
            <p>Activando tu cuenta...</p>
          </div>
        } @else if (success()) {
          <div class="activate-status">
            <i class="pi pi-check-circle status-icon success"></i>
            <h3>¡Cuenta activada!</h3>
            <p>Tu cuenta ha sido activada exitosamente. Ya puedes iniciar sesión.</p>
            <p-button
              label="Iniciar Sesión"
              icon="pi pi-sign-in"
              routerLink="/login"
              styleClass="w-full"
            />
          </div>
        } @else {
          <div class="activate-status">
            <i class="pi pi-times-circle status-icon error"></i>
            <h3>Error de activación</h3>
            <p>{{ errorMessage() }}</p>
            <p-button
              label="Volver al inicio"
              icon="pi pi-home"
              routerLink="/login"
              severity="secondary"
              styleClass="w-full"
            />
          </div>
        }
      </div>
    </div>
  `,
    styles: [`
    .auth-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: var(--p-surface-ground);
      padding: 1rem;
    }

    .auth-card {
      background: var(--p-surface-card);
      border: 1px solid var(--p-surface-border);
      border-radius: 16px;
      padding: 2.5rem;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .auth-logo {
      font-size: 3rem;
      color: var(--p-primary-color);
    }

    .auth-header h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--p-text-color);
      margin: 0.5rem 0 0;
    }

    .activate-status {
      text-align: center;
      padding: 1rem 0;
    }

    .status-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .status-icon.success {
      color: var(--p-green-500);
    }

    .status-icon.error {
      color: var(--p-red-500);
    }

    .activate-status h3 {
      color: var(--p-text-color);
      margin: 0 0 0.75rem;
    }

    .activate-status p {
      color: var(--p-text-muted-color);
      margin: 0 0 1.5rem;
      line-height: 1.5;
    }

    .w-full {
      width: 100%;
    }
  `]
})
export class ActivateAccountComponent implements OnInit {
    loading = signal(true);
    success = signal(false);
    errorMessage = signal('No se pudo activar la cuenta. El enlace puede haber expirado.');

    constructor(
        private route: ActivatedRoute,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        const token = this.route.snapshot.queryParamMap.get('token');

        if (!token) {
            this.loading.set(false);
            this.errorMessage.set('Token de activación no proporcionado.');
            return;
        }

        this.authService.activateAccount(token).subscribe({
            next: () => {
                this.loading.set(false);
                this.success.set(true);
            },
            error: () => {
                this.loading.set(false);
                this.success.set(false);
            }
        });
    }
}
