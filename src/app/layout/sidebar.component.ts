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
        <span class="sidebar-title">MiDinero</span>
      </div>

      <nav class="sidebar-nav">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
          <i class="pi pi-home"></i>
          <span class="link-text">Dashboard</span>
        </a>
        <a routerLink="/incomes" routerLinkActive="active" class="nav-item">
          <i class="pi pi-arrow-down-left"></i>
          <span class="link-text">Ingresos</span>
        </a>
        <a routerLink="/expenses" routerLinkActive="active" class="nav-item">
          <i class="pi pi-arrow-up-right"></i>
          <span class="link-text">Gastos</span>
        </a>
        <a routerLink="/categories" routerLinkActive="active" class="nav-item">
          <i class="pi pi-tags"></i>
          <span class="link-text">Categorías</span>
        </a>
        <!-- Mobile Logout -->
         <a (click)="onLogout()" class="nav-item logout md:hidden">
            <i class="pi pi-sign-out"></i>
            <span class="link-text">Salir</span>
         </a>
      </nav>

      <div class="sidebar-footer">
        @if (authService.currentUser()) {
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
          <span class="link-text">Cerrar Sesión</span>
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
      background: var(--p-surface-card);
      border: 1px solid #e2e8f0;
      border-radius: 24px;
      display: flex;
      flex-direction: column;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
      overflow: hidden;
      border-bottom: 1px solid #f1eeec;
    }

    .sidebar-logo {
      font-size: 2rem;
      color: #6B21A8; /* Solid Brand Purple */
      flex-shrink: 0;
    }

    .sidebar-title {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--p-text-color);
      letter-spacing: -0.03em;
      white-space: nowrap;
      opacity: 1;
      transition: opacity 0.2s;
    }

    /* Hide text when collapsed on Desktop */
    .sidebar.collapsed .sidebar-title,
    .sidebar.collapsed .link-text,
    .sidebar.collapsed .user-info {
       display: none; 
    }

    .sidebar.collapsed .sidebar-footer {
      padding: 0.75rem 0.5rem;
      align-items: center;
    }

    .sidebar.collapsed .user-profile {
      justify-content: center;
      padding: 0.6rem;
    }

    .sidebar.collapsed .nav-item.logout {
      justify-content: center;
      padding: 0.85rem 0;
    }

    .sidebar-nav {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0.75rem;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.85rem 1rem;
      border-radius: 14px;
      color: var(--p-text-muted-color);
      text-decoration: none;
      font-weight: 700;
      font-size: 0.9rem;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      white-space: nowrap;
      position: relative;
    }

    .nav-item i {
      font-size: 1.25rem;
      width: 24px;
      text-align: center;
      flex-shrink: 0;
      transition: transform 0.2s;
    }

    .nav-item:hover {
      background: #faf5ff;
      color: var(--p-text-color);
    }

    .nav-item:hover i {
      transform: scale(1.1);
    }

    .nav-item.active {
      background: #f3e8ff;
      color: #6B21A8;
      font-weight: 800;
      border-left: 3px solid #6B21A8;
      padding-left: calc(1rem - 3px);
    }

    .nav-item.active i {
      color: #6B21A8;
    }

    .sidebar-footer {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      overflow: hidden;
      border-top: 1px solid #f1eeec;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem;
      background: linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%);
      border: 1px solid #e9d5ff;
      border-radius: 16px;
      transition: border-color 0.2s;
    }

    .user-profile:hover {
      border-color: #d8b4fe;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: var(--p-money-purple);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1rem;
      flex-shrink: 0;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .user-name {
      font-weight: 800;
      font-size: 0.85rem;
      color: var(--p-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-email {
      font-size: 0.7rem;
      color: var(--p-text-muted-color);
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

    /* ===== MOBILE BOTTOM NAV ===== */
    @media (max-width: 768px) {
      .sidebar, .sidebar.collapsed {
        left: 0;
        bottom: 0;
        top: auto;
        width: 100%;
        height: auto;
        border-radius: 24px 24px 0 0;
        flex-direction: row;
        padding: 0.5rem 1rem 1.5rem; /* Extra padding for safe area */
        border: none;
        border-top: 1px solid #e2e8f0;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
      }

      .sidebar-header {
        display: none;
      }

      .sidebar-footer {
        display: none;
      }

      .sidebar-nav {
        flex-direction: row;
        justify-content: space-around; /* Distribute items evenly */
        padding: 0;
        overflow: visible;
      }

      .nav-item {
        flex-direction: column;
        gap: 0.25rem;
        padding: 0.5rem;
        font-size: 0.7rem;
        border-radius: 12px;
        flex: 1; /* Equal width targets */
        justify-content: center;
      }

      .nav-item i {
        font-size: 1.4rem;
        margin-bottom: 2px;
      }

      /* Force show text on mobile (optional, or hide if preferred) */
      .link-text {
        display: block !important;
        font-size: 0.7rem;
      }

      /* Add Logout as a simple icon in the nav list if needed, 
         but for now we'll stick to the main 4 links. 
         User can use the top profile menu (tbd) or we add a specific logout item here 
      */
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
