import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { NavbarComponent } from './navbar.component';

@Component({
    selector: 'app-layout',
    imports: [RouterOutlet, SidebarComponent, NavbarComponent],
    template: `
    <div class="layout" [class.sidebar-collapsed]="collapsed">
      <app-sidebar [(collapsed)]="collapsed" />
      <div class="layout-main">
        <app-navbar (toggleSidebar)="collapsed = !collapsed" />
        <main class="layout-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
    styles: [`
    .layout {
      display: flex;
      min-height: 100vh;
      background: var(--p-surface-ground);
    }

    .layout-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      margin-left: 260px;
      transition: margin-left 0.3s ease;
    }

    .layout.sidebar-collapsed .layout-main {
      margin-left: 70px;
    }

    .layout-content {
      flex: 1;
      padding: 1.5rem;
      overflow-y: auto;
    }

    @media (max-width: 768px) {
      .layout-main {
        margin-left: 0;
      }

      .layout.sidebar-collapsed .layout-main {
        margin-left: 0;
      }
    }
  `]
})
export class LayoutComponent {
    collapsed = false;
}
