import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../services/auth.service';
import { AuthenticationRequest, AuthenticationResponse } from '../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    InputTextModule,
    PasswordModule,
    ButtonModule,
  ],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <i class="pi pi-wallet auth-logo"></i>
          <h1>MiDinero</h1>
          <p>Inicia sesión en tu cuenta</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-field">
            <label for="email">Correo electrónico</label>
            <input
              pInputText
              id="email"
              type="email"
              formControlName="email"
              placeholder="tu@correo.com"
              class="w-full"
            />
            @if (loginForm.get('email')?.touched && loginForm.get('email')?.hasError('required')) {
              <small class="form-error">El correo es requerido</small>
            }
            @if (loginForm.get('email')?.touched && loginForm.get('email')?.hasError('email')) {
              <small class="form-error">Ingrese un correo válido</small>
            }
          </div>

          <div class="form-field">
            <label for="password">Contraseña</label>
            <p-password
              id="password"
              formControlName="password"
              [toggleMask]="true"
              [feedback]="false"
              placeholder="••••••••"
              styleClass="w-full"
              inputStyleClass="w-full"
            />
            @if (loginForm.get('password')?.touched && loginForm.get('password')?.hasError('required')) {
              <small class="form-error">La contraseña es requerida</small>
            }
          </div>

          <p-button
            type="submit"
            label="Iniciar Sesión"
            icon="pi pi-sign-in"
            [loading]="loading()"
            [disabled]="loginForm.invalid"
            styleClass="w-full"
          />
        </form>

        <div class="auth-footer">
          <p>¿No tienes cuenta? <a routerLink="/register">Regístrate</a></p>
        </div>
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
      margin-bottom: 0.5rem;
    }

    .auth-header h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--p-text-color);
      margin: 0.5rem 0 0.25rem;
    }

    .auth-header p {
      color: var(--p-text-muted-color);
      margin: 0;
      font-size: 0.925rem;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-field label {
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--p-text-color);
    }

    .form-error {
      color: var(--p-red-500);
      font-size: 0.8rem;
    }

    .w-full {
      width: 100%;
    }

    .auth-footer {
      text-align: center;
      margin-top: 1.5rem;
    }

    .auth-footer p {
      color: var(--p-text-muted-color);
      font-size: 0.875rem;
    }

    .auth-footer a {
      color: var(--p-primary-color);
      font-weight: 600;
      text-decoration: none;
    }

    .auth-footer a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    const request: AuthenticationRequest = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };
    this.authService.login(request).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
