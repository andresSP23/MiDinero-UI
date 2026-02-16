import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthService } from '../services/auth.service';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-activate-account',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, ProgressSpinnerModule, InputTextModule, FormsModule],
  template: `
    <div class="auth-container-mm">
      <div class="auth-card-mm">
        <div class="auth-header-mm">
          <div class="logo-box-mm">
            <i class="pi pi-wallet"></i>
          </div>
          <h1>MiDinero</h1>
          <p>Activación de cuenta</p>
        </div>
 
        @if (loading()) {
          <div class="status-box-mm">
            <p-progressSpinner strokeWidth="4" fill="transparent" />
            <p>Activando tu cuenta...</p>
          </div>
        } @else if (success()) {
          <div class="status-box-mm success">
            <div class="status-icon-box success">
              <i class="pi pi-check-circle"></i>
            </div>
            <h3>¡Cuenta activada!</h3>
            <p>Tu cuenta ha sido activada exitosamente. Ya puedes iniciar sesión y empezar a gestionar tus finanzas.</p>
            <button
              class="btn-mm-pri w-full-mm"
              routerLink="/login"
            >
              <i class="pi pi-sign-in mr-2"></i> Iniciar Sesión
            </button>
          </div>
        } @else {
          <div class="status-box-mm">
            @if (errorMessage()) {
              <div class="status-icon-box error">
                <i class="pi pi-exclamation-circle"></i>
              </div>
              <h3>MeyDay</h3>
              <p>{{ errorMessage() }}</p>
            } @else {
              <p class="instr-mm">Ingresa el código de activación que enviamos a tu correo electrónico.</p>
            }
 
            <div class="form-field-mm text-left-mm">
              <label for="token">Código de Activación</label>
              <div class="input-wrapper-mm">
                <i class="pi pi-key"></i>
                <input
                  pInputText
                  id="token"
                  [(ngModel)]="manualToken"
                  placeholder="Ej: 123456"
                  class="w-full-mm"
                  (keyup.enter)="onActivate()"
                />
              </div>
            </div>
 
            <button
              class="btn-mm-pri w-full-mm mt-4"
              (click)="onActivate()"
              [disabled]="!manualToken || loading()"
            >
              @if (loading()) {
                <i class="pi pi-spin pi-spinner mr-2"></i> Procesando...
              } @else {
                <i class="pi pi-verified mr-2"></i> Activar Cuenta
              }
            </button>
 
            <div class="auth-footer-mm">
              <a routerLink="/login">Volver al inicio</a>
            </div>
          </div>
        }
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
      margin-bottom: 2rem;
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
 
    .status-box-mm {
      text-align: center;
      padding: 1rem 0;
    }
 
    .status-icon-box {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      font-size: 2.5rem;
    }
 
    .status-icon-box.success { background: #ecfdf5; color: #059669; }
    .status-icon-box.error { background: #fee2e2; color: #dc2626; }
 
    .status-box-mm h3 {
      font-size: 1.5rem;
      font-weight: 800;
      color: #111827;
      margin-bottom: 0.75rem;
    }
 
    .status-box-mm p {
      color: #64748b;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }
 
    .instr-mm {
      font-size: 0.9rem;
      color: #64748b;
      margin-bottom: 2rem !important;
    }
 
    .form-field-mm {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
 
    .text-left-mm { text-align: left; }
 
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
 
    .w-full-mm { width: 100%; }
    .mt-4 { margin-top: 1rem; }
    .mr-2 { margin-right: 0.5rem; }
 
    .auth-footer-mm {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #f1f5f9;
    }
 
    .auth-footer-mm a {
      color: #64748b;
      font-size: 0.9rem;
      font-weight: 600;
      text-decoration: none;
    }
 
    .auth-footer-mm a:hover { color: #6B21A8; }
  `]
})
export class ActivateAccountComponent implements OnInit {
  loading = signal(false);
  success = signal(false);
  errorMessage = signal('');
  manualToken = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.activate(token);
    }
  }

  onActivate(): void {
    if (this.manualToken) {
      this.activate(this.manualToken);
    }
  }

  private activate(token: string): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.activateAccount(token).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: () => {
        this.loading.set(false);
        this.success.set(false);
        this.errorMessage.set('El código ingresado no es válido o ha expirado. Por favor, inténtalo de nuevo.');
      }
    });
  }
}
