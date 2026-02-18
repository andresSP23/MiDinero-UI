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
      margin-left: 280px;
      transition: margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      min-width: 0; /* Critical for permitting shrinking in flex container */
    }

    .layout.sidebar-collapsed .layout-main {
      margin-left: 100px;
    }

    .layout-content {
      flex: 1; /* Allow content to grow/fill */
      margin: 0.75rem 1.5rem 0.25rem;
      /* removed fixed height constraint */
    }

    @media (max-width: 768px) {
      .layout-main, .layout.sidebar-collapsed .layout-main {
        margin-left: 0;
      }
    }
  `]
})
export class LayoutComponent {
  collapsed = false;
}
