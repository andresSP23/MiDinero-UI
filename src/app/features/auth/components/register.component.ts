import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../services/auth.service';
import { RegistrationRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
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
            <i class="pi pi-chart-pie"></i>
          </div>
          <h1>Únete a MiDinero</h1>
          <p>Empieza hoy mismo a construir un futuro financiero sólido con nuestras herramientas de análisis.</p>
        </div>
        <div class="hero-overlay"></div>
      </div>

      <!-- Form Section (Right) -->
      <div class="form-section">
        <div class="form-container">
          
          @if (registered()) {
            <div class="success-state fade-in-up">
               <div class="success-icon-lg">
                 <i class="pi pi-check text-5xl"></i>
               </div>
               <h2 class="text-3xl font-bold text-gray-900 mb-2">¡Cuenta Creada!</h2>
               <p class="text-gray-500 mb-6 text-center">
                 Hemos enviado un enlace de activación al correo <strong>{{ registerForm.get('email')?.value }}</strong>.
                 <br>Por favor verifica tu bandeja de entrada.
               </p>
               <button 
                 pButton 
                 label="Ir a Iniciar Sesión" 
                 class="w-full p-button-lg btn-primary-custom" 
                 routerLink="/login"
               ></button>
            </div>
          } @else {
            <div class="mobile-header">
               <i class="pi pi-wallet text-3xl text-primary"></i>
               <h2 class="text-2xl font-bold mt-2">Crear Cuenta</h2>
            </div>
            
            <div class="text-center mb-8 hidden md:block">
              <h2 class="text-3xl font-bold text-gray-900">Crear Cuenta</h2>
              <p class="text-gray-500 mt-2">Completa tus datos para registrarte</p>
            </div>

            @if (errorSignal()) {
              <div class="error-banner">
                <i class="pi pi-exclamation-circle"></i>
                <span>{{ errorSignal() }}</span>
              </div>
            }

            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
              <div class="form-row">
                 <div class="field">
                    <label for="firstname" class="label-with-icon">
                      <i class="pi pi-user"></i>
                      <span>Nombre</span>
                    </label>
                    <input 
                      pInputText 
                      id="firstname" 
                      formControlName="firstname" 
                      class="w-full" 
                      placeholder="Juan" 
                      [ngClass]="{'ng-invalid ng-dirty': registerForm.get('firstname')?.touched && registerForm.get('firstname')?.invalid}"
                    />
                 </div>
                 <div class="field">
                    <label for="lastname" class="label-with-icon">
                      <i class="pi pi-user"></i>
                      <span>Apellido</span>
                    </label>
                    <input 
                      pInputText 
                      id="lastname" 
                      formControlName="lastname" 
                      class="w-full" 
                      placeholder="Pérez" 
                      [ngClass]="{'ng-invalid ng-dirty': registerForm.get('lastname')?.touched && registerForm.get('lastname')?.invalid}"
                    />
                 </div>
              </div>

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
                  placeholder="tu@correo.com" 
                  [ngClass]="{'ng-invalid ng-dirty': registerForm.get('email')?.touched && registerForm.get('email')?.invalid}"
                />
                @if (registerForm.get('email')?.touched && registerForm.get('email')?.invalid) {
                  <small class="error-msg">Correo inválido o requerido</small>
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
                    placeholder="Mínimo 6 caracteres"
                    styleClass="w-full"
                    inputStyleClass="w-full"
                    [ngClass]="{'ng-invalid ng-dirty': registerForm.get('password')?.touched && registerForm.get('password')?.invalid}"
                  >
                     <ng-template pTemplate="header">
                        <h6>Elige una contraseña segura</h6>
                     </ng-template>
                     <ng-template pTemplate="footer">
                        <p class="mt-2">Recomendaciones:</p>
                        <ul class="pl-2 ml-2 mt-0" style="line-height: 1.5">
                            <li>Al menos una minúscula</li>
                            <li>Al menos una mayúscula</li>
                            <li>Mínimo 6 caracteres</li>
                        </ul>
                    </ng-template>
                  </p-password>
                </div>
                @if (registerForm.get('password')?.touched && registerForm.get('password')?.invalid) {
                  <small class="error-msg">La contraseña es requerida</small>
                }
              </div>

              <button 
                pButton 
                type="submit" 
                label="Registrarme" 
                class="w-full p-button-lg btn-primary-custom mt-2" 
                [loading]="loading()"
                [disabled]="registerForm.invalid"
              ></button>
            </form>

            <div class="footer-cta">
              <p>¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión aquí</a></p>
            </div>
          }
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

    /* Common layout styles in global CSS */

    .field { display: flex; flex-direction: column; gap: 0.6rem; }
    .field label {
      font-weight: 700;
      font-size: 0.85rem;
      color: #44403c;
      letter-spacing: 0.01em;
    }

    .label-with-icon {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .label-with-icon i {
      color: #6B21A8;
      font-size: 0.9rem;
    }

    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

    /* PrimeNG Overrides (Moved to styles.css) */

    .btn-primary-custom {
      background: linear-gradient(135deg, #7c3aed, #6B21A8) !important;
      border: none !important;
      border-radius: 14px !important;
      padding: 1rem !important;
      font-weight: 700 !important;
      font-size: 1rem !important;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
      box-shadow: 0 4px 14px rgba(107, 33, 168, 0.25) !important;
    }
    .btn-primary-custom:hover {
      background: linear-gradient(135deg, #6d28d9, #581c87) !important;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(107, 33, 168, 0.35) !important;
    }

    .footer-cta {
      margin-top: 2.5rem;
      text-align: center;
      color: #78716c;
      font-size: 0.9rem;
      padding-top: 2rem;
      border-top: 1px solid #f1eeec;
    }
    .footer-cta a { color: #6B21A8; font-weight: 700; text-decoration: none; transition: color 0.2s; }
    .footer-cta a:hover { color: #581c87; text-decoration: underline; }

    .error-banner {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
      padding: 1rem 1.25rem;
      border-radius: 14px;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.8rem;
      font-size: 0.9rem;
      font-weight: 600;
    }
    .error-msg { color: #ef4444; font-size: 0.78rem; font-weight: 600; }
    
    /* Success State */
    .success-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2rem 0;
    }
    .success-icon-lg {
      width: 100px; height: 100px;
      background: linear-gradient(135deg, #dcfce7, #bbf7d0);
      color: #16a34a;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 2rem;
      animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: 0 8px 24px rgba(22, 163, 74, 0.15);
    }
    @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
    .fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

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
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = signal(false);
  registered = signal(false);
  errorSignal = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm.valueChanges.subscribe(() => {
      if (this.errorSignal()) this.errorSignal.set('');
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    const request: RegistrationRequest = {
      firstname: this.registerForm.value.firstname,
      lastname: this.registerForm.value.lastname,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password
    };
    this.loading.set(true);
    this.authService.register(request).subscribe({
      next: () => {
        this.loading.set(false);
        this.registered.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorSignal.set(
          err.error?.error ||
          err.error?.businessErrorDescription ||
          'No se pudo completar el registro. Por favor, verifica tus datos.'
        );
      }
    });
  }
}
