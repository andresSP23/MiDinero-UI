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
    <div class="auth-container-mm">
      <div class="auth-card-mm">
        <div class="auth-header-mm">
          <div class="logo-box-mm">
            <i class="pi pi-wallet"></i>
          </div>
          <h1>MiDinero</h1>
          <p>Bienvenido de nuevo</p>
        </div>
 
        @if (errorSignal()) {
          <div class="auth-error-banner-mm">
            <i class="pi pi-exclamation-triangle"></i>
            <span>{{ errorSignal() }}</span>
          </div>
        }
 
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form-mm">
          <div class="form-field-mm">
            <label for="email">Correo electrónico</label>
            <div class="input-wrapper-mm">
              <i class="pi pi-envelope"></i>
              <input
                pInputText
                id="email"
                type="email"
                formControlName="email"
                placeholder="tu@correo.com"
                class="w-full-mm"
              />
            </div>
            @if (loginForm.get('email')?.touched && loginForm.get('email')?.hasError('required')) {
              <small class="error-text-mm">El correo es requerido</small>
            }
          </div>
 
          <div class="form-field-mm">
            <label for="password">Contraseña</label>
            <div class="input-wrapper-mm">
              <i class="pi pi-lock"></i>
              <p-password
                id="password"
                formControlName="password"
                [toggleMask]="true"
                [feedback]="false"
                placeholder="••••••••"
                styleClass="w-full-mm"
                inputStyleClass="w-full-mm"
              />
            </div>
            @if (loginForm.get('password')?.touched && loginForm.get('password')?.hasError('required')) {
              <small class="error-text-mm">La contraseña es requerida</small>
            }
          </div>
 
          <button
            type="submit"
            class="btn-mm-pri w-full-mm mt-2"
            [disabled]="loginForm.invalid || loading()"
          >
            @if (loading()) {
              <i class="pi pi-spin pi-spinner mr-2"></i> Procesando...
            } @else {
              <i class="pi pi-sign-in mr-2"></i> Iniciar Sesión
            }
          </button>
        </form>
 
        <div class="auth-footer-mm">
          <p>¿No tienes cuenta? <a routerLink="/register">Crea una ahora</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container-mm {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1.5rem;
      overflow: hidden;
    }

    .auth-container-mm::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('/assets/img/pexels-karola-g-4386442.webp');
      background-size: cover;
      background-position: center;
      filter: blur(5px);
      transform: scale(1.05);
      z-index: 0;
    }

    .auth-card-mm {
      position: relative;
      z-index: 1;
      background: white;
      border: 1px solid #f1f5f9;
      border-radius: 28px;
      padding: 3rem 2.5rem;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.03);
    }
 
    .auth-header-mm {
      text-align: center;
      margin-bottom: 2.5rem;
    }
 
    .logo-box-mm {
      width: 64px;
      height: 64px;
      background: #f5f3ff;
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
    }
 
    .logo-box-mm i {
      font-size: 2rem;
      color: #6B21A8;
    }
 
    .auth-header-mm h1 {
      font-size: 2rem;
      font-weight: 800;
      color: #111827;
      margin: 0;
      letter-spacing: -0.04em;
    }
 
    .auth-header-mm p {
      color: #64748b;
      margin-top: 0.5rem;
      font-size: 0.95rem;
    }
 
    .auth-form-mm {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
 
    .form-field-mm {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
 
    .form-field-mm label {
      font-weight: 700;
      font-size: 0.85rem;
      color: #475569;
      margin-left: 0.25rem;
    }
 
    .input-wrapper-mm {
      position: relative;
      display: flex;
      align-items: center;
    }
 
    .input-wrapper-mm i {
      position: absolute;
      left: 1rem;
      color: #94a3b8;
      z-index: 10;
      font-size: 1rem;
    }
 
    .input-wrapper-mm input,
    :host ::ng-deep .p-password input {
      padding-left: 2.75rem !important;
      padding-right: 3rem !important;
      height: 50px;
      border-radius: 14px !important;
      border: 1px solid #e2e8f0 !important;
      background: #f8fafc !important;
      font-weight: 500;
      transition: all 0.2s;
    }
 
    :host ::ng-deep .p-password {
      width: 100%;
    }
 
    :host ::ng-deep .p-password-toggle-mask-icon {
      right: 1.25rem !important;
      color: #94a3b8 !important;
      cursor: pointer;
      z-index: 10;
    }
 
    .input-wrapper-mm input:focus,
    :host ::ng-deep .p-password input:focus {
      border-color: #6B21A8 !important;
      background: white !important;
      box-shadow: 0 0 0 4px rgba(107, 33, 168, 0.05) !important;
    }
 
    .error-text-mm {
      color: #ef4444;
      font-size: 0.75rem;
      font-weight: 600;
      margin-top: 0.25rem;
      margin-left: 0.25rem;
    }
 
    .w-full-mm { width: 100%; }
    .mt-2 { margin-top: 0.5rem; }
    .mr-2 { margin-right: 0.5rem; }
 
    .auth-footer-mm {
      text-align: center;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #f1f5f9;
    }
 
    .auth-footer-mm p {
      color: #64748b;
      font-size: 0.9rem;
    }
 
    .auth-footer-mm a {
      color: #6B21A8;
      font-weight: 700;
      text-decoration: none;
    }
 
    .auth-error-banner-mm {
      background: #fef2f2;
      border: 1px solid #fee2e2;
      color: #991b1b;
      padding: 0.85rem 1rem;
      border-radius: 14px;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.85rem;
      font-weight: 500;
      animation: shake 0.4s ease-in-out;
    }
 
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-4px); }
      75% { transform: translateX(4px); }
    }
 
    .auth-footer-mm a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = signal(false);
  errorSignal = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    // Limpiar error al escribir
    this.loginForm.valueChanges.subscribe(() => {
      if (this.errorSignal()) this.errorSignal.set('');
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
      error: (err) => {
        this.loading.set(false);
        this.errorSignal.set(
          err.error?.error ||
          err.error?.businessErrorDescription ||
          'Credenciales inválidas. Por favor, revisa tus datos.'
        );
      }
    });
  }
}
