import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, PercentPipe } from '@angular/common';
import { Router } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { DashboardService } from '../services/dashboard.service';
import { BalanceSummary, RecentTransaction } from '../../../core/models/dashboard.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    PercentPipe,
    ChartModule,
    TableModule,
    ButtonModule,
    SkeletonModule
  ],
  template: `
    <div class="dashboard-mm">
      <!-- Summary Row -->
      <div class="summary-grid">
        <div class="summary-card-mm">
          <div class="icon-box-mm balance-box">
            <i class="pi pi-wallet"></i>
          </div>
          <div class="info-mm">
            <span class="label-mm">Balance Total</span>
            <span class="value-mm">{{ summary()?.balance || 0 | currency:'USD':'symbol':'1.0-2' }}</span>
          </div>
        </div>

        <div class="summary-card-mm">
          <div class="icon-box-mm income-box">
            <i class="pi pi-arrow-down-left"></i>
          </div>
          <div class="info-mm">
            <span class="label-mm">Total Ingresos</span>
            <span class="value-mm">{{ summary()?.totalIncomes || 0 | currency:'USD':'symbol':'1.0-2' }}</span>
          </div>
        </div>

        <div class="summary-card-mm">
          <div class="icon-box-mm expense-box">
            <i class="pi pi-arrow-up-right"></i>
          </div>
          <div class="info-mm">
            <span class="label-mm">Total Gastos</span>
            <span class="value-mm">{{ summary()?.totalExpenses || 0 | currency:'USD':'symbol':'1.0-2' }}</span>
          </div>
        </div>
      </div>

      <!-- Charts Section (Modern Split) -->
      <div class="charts-grid-mm mb-4">
        <!-- Line Chart (Evolution) -->
        <div class="block-card-mm chart-card-mm">
          <div class="block-header-mm">
            <h3><i class="pi pi-chart-line" style="color: #6B21A8"></i> Evolución de Fondos</h3>
          </div>
          <div class="block-content-mm">
            @if (loadingChart()) {
              <p-skeleton width="100%" height="280px" borderRadius="16px" />
            } @else {
              <div class="chart-container-mm">
                <p-chart type="line" [data]="lineChartData()" [options]="lineOptions" height="280px" />
              </div>
            }
          </div>
        </div>

        <!-- Doughnut Chart (Ratio) -->
        <div class="block-card-mm chart-card-mm">
          <div class="block-header-mm">
            <h3><i class="pi pi-percentage" style="color: #6B21A8"></i> Análisis de Ahorro</h3>
          </div>
          <div class="block-content-mm doughnut-flex">
            @if (loadingSummary()) {
              <p-skeleton shape="circle" size="180px" />
            } @else {
              <div class="doughnut-container">
                <p-chart type="doughnut" [data]="doughnutData()" [options]="doughnutOptions" height="200px" />
                <div class="doughnut-center-text">
                   <span class="center-label">Ahorro</span>
                   <span class="center-val">{{ getSavingsPercentage() | percent:'1.0-0' }}</span>
                </div>
              </div>
              <div class="doughnut-custom-legend">
                <div class="leg-item"><span class="swatch income"></span> Ingresos</div>
                <div class="leg-item"><span class="swatch expense"></span> Gastos</div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Bottom Row Split -->
      <div class="btm-grid">
        <div class="block-card-mm list-card">
          <div class="block-header-mm">
            <h3><i class="pi pi-history" style="color: #6B21A8"></i> Gastos Recientes</h3>
            <button class="more-btn" (click)="navigateTo('/expenses')">Detalles</button>
          </div>
          <div class="block-content-mm">
             @if (loadingRecent()) {
               @for (i of [1,2,3,4]; track i) { <p-skeleton width="100%" height="40px" styleClass="mb-2" /> }
             } @else if (recentExpenses().length === 0) {
               <div class="mm-empty-small">No hay datos registrados</div>
             } @else {
               <p-table [value]="recentExpenses().slice(0, 5)" styleClass="p-datatable-sm no-border-table">
                 <ng-template #header></ng-template>
                 <ng-template #body let-item>
                   <tr class="mini-row">
                     <td class="desc-mm">{{ item.description }}</td>
                     <td class="text-right text-brand-sec font-bold">-{{ item.total | currency:'USD':'symbol':'1.2-2' }}</td>
                   </tr>
                 </ng-template>
               </p-table>
             }
          </div>
        </div>

        <div class="block-card-mm list-card">
          <div class="block-header-mm">
            <h3><i class="pi pi-history" style="color: #6B21A8"></i> Ingresos Recientes</h3>
            <button class="more-btn" (click)="navigateTo('/income')">Detalles</button>
          </div>
          <div class="block-content-mm">
             @if (loadingRecent()) {
                @for (i of [1,2,3,4]; track i) { <p-skeleton width="100%" height="40px" styleClass="mb-2" /> }
             } @else if (recentIncomes().length === 0) {
               <div class="mm-empty-small">No hay datos registrados</div>
             } @else {
               <p-table [value]="recentIncomes().slice(0, 5)" styleClass="p-datatable-sm no-border-table">
                 <ng-template #header></ng-template>
                 <ng-template #body let-item>
                   <tr class="mini-row">
                     <td class="desc-mm">{{ item.description }}</td>
                     <td class="text-right text-brand font-bold">+{{ item.total | currency:'USD':'symbol':'1.2-2' }}</td>
                   </tr>
                 </ng-template>
               </p-table>
             }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-mm { max-width: 1300px; margin: 0 auto; padding: 0.5rem 0; }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .summary-card-mm {
      background: var(--p-surface-card);
      border-radius: 20px;
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      border: 1px solid var(--p-surface-border);
      box-shadow: 0 1px 2px rgba(0,0,0,0.02);
      min-width: 0; /* Ensures grid item can shrink */
    }

    .icon-box-mm {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.15rem;
      flex-shrink: 0; /* Prevent icon box from shrinking */
    }

    .balance-box { background: #f5f3ff; color: #6B21A8; }
    .income-box { background: #faf5ff; color: #7e22ce; }
    .expense-box { background: #fafafa; color: #64748b; }

    .info-mm { display: flex; flex-direction: column; gap: 0.1rem; overflow: hidden; /* Prevent text overflow */ }
    .label-mm { font-size: 0.7rem; color: var(--p-text-muted-color); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .value-mm { font-size: 1.5rem; font-weight: 800; color: var(--p-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .charts-grid-mm {
      display: grid;
      grid-template-columns: 1.8fr 1.2fr;
      gap: 1.5rem;
    }

    .block-card-mm {
      background: var(--p-surface-card);
      border-radius: 28px;
      padding: 1.75rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      border: 1px solid var(--p-surface-border);
      min-width: 0; /* Ensures grid item can shrink */
    }

    .block-header-mm {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .block-header-mm h3 { font-size: 0.95rem; font-weight: 800; color: var(--p-text-color); margin: 0; display: flex; align-items: center; gap: 0.6rem; }

    .chart-container-mm { width: 100%; height: 280px; }

    /* Doughnut Specific */
    .doughnut-flex { display: flex; flex-direction: column; align-items: center; gap: 1rem; position: relative; }
    .doughnut-container { width: 100%; height: 200px; position: relative; }
    .doughnut-center-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      pointer-events: none;
    }
    .center-label { font-size: 0.65rem; font-weight: 700; color: var(--p-text-muted-color); text-transform: uppercase; }
    .center-val { font-size: 1.1rem; font-weight: 800; color: var(--p-text-color); }

    .doughnut-custom-legend { display: flex; gap: 1rem; }
    .leg-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; font-weight: 700; color: #94a3b8; }
    .swatch { width: 8px; height: 8px; border-radius: 2px; }
    .swatch.income { background: #6B21A8; }
    .swatch.expense { background: #8B5CF6; }

    .btm-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .more-btn {
      background: var(--p-surface-ground);
      border: 1px solid var(--p-surface-border);
      padding: 0.3rem 0.75rem;
      border-radius: 8px;
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--p-text-muted-color);
      cursor: pointer;
      transition: all 0.2s;
    }
    .more-btn:hover { background: var(--p-surface-border); color: var(--p-text-color); }

    .mm-empty-small { height: 160px; display: flex; align-items: center; justify-content: center; color: #cbd5e1; font-size: 0.85rem; }

    .no-border-table :host ::ng-deep .p-datatable-tbody > tr > td {
      border: none !important;
      padding: 1rem 0 !important;
      font-size: 0.9rem;
      background: var(--p-surface-card) !important;
      color: var(--p-text-color) !important;
    }

    .no-border-table :host ::ng-deep .p-datatable-tbody > tr {
      background: var(--p-surface-card) !important;
    }

    .mini-rowValue:hover { background: var(--p-surface-ground); }
    .desc-mm { font-weight: 700; color: var(--p-text-color); }

    .text-right { text-align: right; }
    .text-brand { color: #6B21A8; }
    .text-brand-sec { color: #8B5CF6; }
    .font-bold { font-weight: 800; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-4 { margin-bottom: 1.5rem; }

    @media (max-width: 1024px) {
      .summary-grid { grid-template-columns: 1fr; }
      .charts-grid-mm { grid-template-columns: 1fr; }
      .btm-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  summary = signal<BalanceSummary | null>(null);
  recentIncomes = signal<RecentTransaction[]>([]);
  recentExpenses = signal<RecentTransaction[]>([]);

  loadingSummary = signal(true);
  loadingRecent = signal(true);
  loadingChart = signal(true);

  lineChartData = signal<any>(null);
  doughnutData = signal<any>(null);

  // Pure Purple Palette to match Sidebar
  private palette = {
    primary: '#6B21A8', // Brand Purple
    secondary: '#8B5CF6', // Muted Violet
    accent: '#D8B4FE',
    grid: '#f1f5f9'
  };

  lineOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    tension: 0.4,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          boxHeight: 6,
          padding: 15,
          font: { weight: '700', size: 10 },
          color: '#94a3b8'
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        cornerRadius: 12,
        usePointStyle: true,
        titleFont: { size: 12, weight: '700' },
        bodyFont: { size: 11 }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 9, weight: '700' } }
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f8fafc', drawTicks: false },
        ticks: { color: '#94a3b8', font: { size: 9, weight: '600' }, callback: (v: any) => '$' + v }
      }
    }
  };

  doughnutOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '88%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 10,
        cornerRadius: 10,
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: $${value.toLocaleString()}`;
          }
        }
      }
    },
    hover: { mode: null }
  };

  private dashboardService = inject(DashboardService);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadAllData();
  }

  private loadAllData(): void {
    forkJoin({
      summary: this.dashboardService.getBalanceSummary(),
      incomes: this.dashboardService.getRecentIncomes(5),
      expenses: this.dashboardService.getRecentExpenses(5)
    }).subscribe({
      next: ({ summary, incomes, expenses }) => {
        this.summary.set(summary);
        this.recentIncomes.set(incomes);
        this.recentExpenses.set(expenses);
        this.loadingSummary.set(false);
        this.loadingRecent.set(false);
        this.loadLineChartData();
        this.loadDoughnutData(summary);
      },
      error: () => {
        this.loadingSummary.set(false);
        this.loadingRecent.set(false);
        this.loadingChart.set(false);
      }
    });
  }

  private loadLineChartData(): void {
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

        this.lineChartData.set({
          labels: sortedDates.map(d => d.split('-')[2] + '/' + d.split('-')[1]),
          datasets: [
            {
              label: 'Ingresos',
              data: sortedDates.map(d => incomeMap.get(d) || 0),
              borderColor: this.palette.primary,
              backgroundColor: 'transparent',
              pointBackgroundColor: this.palette.primary,
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              pointRadius: 2,
              pointHoverRadius: 4,
              borderWidth: 2.5
            },
            {
              label: 'Gastos',
              data: sortedDates.map(d => expenseMap.get(d) || 0),
              borderColor: this.palette.secondary,
              backgroundColor: 'transparent',
              pointBackgroundColor: this.palette.secondary,
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              pointRadius: 2,
              pointHoverRadius: 4,
              borderWidth: 2.5
            }
          ]
        });
        this.loadingChart.set(false);
      },
      error: () => this.loadingChart.set(false)
    });
  }

  private loadDoughnutData(summary: BalanceSummary): void {
    this.doughnutData.set({
      labels: ['Ingresos', 'Gastos'],
      datasets: [{
        data: [summary.totalIncomes, summary.totalExpenses],
        backgroundColor: [this.palette.primary, this.palette.secondary],
        borderWidth: 0,
        hoverOffset: 0
      }]
    });
  }

  getSavingsPercentage(): number {
    const summ = this.summary();
    if (!summ || summ.totalIncomes === 0) return 0;
    return Math.max(0, summ.balance / summ.totalIncomes);
  }

  navigateTo(path: string, type?: string): void {
    this.router.navigate([path], type ? { queryParams: { type } } : undefined);
  }
}
