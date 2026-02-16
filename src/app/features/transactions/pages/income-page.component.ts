import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { DashboardService } from '../../dashboard/services/dashboard.service';
import { TransactionListComponent } from '../components/transaction-list.component';
import { TransactionDialogComponent } from '../components/transaction-dialog.component';
import { Transaction, TransactionRequest } from '../../../core/models/transaction.model';
import { TransactionService } from '../services/transaction.service';
import { MessageService } from 'primeng/api';
import { CategoryService } from '../../categories/services/category.service';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-income-page',
  imports: [
    CommonModule,
    ChartModule,
    SkeletonModule,
    ButtonModule,
    TransactionListComponent,
    TransactionDialogComponent
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2>Ingresos</h2>
        <p-button
          label="Nuevo Ingreso"
          icon="pi pi-plus"
          severity="success"
          (onClick)="openDialog()"
        />
      </div>

      <!-- Chart Section -->
      <div class="chart-card mb-4">
        <h3>Ingresos Diarios</h3>
        @if (loadingChart()) {
          <p-skeleton width="100%" height="300px" borderRadius="12px" />
        } @else {
          <p-chart type="bar" [data]="chartData()" [options]="chartOptions" height="300px" />
        }
      </div>

      <!-- List Section -->
      <app-transaction-list filterType="INCOME" #list />

      <app-transaction-dialog
        [(visible)]="dialogVisible"
        [transaction]="null"
        [categories]="categories()"
        [defaultType]="'INCOME'"
        (saved)="onSave($event)"
      />
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .page-header h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--p-text-color);
      margin: 0;
    }
    .chart-card {
      background: var(--p-surface-card);
      border: 1px solid var(--p-surface-border);
      border-radius: 14px;
      padding: 1.5rem;
    }
    .chart-card h3 {
      font-size: 1rem;
      font-weight: 600;
      color: var(--p-text-color);
      margin: 0 0 1rem;
    }
    .mb-4 { margin-bottom: 1.5rem; }
  `]
})
export class IncomePageComponent implements OnInit {
  chartData = signal<any>(null);
  loadingChart = signal(true);
  dialogVisible = false;
  categories = signal<Category[]>([]);

  chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        ticks: { callback: (value: number) => `$${value}` }
      }
    }
  };

  constructor(
    private dashboardService: DashboardService,
    private transactionService: TransactionService,
    private categoryService: CategoryService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.loadChart();
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getAll(0, 100).subscribe({
      next: res => this.categories.set(res.content)
    });
  }

  loadChart() {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.dashboardService.getDailyIncome(
      from.toISOString().split('T')[0],
      to.toISOString().split('T')[0]
    ).subscribe({
      next: (data) => {
        const labels = data.chart.map(e => {
          const parts = e.date.split('-');
          return `${parts[2]}/${parts[1]}`;
        });
        const values = data.chart.map(e => e.total);

        this.chartData.set({
          labels,
          datasets: [{
            label: 'Ingresos',
            data: values,
            backgroundColor: 'rgba(34, 197, 94, 0.7)',
            borderColor: '#22c55e',
            borderWidth: 2,
            borderRadius: 6
          }]
        });
        this.loadingChart.set(false);
      },
      error: () => this.loadingChart.set(false)
    });
  }

  openDialog() {
    this.dialogVisible = true;
  }

  onSave(request: TransactionRequest) {
    this.transactionService.create(request).subscribe({
      next: () => {
        this.dialogVisible = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Ingreso registrado correctamente',
          life: 3000
        });
        this.loadChart(); // Reload chart
        // Note: The list component will need to refresh too. 
        // We might need a cleaner way to trigger list refresh, but for now the list handles its own state mostly.
        // A better way would be using a shared service or ViewChild to call refresh.
        window.location.reload(); // Temporary quick fix to ensure both update, or we can use ViewChild.
      }
    });
  }
}
