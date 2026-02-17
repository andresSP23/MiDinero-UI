import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    InputTextModule,
    ButtonModule
  ],
  template: `
    <div class="auth-container-mm">
      <div class="auth-card-mm">
        
        <!-- Success State -->
        @if (successSignal()) {
          <div class="success-state">
            <div class="success-icon">
              <i class="pi pi-check-circle"></i>
            </div>
            <h2>¡Correo Enviado!</h2>
            <p>
              Hemos enviado las instrucciones para restablecer tu contraseña a 
              <strong>{{ submittedEmail() }}</strong>.
            </p>
            <p class="text-sm text-gray-500 mt-2">
              Revisa tu bandeja de entrada y spam.
            </p>
            
            <a routerLink="/login" class="btn-mm-pri w-full-mm mt-4 block text-center no-underline">
              Volver al Login
            </a>
          </div>
        } @else {
          <!-- Form State -->
          <div class="auth-header-mm">
            <div class="logo-box-mm">
              <i class="pi pi-key"></i>
            </div>
            <h1>Recuperar Contraseña</h1>
            <p>Ingresa tu correo para recibir las instrucciones</p>
          </div>

          @if (errorSignal()) {
            <div class="auth-error-banner-mm">
              <i class="pi pi-exclamation-triangle"></i>
              <span>{{ errorSignal() }}</span>
            </div>
          }

          <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="auth-form-mm">
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
              @if (forgotForm.get('email')?.touched && forgotForm.get('email')?.hasError('required')) {
                <small class="error-text-mm">El correo es requerido</small>
              }
              @if (forgotForm.get('email')?.touched && forgotForm.get('email')?.hasError('email')) {
                <small class="error-text-mm">Ingresa un correo válido</small>
              }
            </div>

            <button
              type="submit"
              class="btn-mm-pri w-full-mm mt-2"
              [disabled]="forgotForm.invalid || loading()"
            >
              @if (loading()) {
                <i class="pi pi-spin pi-spinner mr-2"></i> Procesando...
              } @else {
                Enviar Enlace
              }
            </button>
          </form>

          <div class="auth-footer-mm">
            <p>¿Recordaste tu contraseña? <a routerLink="/login">Inicia Sesión</a></p>
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    /* Reusing styles from Login/Register for consistency */
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
      top: 0; left: 0; right: 0; bottom: 0;
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
      width: 64px; height: 64px;
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
      font-size: 1.75rem;
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

    .input-wrapper-mm input {
      padding-left: 2.75rem !important;
      padding-right: 1rem !important;
      height: 50px;
      border-radius: 14px !important;
      border: 1px solid #e2e8f0 !important;
      background: #f8fafc !important;
      font-weight: 500;
      transition: all 0.2s;
    }

    .input-wrapper-mm input:focus {
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
    .mt-4 { margin-top: 1rem; }
    .block { display: block; }
    .mr-2 { margin-right: 0.5rem; }
    .text-center { text-align: center; }
    .no-underline { text-decoration: none; }

    .btn-mm-pri {
      background: linear-gradient(135deg, #7e22ce 0%, #6b21a8 100%);
      color: white;
      border: none;
      padding: 0 1.5rem;
      height: 50px;
      border-radius: 14px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 12px rgba(107, 33, 168, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .btn-mm-pri:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(107, 33, 168, 0.3);
    }
    
    .btn-mm-pri:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

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

    .auth-footer-mm a:hover {
      text-decoration: underline;
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

    /* Success State Styles */
    .success-state {
      text-align: center;
    }

    .success-icon {
      width: 80px;
      height: 80px;
      background: #ecfdf5;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
    }

    .success-icon i {
      font-size: 2.5rem;
      color: #10b981;
    }

    .success-state h2 {
      color: #111827;
      font-size: 1.5rem;
      font-weight: 800;
      margin: 0 0 1rem;
    }

    .success-state p {
      color: #4b5563;
      line-height: 1.5;
      margin: 0;
    }
  `]
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  loading = signal(false);
  errorSignal = signal('');
  successSignal = signal(false);
  submittedEmail = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.forgotForm.valueChanges.subscribe(() => {
      if (this.errorSignal()) this.errorSignal.set('');
    });
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) return;

    this.loading.set(true);
    const email = this.forgotForm.value.email;

    this.authService.forgotPassword({ email }).subscribe({
      next: () => {
        this.loading.set(false);
        this.submittedEmail.set(email);
        this.successSignal.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        // Map error 3000 -> "No encontramos una cuenta con este correo."
        const errorCode = err.error?.businessErrorCode || err.error?.errorCode;
        if (errorCode === 3000) {
          this.errorSignal.set('No encontramos una cuenta con este correo.');
        } else {
          this.errorSignal.set('Ocurrió un error. Intenta nuevamente.');
        }
      }
    });
  }
}
