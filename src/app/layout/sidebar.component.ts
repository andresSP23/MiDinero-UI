import { Component, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../features/auth/services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
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
          <i class="pi pi-arrow-down-left" style="color: var(--p-green-500)"></i>
          @if (!collapsed()) { <span>Ingresos</span> }
        </a>
        <a routerLink="/expenses" routerLinkActive="active" class="nav-item">
          <i class="pi pi-arrow-up-right" style="color: var(--p-red-500)"></i>
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
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 260px;
      background: var(--p-surface-card);
      border-right: 1px solid var(--p-surface-border);
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease;
      z-index: 100;
      overflow: hidden;
    }

    .sidebar.collapsed {
      width: 70px;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.25rem;
      border-bottom: 1px solid var(--p-surface-border);
      min-height: 64px;
    }

    .sidebar-logo {
      font-size: 1.75rem;
      color: var(--p-primary-color);
      flex-shrink: 0;
    }

    .sidebar-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--p-text-color);
      white-space: nowrap;
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
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      color: var(--p-text-muted-color);
      text-decoration: none;
      font-weight: 500;
      font-size: 0.925rem;
      transition: all 0.2s ease;
      cursor: pointer;
      white-space: nowrap;
    }

    .nav-item i {
      font-size: 1.15rem;
      flex-shrink: 0;
      width: 20px;
      text-align: center;
    }

    .nav-item:hover {
      background: var(--p-surface-hover);
      color: var(--p-text-color);
    }

    .nav-item.active {
      background: var(--p-primary-color);
      color: white;
    }

    .sidebar-footer {
      padding: 0.75rem;
      border-top: 1px solid var(--p-surface-border);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      margin-bottom: 0.5rem;
      background: var(--p-surface-ground);
      border-radius: 8px;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--p-primary-color);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.875rem;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .user-name {
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--p-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-email {
      font-size: 0.75rem;
      color: var(--p-text-muted-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .nav-item.logout:hover {
      background: var(--p-red-50);
      color: var(--p-red-500);
    }

    :host-context(.dark-mode) .nav-item.logout:hover {
      background: rgba(239, 68, 68, 0.1);
    }

    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
      }

      .sidebar:not(.collapsed) {
        transform: translateX(0);
        box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
      }
    }
  `]
})
export class SidebarComponent {
  collapsed = model(false);

  constructor(public authService: AuthService) { }

  onLogout(): void {
    this.authService.logout();
  }
}
