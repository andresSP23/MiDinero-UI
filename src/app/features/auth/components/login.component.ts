import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../services/auth.service';
import { AuthenticationRequest } from '../../../core/models/auth.model';

interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    InputTextModule,
    PasswordModule,
    ButtonModule,
  ],
  template: `
    <div class="split-layout">
      <!-- Hero Section (Left) -->
      <div class="hero-section">
        <div class="hero-content">
          <div class="logo-box-hero">
            <i class="pi pi-wallet"></i>
          </div>
          <h1>Bienvenido a MiDinero</h1>
          <p>Toma el control total de tus finanzas personales con nuestra plataforma inteligente y segura.</p>
        </div>
        <div class="hero-overlay"></div>
      </div>

      <!-- Form Section (Right) -->
      <div class="form-section">
        <div class="form-container">
          <div class="mobile-header">
             <i class="pi pi-wallet text-3xl text-primary"></i>
             <h2 class="text-2xl font-bold mt-2">MiDinero</h2>
          </div>

          <div class="text-center mb-8 hidden md:block">
            <h2 class="text-3xl font-bold text-gray-900">Iniciar Sesión</h2>
            <p>Ingresa tus credenciales para acceder a tu cuenta</p>
          </div>

          @if (errorSignal()) {
            <div class="error-banner">
              <i class="pi pi-exclamation-circle"></i>
              <span>{{ errorSignal() }}</span>
            </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
            <div class="field">
              <label for="email" class="label-with-icon">
                <i class="pi pi-envelope"></i>
                <span>Correo electrónico</span>
              </label>
              <input 
                pInputText 
                id="email" 
                formControlName="email" 
                class="w-full" 
                placeholder="ejemplo@correo.com" 
                [ngClass]="{'ng-invalid ng-dirty': loginForm.controls.email.touched && loginForm.controls.email.invalid}"
              />
              @if (loginForm.controls.email.touched && loginForm.controls.email.hasError('required')) {
                <small class="error-msg">El correo es requerido</small>
              }
            </div>

            <div class="field">
              <label for="password" class="label-with-icon">
                <i class="pi pi-lock"></i>
                <span>Contraseña</span>
              </label>
              <div class="password-wrapper">
                <p-password 
                  id="password" 
                  formControlName="password" 
                  [toggleMask]="true" 
                  [feedback]="false"
                  placeholder="••••••••"
                  styleClass="w-full"
                  inputStyleClass="w-full"
                  [ngClass]="{'ng-invalid ng-dirty': loginForm.controls.password.touched && loginForm.controls.password.invalid}"
                />
              </div>
              @if (loginForm.controls.password.touched && loginForm.controls.password.hasError('required')) {
                <small class="error-msg">La contraseña es requerida</small>
              }
            </div>

            <div class="flex justify-content-end mb-4">
              <a routerLink="/forgot-password" class="forgot-link">¿Olvidaste tu contraseña?</a>
            </div>

            <button 
              pButton 
              type="submit" 
              label="Ingresar" 
              class="w-full p-button-lg btn-primary-custom" 
              [loading]="loading()"
              [disabled]="loginForm.invalid"
            ></button>
          </form>

          <div class="footer-cta">
            <p>¿Aún no tienes cuenta? <a routerLink="/register">Regístrate gratis</a></p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
    }

    /* Common Auth Layout styles moved to global CSS to prevent FOUC */

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .field label {
      font-weight: 600;
      font-size: 0.9rem;
      color: #374151;
    }

    .label-with-icon {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .label-with-icon i {
      color: #6B21A8;
    }

    /* PrimeNG Customization (Moved to styles.css) */
    
    .btn-primary-custom {
      background: #6B21A8 !important;
      border: none !important;
      border-radius: 12px !important;
      padding: 1rem !important;
      font-weight: 700 !important;
      font-size: 1rem !important;
    }

    .btn-primary-custom:hover {
      background: #581c87 !important;
      transform: translateY(-1px);
    }

    .forgot-link {
      color: #6B21A8;
      font-size: 0.9rem;
      font-weight: 600;
      text-decoration: none;
    }
    .forgot-link:hover { text-decoration: underline; }

    .footer-cta {
      margin-top: 2rem;
      text-align: center;
      color: #6b7280;
      font-size: 0.95rem;
    }
    .footer-cta a {
      color: #6B21A8;
      font-weight: 700;
      text-decoration: none;
    }
    .footer-cta a:hover { text-decoration: underline; }

    .error-banner {
      background: #fef2f2;
      border: 1px solid #fee2e2;
      color: #991b1b;
      padding: 1rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      gap: 0.8rem;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .error-msg {
      color: #ef4444;
      font-size: 0.8rem;
      font-weight: 500;
    }
    
    .mobile-header { display: none; }

    /* Responsive */
    @media (max-width: 960px) {
      .split-layout { grid-template-columns: 1fr; }
      .hero-section { display: none; }
      .mobile-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 3rem;
        text-align: center;
      }
      .mobile-header i { font-size: 3rem; color: #6B21A8; }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup<LoginForm>;
  loading = signal(false);
  errorSignal = signal('');

  constructor() {
    this.loginForm = this.fb.group<LoginForm>({
      email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
      password: this.fb.nonNullable.control('', [Validators.required])
    });

    this.loginForm.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        if (this.errorSignal()) this.errorSignal.set('');
      });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    const { email, password } = this.loginForm.getRawValue();

    const request: AuthenticationRequest = {
      email,
      password
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
