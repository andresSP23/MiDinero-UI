import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    InputTextModule,
    PasswordModule,
    ButtonModule
  ],
  template: `
    <div class="auth-container-mm">
      <div class="auth-card-mm">
        
        <div class="auth-header-mm">
          <div class="logo-box-mm">
            <i class="pi pi-lock-open"></i>
          </div>
          <h1>Restablecer Contraseña</h1>
          <p>Ingresa tu nueva contraseña</p>
        </div>

        @if (errorSignal()) {
          <div class="auth-error-banner-mm">
            <i class="pi pi-exclamation-triangle"></i>
            <span>{{ errorSignal() }}</span>
          </div>
        }

        <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="auth-form-mm">
          
          <!-- Token Input (Hidden or Readonly usually, but prompt asked for Input) -->
          <!-- We'll keep it as a hidden field if present in URL, or visible if not? 
               The prompt says: "Inputs: token (code of 6 digits), newPassword, confirmPassword".
               So I will make it an input, pre-filled if query param exists. -->
          <div class="form-field-mm">
            <label for="token">Código de Verificación</label>
            <div class="input-wrapper-mm">
              <i class="pi pi-key"></i>
              <input
                pInputText
                id="token"
                type="text"
                formControlName="token"
                placeholder="123456"
                class="w-full-mm"
              />
            </div>
            @if (resetForm.get('token')?.touched && resetForm.get('token')?.hasError('required')) {
              <small class="error-text-mm">El código es requerido</small>
            }
          </div>

          <div class="form-field-mm">
            <label for="newPassword">Nueva Contraseña</label>
            <div class="input-wrapper-mm">
              <i class="pi pi-lock"></i>
              <p-password
                id="newPassword"
                formControlName="newPassword"
                [toggleMask]="true"
                [feedback]="true"
                placeholder="••••••••"
                styleClass="w-full-mm"
                inputStyleClass="w-full-mm"
              />
            </div>
            @if (resetForm.get('newPassword')?.touched && resetForm.get('newPassword')?.hasError('required')) {
              <small class="error-text-mm">La contraseña es requerida</small>
            }
            @if (resetForm.get('newPassword')?.touched && resetForm.get('newPassword')?.hasError('minlength')) {
              <small class="error-text-mm">Mínimo 8 caracteres</small>
            }
          </div>

          <div class="form-field-mm">
            <label for="confirmPassword">Confirmar Contraseña</label>
            <div class="input-wrapper-mm">
              <i class="pi pi-lock"></i>
              <p-password
                id="confirmPassword"
                formControlName="confirmPassword"
                [toggleMask]="true"
                [feedback]="false"
                placeholder="••••••••"
                styleClass="w-full-mm"
                inputStyleClass="w-full-mm"
              />
            </div>
             @if (resetForm.hasError('passwordMismatch') && (resetForm.get('confirmPassword')?.touched || resetForm.get('newPassword')?.touched)) {
              <small class="error-text-mm">Las contraseñas no coinciden</small>
            }
          </div>

          <button
            type="submit"
            class="btn-mm-pri w-full-mm mt-2"
            [disabled]="resetForm.invalid || loading()"
          >
            @if (loading()) {
              <i class="pi pi-spin pi-spinner mr-2"></i> Procesando...
            } @else {
              Cambiar Contraseña
            }
          </button>
        </form>

        <div class="auth-footer-mm">
          <p>¿No tienes el código? <a routerLink="/forgot-password">Solicitar nuevo</a></p>
        </div>

      </div>
    </div>
  `,
  styles: [`
    /* Reusing styles from Login/ForgotPassword */
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
      width: 100%;
    }
    
    :host ::ng-deep .p-password {
      width: 100%;
      display: block;
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
  `]
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  loading = signal(false);
  errorSignal = signal('');

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.resetForm = this.fb.group({
      token: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    const tokenFromUrl = this.route.snapshot.queryParamMap.get('token');
    if (tokenFromUrl) {
      this.resetForm.patchValue({ token: tokenFromUrl });
    }
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.resetForm.invalid) return;

    this.loading.set(true);
    const { token, newPassword, confirmPassword } = this.resetForm.value;

    this.authService.resetPassword({ token, newPassword, confirmPassword }).subscribe({
      next: () => {
        this.loading.set(false);
        // Show success and redirect
        // Ideally show a toast, but for now redirect with a flag or just plain redirect
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading.set(false);
        const errorCode = err.error?.businessErrorCode || err.error?.errorCode || 0;

        // Map standardized errors
        switch (errorCode) {
          case 5000:
            this.errorSignal.set('El código es incorrecto. Verifica e intenta de nuevo.');
            break;
          case 5001:
            this.errorSignal.set('El código ha vencido. Solicita uno nuevo.');
            break;
          case 5002:
            this.errorSignal.set('Las contraseñas no coinciden.');
            break;
          default:
            this.errorSignal.set('Error al restablecer contraseña. Intenta nuevamente.');
        }
      }
    });
  }
}
