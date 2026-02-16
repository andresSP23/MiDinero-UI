import { Component, OnInit, signal, input, effect } from '@angular/core';
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
    <div class="transaction-page">
      <div class="page-header" *ngIf="!filterType()">
        <h2>Transacciones</h2>
        <p-button
          label="Nueva Transacción"
          icon="pi pi-plus"
          (onClick)="openDialog()"
        />
      </div>

      <div class="table-card">
        <p-table
          [value]="transactions()"
          [lazy]="true"
          [paginator]="true"
          [rows]="pageSize"
          [totalRecords]="totalRecords()"
          [loading]="loading()"
          [rowsPerPageOptions]="[5, 10, 20]"
          (onLazyLoad)="loadTransactions($event)"
          styleClass="p-datatable-striped"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} transacciones"
        >
          <ng-template #header>
            <tr>
              <th pSortableColumn="date" style="width:120px">Fecha <p-sortIcon field="date" /></th>
              <th>Descripción</th>
              <th style="width:140px">Categoría</th>
              <th style="width:100px">Tipo</th>
              <th pSortableColumn="total" style="width:130px;text-align:right">Monto <p-sortIcon field="total" /></th>
              <th style="width:140px">Método</th>
              <th style="width:100px;text-align:center">Acciones</th>
            </tr>
          </ng-template>

          <ng-template #body let-tx>
            <tr>
              <td>{{ tx.date | date:'dd/MM/yyyy' }}</td>
              <td>{{ tx.description }}</td>
              <td><span class="category-tag">{{ tx.categoryName }}</span></td>
              <td>
              <td>
                <p-tag
                  [value]="tx.transactionType === 'INCOME' ? 'Ingreso' : 'Gasto'"
                  [severity]="tx.transactionType === 'INCOME' ? 'success' : 'danger'"
                />
              </td>
              <td [style.color]="tx.transactionType === 'INCOME' ? 'var(--p-green-500)' : 'var(--p-red-500)'"
                  style="text-align:right; font-weight:600">
                {{ tx.transactionType === 'INCOME' ? '+' : '-' }}{{ tx.total | currency:'USD':'symbol':'1.2-2' }}
              </td>
              <td>{{ tx.paymentMethod }}</td>
              <td style="text-align:center">
                <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" severity="info" (onClick)="editTransaction(tx)" />
                <p-button icon="pi pi-trash" [text]="true" [rounded]="true" severity="danger" (onClick)="confirmDelete(tx)" />
              </td>
            </tr>
          </ng-template>

          <ng-template #emptymessage>
            <tr>
              <td colspan="7" class="text-center">No hay transacciones registradas</td>
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

      <p-confirmDialog />
    </div>
  `,
  styles: [`
    .transaction-page {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-header h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--p-text-color);
      margin: 0;
    }

    .table-card {
      background: var(--p-surface-card);
      border: 1px solid var(--p-surface-border);
      border-radius: 14px;
      padding: 1rem;
      overflow: hidden;
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
      padding: 2rem !important;
    }
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

  pageSize = 10;
  skeletonRows = [1, 2, 3, 4, 5];
  skeletonCols = [1, 2, 3, 4, 5, 6, 7];

  constructor(
    private transactionService: TransactionService,
    private categoryService: CategoryService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadCategories();

    // Check if we got a type from dashboard quick action
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
    // If filtering by type, we might need to fetch more and filter client-side, 
    // or just fetch normal page and filter (which makes pagination inaccurate but is safe fallback).
    // Given backend limitations, we'll fetch larger page size if filtered, or just accept the limitation.

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
      acceptButtonStyleClass: 'p-button-danger',
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
}
