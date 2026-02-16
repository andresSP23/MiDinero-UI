import { Component, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../features/auth/services/auth.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, ConfirmDialogModule],
  providers: [ConfirmationService],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed()">
      <div class="sidebar-header">
        <i class="pi pi-wallet sidebar-logo"></i>
        @if (!collapsed()) {
          <span class="sidebar-title">MiDinero</span>
        }
      </div>

      <nav class="sidebar-nav">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
          <i class="pi pi-home"></i>
          @if (!collapsed()) { <span>Dashboard</span> }
        </a>
        <a routerLink="/incomes" routerLinkActive="active" class="nav-item">
          <i class="pi pi-arrow-down-left"></i>
          @if (!collapsed()) { <span>Ingresos</span> }
        </a>
        <a routerLink="/expenses" routerLinkActive="active" class="nav-item">
          <i class="pi pi-arrow-up-right"></i>
          @if (!collapsed()) { <span>Gastos</span> }
        </a>
        <a routerLink="/categories" routerLinkActive="active" class="nav-item">
          <i class="pi pi-tags"></i>
          @if (!collapsed()) { <span>Categorías</span> }
        </a>
      </nav>

      <div class="sidebar-footer">
        @if (!collapsed() && authService.currentUser()) {
          <div class="user-profile">
            <div class="user-avatar">
              {{ authService.currentUser()?.firstName?.charAt(0) }}
            </div>
            <div class="user-info">
              <span class="user-name">{{ authService.currentUser()?.fullName }}</span>
              <span class="user-email">{{ authService.currentUser()?.email }}</span>
            </div>
          </div>
        }

        <a (click)="onLogout()" class="nav-item logout">
          <i class="pi pi-sign-out"></i>
          @if (!collapsed()) { <span>Cerrar Sesión</span> }
        </a>
      </div>

      <p-confirmDialog 
        styleClass="mm-dialog" 
        [closable]="false" 
      />
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      top: 1rem;
      left: 1rem;
      bottom: 1rem;
      width: 260px;
      background: #ffffff;
      border: 1px solid #f1f5f9;
      border-radius: 24px;
      display: flex;
      flex-direction: column;
      transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1000;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
    }

    .sidebar.collapsed {
      width: 80px;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.5rem;
      min-height: 80px;
    }

    .sidebar-logo {
      font-size: 2rem;
      color: #7e22ce;
    }

    .sidebar-title {
      font-size: 1.4rem;
      font-weight: 800;
      color: #111827;
      letter-spacing: -0.03em;
    }

    .sidebar-nav {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0.75rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.85rem 1rem;
      border-radius: 14px;
      color: #64748b;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.9rem;
      transition: all 0.2s;
      cursor: pointer;
    }

    .nav-item i {
      font-size: 1.25rem;
      width: 24px;
      text-align: center;
    }

    .nav-item:hover {
      background: #f8fafc;
      color: #111827;
    }

    .nav-item.active {
      background: #f3e8ff;
      color: #7e22ce;
    }

    .sidebar-footer {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 16px;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #6B21A8;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1rem;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .user-name {
      font-weight: 800;
      font-size: 0.85rem;
      color: #111827;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-email {
      font-size: 0.7rem;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .nav-item.logout {
      color: #94a3b8;
    }

    .nav-item.logout:hover {
      background: #f5f3ff;
      color: #6B21A8;
    }

    @media (max-width: 768px) {
      .sidebar {
        left: -100%;
        transition: left 0.4s ease;
      }

      .sidebar:not(.collapsed) {
        left: 1rem;
      }
    }
  `]
})
export class SidebarComponent {
  collapsed = model(false);

  constructor(
    public authService: AuthService,
    private confirmationService: ConfirmationService
  ) { }

  onLogout(): void {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas cerrar la sesión?',
      header: 'Confirmar Salida',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, Salir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'btn-mm-pri',
      rejectButtonStyleClass: 'btn-mm-sec',
      accept: () => {
        this.authService.logout();
      }
    });
  }
}
