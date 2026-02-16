import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { AuthService } from '../services/auth.service';
import { RegistrationRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-register',
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
          <p>Crea tu cuenta gratuita</p>
        </div>

        @if (registered()) {
          <div class="success-message">
            <i class="pi pi-check-circle"></i>
            <h3>¡Registro exitoso!</h3>
            <p>Hemos enviado un correo de activación a tu email. Por favor revisa tu bandeja de entrada.</p>
            <p-button
              label="Ir a Iniciar Sesión"
              icon="pi pi-sign-in"
              routerLink="/login"
              styleClass="w-full"
            />
          </div>
        } @else {
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
            <div class="form-row">
              <div class="form-field">
                <label for="firstname">Nombre</label>
                <input
                  pInputText
                  id="firstname"
                  formControlName="firstname"
                  placeholder="Juan"
                  class="w-full"
                />
                @if (registerForm.get('firstname')?.touched && registerForm.get('firstname')?.hasError('required')) {
                  <small class="form-error">El nombre es requerido</small>
                }
              </div>

              <div class="form-field">
                <label for="lastname">Apellido</label>
                <input
                  pInputText
                  id="lastname"
                  formControlName="lastname"
                  placeholder="Pérez"
                  class="w-full"
                />
                @if (registerForm.get('lastname')?.touched && registerForm.get('lastname')?.hasError('required')) {
                  <small class="form-error">El apellido es requerido</small>
                }
              </div>
            </div>

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
              @if (registerForm.get('email')?.touched && registerForm.get('email')?.hasError('required')) {
                <small class="form-error">El correo es requerido</small>
              }
              @if (registerForm.get('email')?.touched && registerForm.get('email')?.hasError('email')) {
                <small class="form-error">Ingrese un correo válido</small>
              }
            </div>

            <div class="form-field">
              <label for="password">Contraseña</label>
              <p-password
                id="password"
                formControlName="password"
                [toggleMask]="true"
                placeholder="Mínimo 6 caracteres"
                styleClass="w-full"
                inputStyleClass="w-full"
              />
              @if (registerForm.get('password')?.touched && registerForm.get('password')?.hasError('required')) {
                <small class="form-error">La contraseña es requerida</small>
              }
              @if (registerForm.get('password')?.touched && registerForm.get('password')?.hasError('minlength')) {
                <small class="form-error">Mínimo 6 caracteres</small>
              }
            </div>

            <p-button
              type="submit"
              label="Crear Cuenta"
              icon="pi pi-user-plus"
              [loading]="loading()"
              [disabled]="registerForm.invalid"
              styleClass="w-full"
            />
          </form>

          <div class="auth-footer">
            <p>¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión</a></p>
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
      max-width: 460px;
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

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
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

    .success-message {
      text-align: center;
      padding: 1rem 0;
    }

    .success-message i {
      font-size: 3rem;
      color: var(--p-green-500);
      margin-bottom: 1rem;
    }

    .success-message h3 {
      color: var(--p-text-color);
      margin: 0 0 0.75rem;
    }

    .success-message p {
      color: var(--p-text-muted-color);
      margin: 0 0 1.5rem;
      line-height: 1.5;
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

    @media (max-width: 480px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .auth-card {
        padding: 1.5rem;
      }
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = signal(false);
  registered = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService
  ) {
    this.registerForm = this.fb.group({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
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
    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.registered.set(true);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
