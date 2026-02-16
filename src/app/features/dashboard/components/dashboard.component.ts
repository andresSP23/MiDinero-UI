import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { DashboardService } from '../services/dashboard.service';
import { BalanceSummary, RecentTransaction, DailyChartEntry } from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    ChartModule,
    TableModule,
    ButtonModule,
    SkeletonModule,
    CardModule,
  ],
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <h2>Dashboard</h2>
        <div class="header-actions">
          <p-button
            label="Nuevo Ingreso"
            icon="pi pi-plus"
            severity="success"
            size="small"
            (onClick)="navigateTo('/transactions', 'INCOME')"
          />
          <p-button
            label="Nuevo Gasto"
            icon="pi pi-plus"
            severity="danger"
            size="small"
            (onClick)="navigateTo('/transactions', 'EXPENSE')"
          />
          <p-button
            label="Exportar"
            icon="pi pi-download"
            severity="secondary"
            size="small"
            [outlined]="true"
            (onClick)="exportData()"
          />
        </div>
      </div>

      <!-- Summary Cards -->
      @if (loadingSummary()) {
        <div class="summary-cards">
          @for (i of [1,2,3]; track i) {
            <div class="summary-card">
              <p-skeleton width="100%" height="100px" borderRadius="12px" />
            </div>
          }
        </div>
      } @else {
        <div class="summary-cards">
          <div class="summary-card income">
            <div class="card-icon">
              <i class="pi pi-arrow-down"></i>
            </div>
            <div class="card-info">
              <span class="card-label">Ingresos</span>
              <span class="card-value">{{ summary()?.totalIncomes | currency:'USD':'symbol':'1.2-2' }}</span>
            </div>
          </div>

          <div class="summary-card expense">
            <div class="card-icon">
              <i class="pi pi-arrow-up"></i>
            </div>
            <div class="card-info">
              <span class="card-label">Gastos</span>
              <span class="card-value">{{ summary()?.totalExpenses | currency:'USD':'symbol':'1.2-2' }}</span>
            </div>
          </div>

          <div class="summary-card balance">
            <div class="card-icon">
              <i class="pi pi-wallet"></i>
            </div>
            <div class="card-info">
              <span class="card-label">Balance</span>
              <span class="card-value">{{ summary()?.balance | currency:'USD':'symbol':'1.2-2' }}</span>
            </div>
          </div>
        </div>
      }

      <!-- Chart Section -->
      <div class="chart-section">
        <div class="section-card">
          <h3>Ingresos vs Gastos (Últimos 30 días)</h3>
          @if (loadingChart()) {
            <p-skeleton width="100%" height="300px" borderRadius="12px" />
          } @else {
            <p-chart type="bar" [data]="chartData()" [options]="chartOptions" height="300px" />
          }
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="recent-section">
        <div class="section-card">
          <h3><i class="pi pi-arrow-down" style="color: var(--p-green-500)"></i> Últimos Ingresos</h3>
          @if (loadingRecent()) {
            @for (i of [1,2,3]; track i) {
              <p-skeleton width="100%" height="40px" styleClass="mb-2" />
            }
          } @else {
            <p-table [value]="recentIncomes()" [rows]="5" styleClass="p-datatable-sm p-datatable-striped">
              <ng-template #header>
                <tr>
                  <th>Descripción</th>
                  <th>Categoría</th>
                  <th style="text-align:right">Monto</th>
                  <th>Fecha</th>
                </tr>
              </ng-template>
              <ng-template #body let-item>
                <tr>
                  <td>{{ item.description }}</td>
                  <td><span class="category-tag">{{ item.categoryName }}</span></td>
                  <td style="text-align:right; color: var(--p-green-500); font-weight:600">
                    +{{ item.total | currency:'USD':'symbol':'1.2-2' }}
                  </td>
                  <td>{{ item.createdAt | date:'dd/MM/yyyy' }}</td>
                </tr>
              </ng-template>
              <ng-template #emptymessage>
                <tr><td colspan="4" class="text-center">No hay ingresos recientes</td></tr>
              </ng-template>
            </p-table>
          }
        </div>

        <div class="section-card">
          <h3><i class="pi pi-arrow-up" style="color: var(--p-red-500)"></i> Últimos Gastos</h3>
          @if (loadingRecent()) {
            @for (i of [1,2,3]; track i) {
              <p-skeleton width="100%" height="40px" styleClass="mb-2" />
            }
          } @else {
            <p-table [value]="recentExpenses()" [rows]="5" styleClass="p-datatable-sm p-datatable-striped">
              <ng-template #header>
                <tr>
                  <th>Descripción</th>
                  <th>Categoría</th>
                  <th style="text-align:right">Monto</th>
                  <th>Fecha</th>
                </tr>
              </ng-template>
              <ng-template #body let-item>
                <tr>
                  <td>{{ item.description }}</td>
                  <td><span class="category-tag">{{ item.categoryName }}</span></td>
                  <td style="text-align:right; color: var(--p-red-500); font-weight:600">
                    -{{ item.total | currency:'USD':'symbol':'1.2-2' }}
                  </td>
                  <td>{{ item.createdAt | date:'dd/MM/yyyy' }}</td>
                </tr>
              </ng-template>
              <ng-template #emptymessage>
                <tr><td colspan="4" class="text-center">No hay gastos recientes</td></tr>
              </ng-template>
            </p-table>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .dashboard-header h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--p-text-color);
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    /* Summary Cards */
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .summary-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      border-radius: 14px;
      background: var(--p-surface-card);
      border: 1px solid var(--p-surface-border);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .summary-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }

    .card-icon {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .card-icon i {
      font-size: 1.5rem;
      color: white;
    }

    .income .card-icon { background: linear-gradient(135deg, #22c55e, #16a34a); }
    .expense .card-icon { background: linear-gradient(135deg, #ef4444, #dc2626); }
    .balance .card-icon { background: linear-gradient(135deg, #3b82f6, #2563eb); }

    .card-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .card-label {
      font-size: 0.85rem;
      color: var(--p-text-muted-color);
      font-weight: 500;
    }

    .card-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--p-text-color);
    }

    /* Chart */
    .chart-section {
      margin-bottom: 1.5rem;
    }

    .section-card {
      background: var(--p-surface-card);
      border: 1px solid var(--p-surface-border);
      border-radius: 14px;
      padding: 1.5rem;
    }

    .section-card h3 {
      font-size: 1rem;
      font-weight: 600;
      color: var(--p-text-color);
      margin: 0 0 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* Recent */
    .recent-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .category-tag {
      background: var(--p-surface-100);
      color: var(--p-text-muted-color);
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .text-center {
      text-align: center;
      color: var(--p-text-muted-color);
      padding: 1.5rem !important;
    }

    .mb-2 {
      margin-bottom: 0.5rem;
    }

    @media (max-width: 768px) {
      .summary-cards {
        grid-template-columns: 1fr;
      }

      .recent-section {
        grid-template-columns: 1fr;
      }

      .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  summary = signal<BalanceSummary | null>(null);
  recentIncomes = signal<RecentTransaction[]>([]);
  recentExpenses = signal<RecentTransaction[]>([]);
  chartData = signal<any>(null);

  loadingSummary = signal(true);
  loadingRecent = signal(true);
  loadingChart = signal(true);

  chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { usePointStyle: true, padding: 20 }
      }
    },
    scales: {
      x: {
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => `$${value}`
        }
      }
    }
  };

  constructor(
    private dashboardService: DashboardService,
    private messageService: MessageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadSummary();
    this.loadRecent();
    this.loadChart();
  }

  private loadSummary(): void {
    this.dashboardService.getBalanceSummary().subscribe({
      next: data => {
        this.summary.set(data);
        this.loadingSummary.set(false);
      },
      error: () => this.loadingSummary.set(false)
    });
  }

  private loadRecent(): void {
    forkJoin({
      incomes: this.dashboardService.getRecentIncomes(5),
      expenses: this.dashboardService.getRecentExpenses(5)
    }).subscribe({
      next: ({ incomes, expenses }) => {
        this.recentIncomes.set(incomes);
        this.recentExpenses.set(expenses);
        this.loadingRecent.set(false);
      },
      error: () => this.loadingRecent.set(false)
    });
  }

  private loadChart(): void {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const fromStr = from.toISOString().split('T')[0];
    const toStr = to.toISOString().split('T')[0];

    forkJoin({
      income: this.dashboardService.getDailyIncome(fromStr, toStr),
      expense: this.dashboardService.getDailyExpense(fromStr, toStr)
    }).subscribe({
      next: ({ income, expense }) => {
        const allDates = new Set([
          ...income.chart.map(e => e.date),
          ...expense.chart.map(e => e.date)
        ]);
        const sortedDates = Array.from(allDates).sort();

        const incomeMap = new Map(income.chart.map(e => [e.date, e.total]));
        const expenseMap = new Map(expense.chart.map(e => [e.date, e.total]));

        this.chartData.set({
          labels: sortedDates.map(d => {
            const parts = d.split('-');
            return `${parts[2]}/${parts[1]}`;
          }),
          datasets: [
            {
              label: 'Ingresos',
              data: sortedDates.map(d => incomeMap.get(d) || 0),
              backgroundColor: 'rgba(34, 197, 94, 0.7)',
              borderColor: '#22c55e',
              borderWidth: 2,
              borderRadius: 6,
            },
            {
              label: 'Gastos',
              data: sortedDates.map(d => expenseMap.get(d) || 0),
              backgroundColor: 'rgba(239, 68, 68, 0.7)',
              borderColor: '#ef4444',
              borderWidth: 2,
              borderRadius: 6,
            }
          ]
        });
        this.loadingChart.set(false);
      },
      error: () => this.loadingChart.set(false)
    });
  }

  navigateTo(path: string, type?: string): void {
    this.router.navigate([path], type ? { queryParams: { type } } : undefined);
  }

  exportData(): void {
    this.dashboardService.exportIncomes().subscribe(blob => {
      this.downloadFile(blob, 'ingresos.xlsx');
    });
    this.dashboardService.exportExpenses().subscribe(blob => {
      this.downloadFile(blob, 'gastos.xlsx');
    });
    this.messageService.add({
      severity: 'info',
      summary: 'Exportando',
      detail: 'Los archivos se están descargando...',
      life: 3000
    });
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
