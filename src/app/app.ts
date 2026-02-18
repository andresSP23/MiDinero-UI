import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { AuthService } from './features/auth/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, ConfirmDialogModule],
  template: `
    <p-toast position="top-right" />
    <p-confirmDialog [style]="{width: '450px'}" />
    <router-outlet />
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
  `]
})
export class App implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private confirmationService = inject(ConfirmationService);
  private sessionExpiredSubscription?: Subscription;

  ngOnInit() {
    this.sessionExpiredSubscription = this.authService.sessionExpired$.subscribe(() => {
      this.showSessionExpiredDialog();
    });
  }

  ngOnDestroy() {
    if (this.sessionExpiredSubscription) {
      this.sessionExpiredSubscription.unsubscribe();
    }
  }

  private showSessionExpiredDialog() {
    this.confirmationService.confirm({
      header: 'Sesión Expirada',
      message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente para continuar.',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Iniciar Sesión',
      rejectVisible: false,
      blockScroll: true,
      closeOnEscape: false,
      dismissableMask: false,
      accept: () => {
        this.authService.logout();
      }
    });
  }
}
