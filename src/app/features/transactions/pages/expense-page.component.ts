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
  selector: 'app-expense-page',
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
        <h2>Gastos</h2>
        <p-button
          label="Nuevo Gasto"
          icon="pi pi-minus"
          severity="danger"
          (onClick)="openDialog()"
        />
      </div>

      <!-- Chart Section -->
      <div class="chart-card mb-4">
        <h3>Gastos Diarios</h3>
        @if (loadingChart()) {
          <p-skeleton width="100%" height="300px" borderRadius="12px" />
        } @else {
          <p-chart type="bar" [data]="chartData()" [options]="chartOptions" height="300px" />
        }
      </div>

      <!-- List Section -->
      <app-transaction-list filterType="EXPENSE" #list />

      <app-transaction-dialog
        [(visible)]="dialogVisible"
        [transaction]="null"
        [categories]="categories()"
        [defaultType]="'EXPENSE'"
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
export class ExpensePageComponent implements OnInit {
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

    this.dashboardService.getDailyExpense(
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
            label: 'Gastos',
            data: values,
            backgroundColor: 'rgba(239, 68, 68, 0.7)',
            borderColor: '#ef4444',
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
          detail: 'Gasto registrado correctamente',
          life: 3000
        });
        this.loadChart();
        window.location.reload();
      }
    });
  }
}
