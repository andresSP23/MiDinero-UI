import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CategoryService } from '../services/category.service';
import { Category, CategoryRequest } from '../../../core/models/category.model';
import { CategoryDialogComponent } from './category-dialog.component';

@Component({
  selector: 'app-category-list',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    ConfirmDialogModule,
    SkeletonModule,
    CategoryDialogComponent,
  ],
  providers: [ConfirmationService],
  template: `
    <div class="category-page">
      <div class="page-header">
        <h2>Categorías</h2>
        <p-button
          label="Nueva Categoría"
          icon="pi pi-plus"
          (onClick)="openDialog()"
        />
      </div>

      <div class="table-card">
        <p-table
          [value]="categories()"
          [loading]="loading()"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[5, 10, 20]"
          styleClass="p-datatable-striped"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} categorías"
        >
          <ng-template #header>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th style="width:120px">Tipo</th>
              <th style="width:80px;text-align:center">Acciones</th>
            </tr>
          </ng-template>

          <ng-template #body let-cat>
            <tr>
              <td style="font-weight:600">{{ cat.name }}</td>
              <td style="color:var(--p-text-muted-color)">{{ cat.description || '—' }}</td>
              <td>
                <p-tag
                  [value]="cat.categoryType === 'INCOME' ? 'Ingreso' : 'Gasto'"
                  [severity]="cat.categoryType === 'INCOME' ? 'success' : 'danger'"
                />
              </td>
              <td style="text-align:center">
                <p-button
                  icon="pi pi-pencil"
                  [text]="true"
                  [rounded]="true"
                  severity="info"
                  (onClick)="editCategory(cat)"
                />
                <p-button
                  icon="pi pi-trash"
                  [text]="true"
                  [rounded]="true"
                  severity="danger"
                  (onClick)="confirmDelete(cat)"
                />
              </td>
            </tr>
          </ng-template>

          <ng-template #emptymessage>
            <tr>
              <td colspan="5" class="text-center">No hay categorías registradas</td>
            </tr>
          </ng-template>

          <ng-template #loadingbody>
            @for (i of [1,2,3,4,5]; track i) {
              <tr>
                @for (j of [1,2,3,4,5]; track j) {
                  <td><p-skeleton /></td>
                }
              </tr>
            }
          </ng-template>
        </p-table>
      </div>

      <app-category-dialog
        [(visible)]="dialogVisible"
        [category]="selectedCategory()"
        (saved)="onSave($event)"
      />

      <p-confirmDialog />
    </div>
  `,
  styles: [`
    .category-page {
      max-width: 1000px;
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

    .color-dot {
      display: inline-block;
      width: 24px;
      height: 24px;
      border-radius: 8px;
      border: 2px solid var(--p-surface-border);
    }

    .text-center {
      text-align: center;
      color: var(--p-text-muted-color);
      padding: 2rem !important;
    }
  `]
})
export class CategoryListComponent implements OnInit {
  categories = signal<Category[]>([]);
  loading = signal(true);
  dialogVisible = false;
  selectedCategory = signal<Category | null>(null);

  constructor(
    private categoryService: CategoryService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.categoryService.getAll(0, 100).subscribe({
      next: res => {
        this.categories.set(res.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openDialog(): void {
    this.selectedCategory.set(null);
    this.dialogVisible = true;
  }

  editCategory(cat: Category): void {
    this.selectedCategory.set(cat);
    this.dialogVisible = true;
  }

  onSave(request: CategoryRequest): void {
    const selected = this.selectedCategory();
    const obs = selected
      ? this.categoryService.update(selected.id, request)
      : this.categoryService.create(request);

    obs.subscribe({
      next: () => {
        this.dialogVisible = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: selected ? 'Categoría actualizada' : 'Categoría creada',
          life: 3000
        });
        this.loadCategories();
      }
    });
  }

  confirmDelete(cat: Category): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar la categoría "${cat.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.categoryService.delete(cat.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Eliminado',
              detail: 'Categoría eliminada correctamente',
              life: 3000
            });
            this.loadCategories();
          }
        });
      }
    });
  }
}
