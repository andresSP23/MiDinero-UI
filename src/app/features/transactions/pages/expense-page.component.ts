import { Component, OnInit, signal, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { DashboardService } from '../../dashboard/services/dashboard.service';
import { TransactionListComponent } from '../components/transaction-list.component';
import { TransactionDialogComponent } from '../components/transaction-dialog.component';
import { Transaction, TransactionRequest } from '../../../core/models/transaction.model';
import { TransactionType } from '../../../core/enums/transaction-type.enum';
import { TransactionService } from '../services/transaction.service';
import { MessageService } from 'primeng/api';
import { CategoryService } from '../../categories/services/category.service';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-expense-page',
  standalone: true,
  imports: [
    CommonModule,
    ChartModule,
    SkeletonModule,
    ButtonModule,
    TransactionListComponent,
    TransactionDialogComponent
  ],
  template: `
    <div class="page-container-mm">
      <!-- Header Row -->
      <div class="page-header-mm">
        <div class="title-group">
          <h2>Gastos</h2>
          <span class="badge-mm danger">Mensual</span>
        </div>
        <button class="action-btn-mm danger" (click)="openDialog()">
          <i class="pi pi-plus"></i> Nuevo Gasto
        </button>
      </div>

      <!-- Analysis Card -->
      <div class="block-card-mm mb-4">
        <div class="block-header-mm">
          <h3><i class="pi pi-chart-bar" style="color: #dc2626"></i> Análisis de Gastos</h3>
        </div>
        <div class="block-content-mm">
          @if (loadingChart()) {
            <p-skeleton width="100%" height="300px" borderRadius="16px" />
          } @else {
            <div class="chart-wrapper">
              <p-chart type="bar" [data]="chartData()" [options]="chartOptions" height="300px" />
            </div>
          }
        </div>
      </div>

      <!-- List Card -->
      <div class="block-card-mm">
        <div class="block-header-mm">
          <h3><i class="pi pi-list" style="color: #6B21A8"></i> Listado de Gastos</h3>
        </div>
        <div class="block-content-mm">
          <app-transaction-list [filterType]="TransactionType.EXPENSE" #list (dataChanged)="onDataChanged()" />
        </div>
      </div>

      <app-transaction-dialog
        [(visible)]="dialogVisible"
        [transaction]="selectedTransaction()"
        [categories]="categories()"
        [defaultType]="TransactionType.EXPENSE"
        (saved)="onSave($event)"
      />
    </div>
  `,
  styles: [`
    .page-container-mm {
      max-width: 1300px;
      margin: 0 auto;
      padding: 0;
    }

    .page-header-mm {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .title-group { display: flex; align-items: center; gap: 1rem; }
    .title-group h2 { font-size: 1.5rem; font-weight: 800; color: var(--p-text-color); margin: 0; }

    .badge-mm {
      padding: 0.25rem 0.75rem;
      border-radius: 100px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }
    .badge-mm.danger { background: #fee2e2; color: #991b1b; }

    .action-btn-mm {
      border: none;
      padding: 0.6rem 1.25rem;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .action-btn-mm:hover { transform: translateY(-1px); }
    .action-btn-mm.danger { background: #6B21A8; color: white; box-shadow: 0 4px 12px rgba(107, 33, 168, 0.2); }
    .action-btn-mm.danger:hover { background: #581c87; }

    .block-card-mm {
      background: var(--p-surface-card);
      border-radius: 24px;
      padding: 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      border: 1px solid var(--p-surface-border);
    }

    .block-header-mm {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .block-header-mm h3 { font-size: 1.1rem; font-weight: 800; color: var(--p-text-color); margin: 0; display: flex; align-items: center; gap: 0.75rem; }

    .chart-wrapper { width: 100%; height: 300px; }
    .mb-4 { margin-bottom: 1.5rem; }
  `]
})
export class ExpensePageComponent implements OnInit {
  protected readonly TransactionType = TransactionType;
  dialogVisible = false;
  chartData = signal<any>(null);
  loadingChart = signal(true);
  categories = signal<Category[]>([]);
  selectedTransaction = signal<Transaction | null>(null);

  chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280', font: { weight: '600', size: 11 } }
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f8fafc', drawTicks: false },
        ticks: {
          color: '#94a3b8',
          font: { weight: '600', size: 10 },
          callback: (value: number) => `$${value}`
        }
      }
    }
  };

  private dashboardService = inject(DashboardService);
  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);
  private messageService = inject(MessageService);

  @ViewChild('list') list!: TransactionListComponent;

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
            backgroundColor: '#8B5CF6',
            borderRadius: 6,
            barThickness: 14
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

  onDataChanged() {
    // Reload the chart to reflect changes
    this.loadChart();
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

        // When saving from the page-level dialog, we need to explicitly refresh the list
        // and the chart.
        this.list.refresh();
        this.loadChart();
      }
    });
  }
}
