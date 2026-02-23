import { Component, OnInit, signal, inject } from '@angular/core';
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
  standalone: true,
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
    <div class="page-container-mm">
      <!-- Header Row -->
      <div class="page-header-mm anim-fade-in-up anim-delay-1">
        <div class="title-group">
          <h2>Categorías</h2>
          <p class="subtitle-mm">Gestiona tus etiquetas de ingresos y gastos</p>
        </div>
        <button class="action-btn-mm premium" (click)="openDialog()">
          <i class="pi pi-plus"></i> Nueva Categoría
        </button>
      </div>

      <div class="cards-grid-mm" *ngIf="!loading()">
        @for (cat of categories(); track cat.id) {
          <div class="mm-card cat-card-mm anim-scale-in" [style.animation-delay]="(($index) * 0.06) + 's'">
            <div class="card-top-mm">
              <div class="icon-set-mm" [class]="cat.categoryType === 'INCOME' ? 'income' : 'expense'">
                <i [class]="cat.categoryType === 'INCOME' ? 'pi pi-arrow-down-left' : 'pi pi-arrow-up-right'"></i>
              </div>
              <span class="type-badge-mm" [class]="cat.categoryType === 'INCOME' ? 'income' : 'expense'">
                {{ cat.categoryType === 'INCOME' ? 'Ingreso' : 'Gasto' }}
              </span>
            </div>
            
            <div class="card-info-mm">
              <h3 class="cat-name-mm">{{ cat.name }}</h3>
              <p class="cat-desc-mm">{{ cat.description || 'Sin descripción adicional' }}</p>
            </div>

            <div class="card-footer-mm">
              <div class="spacer"></div>
              <button class="icon-btn-mm" (click)="editCategory(cat)"><i class="pi pi-pencil"></i></button>
              <button class="icon-btn-mm delete" (click)="confirmDelete(cat)"><i class="pi pi-trash"></i></button>
            </div>
          </div>
        }
      </div>

      <!-- Loading State -->
      <div class="cards-grid-mm" *ngIf="loading()">
        @for (i of [1,2,3,4,5,6]; track i) {
          <div class="mm-card cat-card-mm skeleton">
            <p-skeleton width="48px" height="48px" borderRadius="12px" styleClass="mb-3" />
            <p-skeleton width="60%" height="1.2rem" styleClass="mb-2" />
            <p-skeleton width="90%" height="0.8rem" />
          </div>
        }
      </div>

      <!-- Empty State -->
      <div class="empty-state-mm mm-card" *ngIf="!loading() && categories().length === 0">
        <div class="empty-icon-mm"><i class="pi pi-tags"></i></div>
        <h3>No hay categorías</h3>
        <p>Comienza creando una categoría para organizar tus transacciones.</p>
      </div>

      <app-category-dialog
        [(visible)]="dialogVisible"
        [category]="selectedCategory()"
        (saved)="onSave($event)"
      />

      <p-confirmDialog 
        styleClass="mm-dialog" 
        [closable]="false" 
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
      margin-bottom: 2rem;
    }

    .title-group h2 { font-size: 1.5rem; font-weight: 800; color: var(--p-text-color); margin: 0; }
    .subtitle-mm { color: var(--p-text-muted-color); font-size: 0.85rem; margin: 0.25rem 0 0; }

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
    .action-btn-mm:hover { transform: translateY(-1px); background: #581c87; }

    .cards-grid-mm {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .cat-card-mm {
      display: flex;
      flex-direction: column;
      height: 200px;
      border-radius: 24px;
    }

    .hover-shadow:hover {
      /* mm-card handles hover now, but kept for specific override if needed or removed */
      /* Extending mm-card hover if we want stronger shadow */
      box-shadow: 0 10px 20px rgba(0,0,0,0.05);
    }

    .card-top-mm {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .icon-set-mm {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      transition: transform 0.2s;
    }
    .icon-set-mm.income { background: linear-gradient(135deg, #f5f3ff, #ede9fe); color: #6B21A8; }
    .icon-set-mm.expense { background: linear-gradient(135deg, #faf5ff, #f3e8ff); color: #8B5CF6; }

    .cat-card-mm:hover .icon-set-mm {
      transform: scale(1.08);
    }

    .type-badge-mm {
      font-size: 0.65rem;
      font-weight: 800;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      text-transform: uppercase;
    }
    .type-badge-mm.income { background: #f5f3ff; color: #6B21A8; border: 1px solid #ddd6fe; }
    .type-badge-mm.expense { background: #faf5ff; color: #8B5CF6; border: 1px solid #e9d5ff; }

    .cat-name-mm { font-size: 1.1rem; font-weight: 800; color: var(--p-text-color); margin: 0 0 0.5rem; letter-spacing: -0.01em; }
    .cat-desc-mm { 
      font-size: 0.85rem; 
      color: var(--p-text-muted-color); 
      line-height: 1.6; 
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-footer-mm {
      margin-top: auto;
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    .spacer { flex: 1; }

    .icon-btn-mm {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      background: #fafaf9;
      color: var(--p-text-muted-color);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .icon-btn-mm:hover { background: #f3e8ff; color: #6B21A8; border-color: #d8b4fe; transform: scale(1.08); }
    .icon-btn-mm.delete:hover { background: #fef2f2; color: #dc2626; border-color: #fecaca; }

    .empty-state-mm {
      text-align: center;
      padding: 4rem 2rem;
      background: var(--p-surface-card);
      border-radius: 24px;
      border: 1px solid #e2e8f0;
      grid-column: 1 / -1;
    }
    .empty-icon-mm {
      font-size: 3rem;
      color: var(--p-surface-border);
      margin-bottom: 1rem;
    }
    .empty-state-mm h3 { color: var(--p-text-color); margin-bottom: 0.5rem; }
    .empty-state-mm p { color: var(--p-text-muted-color); font-size: 0.9rem; }

    /* block-card-mm replaced by mm-card */
    .mb-3 { margin-bottom: 0.75rem; }
    .mb-2 { margin-bottom: 0.5rem; }
  `]
})
export class CategoryListComponent implements OnInit {
  categories = signal<Category[]>([]);
  loading = signal(true);
  dialogVisible = false;
  selectedCategory = signal<Category | null>(null);

  private categoryService = inject(CategoryService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

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
      acceptButtonStyleClass: 'btn-mm-pri',
      rejectButtonStyleClass: 'btn-mm-sec',
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
