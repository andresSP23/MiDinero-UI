import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, ButtonModule, ToggleSwitchModule, FormsModule],
  template: `
    <header class="navbar">
      <div class="navbar-left">
        <p-button
          icon="pi pi-bars"
          [text]="true"
          [rounded]="true"
          severity="secondary"
          (onClick)="toggleSidebar.emit()"
        />
      </div>

      <div class="navbar-right">
        <div class="theme-toggle">
          <i class="pi pi-sun"></i>
          <p-toggleSwitch [(ngModel)]="darkMode" (ngModelChange)="onThemeToggle()" />
          <i class="pi pi-moon"></i>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.25rem;
      background: #ffffff;
      border: 1px solid #f1f5f9;
      border-radius: 20px;
      height: 60px;
      margin: 0.75rem 1.5rem 0.25rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
    }

    .navbar-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .navbar-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .theme-toggle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .theme-toggle i {
      font-size: 1rem;
      color: var(--p-text-muted-color);
    }
  `]
})
export class NavbarComponent {
  toggleSidebar = output();
  darkMode = signal(false);

  constructor() {
    const saved = localStorage.getItem('midinero_theme');
    if (saved === 'dark') {
      this.darkMode.set(true);
      document.documentElement.classList.add('dark-mode');
    }
  }

  onThemeToggle(): void {
    const isDark = this.darkMode();
    if (isDark) {
      document.documentElement.classList.add('dark-mode');
      localStorage.setItem('midinero_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-mode');
      localStorage.setItem('midinero_theme', 'light');
    }
  }
}
