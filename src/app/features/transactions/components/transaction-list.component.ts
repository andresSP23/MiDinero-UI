import { Component, OnInit, signal, input, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TransactionService } from '../services/transaction.service';
import { CategoryService } from '../../categories/services/category.service';
import { Transaction, TransactionRequest } from '../../../core/models/transaction.model';
import { Category } from '../../../core/models/category.model';
import { TransactionDialogComponent } from './transaction-dialog.component';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    TableModule,
    ButtonModule,
    TagModule,
    ConfirmDialogModule,
    SkeletonModule,
    TransactionDialogComponent,
  ],
  providers: [ConfirmationService],
  template: `
    <div class="transaction-container-mm">
      @if (filterType()) {
        <div class="page-header-mm">
          <div class="title-group">
            <h2>{{ filterType() === 'INCOME' ? 'Ingresos' : 'Gastos' }}</h2>
            <p class="subtitle-mm">Gestión de tus {{ filterType() === 'INCOME' ? 'entradas' : 'salidas' }} de dinero</p>
          </div>
          <div class="actions-group">
            <button class="action-btn-mm sec" (click)="exportToExcel()" [disabled]="exporting()">
              <i class="pi" [class]="exporting() ? 'pi-spin pi-spinner' : 'pi-file-excel'"></i> 
              {{ exporting() ? 'Exportando...' : 'Exportar Excel' }}
            </button>
            <button class="action-btn-mm premium" (click)="openDialog()">
              <i class="pi pi-plus"></i> Nueva Transacción
            </button>
          </div>
        </div>
      }

      <div class="block-card-mm table-card-mm">
        <p-table
          [value]="transactions()"
          [lazy]="true"
          [paginator]="true"
          [rows]="pageSize"
          [totalRecords]="totalRecords()"
          [loading]="loading()"
          [rowsPerPageOptions]="[5, 10, 20]"
          (onLazyLoad)="loadTransactions($event)"
          styleClass="p-datatable-sm mm-table"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords}"
        >
          <ng-template #header>
            <tr>
              <th pSortableColumn="createdAt">Fecha <p-sortIcon field="createdAt" /></th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th style="width: 100px">Tipo</th>
              <th pSortableColumn="total" style="text-align:right">Monto <p-sortIcon field="total" /></th>
              <th style="width: 100px; text-align:center">Acciones</th>
            </tr>
          </ng-template>

          <ng-template #body let-tx>
            <tr class="mm-row">
              <td class="date-cell">{{ tx.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
              <td class="desc-cell">{{ tx.description }}</td>
              <td>
                <span class="cat-pill">{{ tx.categoryName }}</span>
              </td>
              <td>
                <span class="type-badge-mini" [class]="tx.transactionType === 'INCOME' ? 'income' : 'expense'">
                  {{ tx.transactionType === 'INCOME' ? 'Entrada' : 'Salida' }}
                </span>
              </td>
              <td class="monto-cell" [class]="tx.transactionType === 'INCOME' ? 'text-success' : 'text-danger'">
                {{ tx.transactionType === 'INCOME' ? '+' : '-' }}{{ tx.total | currency:'USD':'symbol':'1.2-2' }}
              </td>
              <td class="actions-cell">
                <button class="mini-icon-btn" (click)="editTransaction(tx)"><i class="pi pi-pencil"></i></button>
                <button class="mini-icon-btn delete" (click)="confirmDelete(tx)"><i class="pi pi-trash"></i></button>
              </td>
            </tr>
          </ng-template>

          <ng-template #emptymessage>
            <tr>
              <td colspan="6" class="mm-empty-row">No hay transacciones registradas</td>
            </tr>
          </ng-template>

          <ng-template #loadingbody>
            @for (i of skeletonRows; track i) {
              <tr>
                @for (j of skeletonCols; track j) {
                  <td><p-skeleton /></td>
                }
              </tr>
            }
          </ng-template>
        </p-table>
      </div>

      <app-transaction-dialog
        [(visible)]="dialogVisible"
        [transaction]="selectedTransaction()"
        [categories]="categories()"
        [defaultType]="filterType()"
        (saved)="onSave($event)"
      />

      <p-confirmDialog 
        styleClass="mm-dialog" 
        [closable]="false" 
      />
    </div>
  `,
  styles: [`
    .transaction-container-mm {
      max-width: 1300px;
      margin: 0 auto;
    }

    .page-header-mm {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
 
    .actions-group { display: flex; gap: 0.75rem; }

    .title-group h2 { font-size: 1.5rem; font-weight: 800; color: var(--p-text-color); margin: 0; }
    .subtitle-mm { color: var(--p-text-muted-color); font-size: 0.85rem; margin-top: 0.25rem; }

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
      transition: all 0.2s;
    }
    .action-btn-mm.premium { background: #6B21A8; color: white; box-shadow: 0 4px 12px rgba(107, 33, 168, 0.2); }
    .action-btn-mm.premium:hover { background: #581c87; }
    .action-btn-mm.sec { background: var(--p-surface-card); color: var(--p-text-color); border: 1px solid var(--p-surface-border); }
    .action-btn-mm.sec:hover { background: var(--p-surface-ground); border-color: var(--p-text-muted-color); }
    .action-btn-mm:hover { transform: translateY(-1px); }

    .block-card-mm {
      background: var(--p-surface-card);
      border-radius: 20px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      border: 1px solid var(--p-surface-border);
    }

    .table-card-mm { padding: 0.5rem; }

    :host ::ng-deep .mm-table .p-datatable-thead > tr > th {
      background: var(--p-surface-card) !important;
      border-bottom: 2px solid var(--p-surface-border) !important;
      color: var(--p-text-muted-color) !important;
      font-size: 0.75rem !important;
      font-weight: 800 !important;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 1.25rem 1rem !important;
    }

    :host ::ng-deep .mm-table .p-datatable-tbody > tr > td {
      border-bottom: 1px solid var(--p-surface-border) !important;
      padding: 1rem !important;
      font-size: 0.9rem;
      color: var(--p-text-color);
      background: var(--p-surface-card) !important;
    }

    :host ::ng-deep .mm-table .p-datatable-tbody > tr {
      background: var(--p-surface-card) !important;
    }

    .mm-row:hover { background: var(--p-surface-ground) !important; }

    .cat-pill {
      background: #f3e8ff;
      color: #6b21a8;
      padding: 0.25rem 0.6rem;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .type-badge-mini {
      font-size: 0.7rem;
      font-weight: 800;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
    }
    .type-badge-mini.income { background: #d1fae5; color: #065f46; }
    .type-badge-mini.expense { background: #fee2e2; color: #991b1b; }

    .monto-cell { font-weight: 800; text-align: right; }
    .text-success { color: #6B21A8; }
    .text-danger { color: #8B5CF6; }

    .actions-cell { display: flex; justify-content: center; gap: 0.5rem; }

    .mini-icon-btn {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      border: 1px solid var(--p-surface-border);
      background: var(--p-surface-ground);
      color: var(--p-text-muted-color);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .mini-icon-btn:hover { background: var(--p-surface-border); color: var(--p-text-color); }
    .mini-icon-btn.delete:hover { background: #fee2e2; color: #dc2626; border-color: #fecaca; }

    .mm-empty-row { text-align: center; padding: 3rem !important; color: #94a3b8; font-style: italic; }

    .date-cell { color: #64748b !important; font-weight: 600; }
    .desc-cell { font-weight: 700; color: var(--p-text-color); }
  `]
})
export class TransactionListComponent implements OnInit {
  filterType = input<'INCOME' | 'EXPENSE' | null>(null);
  transactions = signal<Transaction[]>([]);
  totalRecords = signal(0);
  loading = signal(true);
  categories = signal<Category[]>([]);
  selectedTransaction = signal<Transaction | null>(null);
  dialogVisible = false;
  exporting = signal(false);

  pageSize = 10;
  skeletonRows = [1, 2, 3, 4, 5];
  skeletonCols = [1, 2, 3, 4, 5, 6];

  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.loadCategories();
    const type = this.route.snapshot.queryParamMap.get('type');
    if (type === 'INCOME' || type === 'EXPENSE') {
      this.openDialog();
    }
  }

  loadCategories(): void {
    this.categoryService.getAll(0, 100).subscribe({
      next: res => this.categories.set(res.content)
    });
  }

  loadTransactions(event: any): void {
    this.loading.set(true);
    const page = event.first / event.rows;
    const sort = event.sortField
      ? `${event.sortField},${event.sortOrder === 1 ? 'asc' : 'desc'}`
      : 'createdAt,desc';

    const type = this.filterType() || undefined;

    this.transactionService.getAll(page, event.rows, sort, type).subscribe({
      next: res => {
        this.transactions.set(res.content);
        this.totalRecords.set(res.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openDialog(): void {
    this.selectedTransaction.set(null);
    this.dialogVisible = true;
  }

  editTransaction(tx: Transaction): void {
    this.selectedTransaction.set(tx);
    this.dialogVisible = true;
  }

  onSave(request: TransactionRequest): void {
    const selected = this.selectedTransaction();
    const obs = selected
      ? this.transactionService.update(selected.id, request)
      : this.transactionService.create(request);

    obs.subscribe({
      next: () => {
        this.dialogVisible = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: selected ? 'Transacción actualizada' : 'Transacción creada',
          life: 3000
        });
        this.loadTransactions({ first: 0, rows: this.pageSize });
      }
    });
  }

  confirmDelete(tx: Transaction): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar "${tx.description}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'btn-mm-pri',
      rejectButtonStyleClass: 'btn-mm-sec',
      accept: () => {
        this.transactionService.delete(tx.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Eliminado',
              detail: 'Transacción eliminada correctamente',
              life: 3000
            });
            this.loadTransactions({ first: 0, rows: this.pageSize });
          }
        });
      }
    });
  }

  exportToExcel() {
    this.exporting.set(true);
    const type = this.filterType();

    this.transactionService.exportToExcel(type || undefined).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const dateStr = new Date().toISOString().split('T')[0];
        const fileName = `Transacciones_${type || 'ALL'}_${dateStr}.xlsx`;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.exporting.set(false);
        this.messageService.add({ severity: 'success', summary: 'Exportación completada', detail: 'El archivo se ha descargado correctamente' });
      },
      error: () => {
        this.exporting.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo exportar el archivo' });
      }
    });
  }
}

