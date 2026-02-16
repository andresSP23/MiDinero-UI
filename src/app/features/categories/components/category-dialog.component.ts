import { Component, EventEmitter, Input, OnChanges, Output, signal, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { Category, CategoryRequest } from '../../../core/models/category.model';

@Component({
  selector: 'app-category-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    ButtonModule,
  ],
  template: `
    <p-dialog
      [(visible)]="visible"
      [modal]="true"
      [style]="{ width: '400px', borderRadius: '24px' }"
      [draggable]="false"
      [resizable]="false"
      [closable]="false"
      styleClass="mm-dialog"
      (onHide)="onCancel()"
    >
      <ng-template #header>
        <div class="mm-dialog-header">
          <h3>{{ category ? 'Editar Categoría' : 'Nueva Categoría' }}</h3>
          <p>{{ category ? 'Actualiza el nombre y tipo de tu categoría' : 'Crea una nueva etiqueta para tus movimientos' }}</p>
        </div>
      </ng-template>

      <form [formGroup]="form" class="mm-form">
        <div class="form-field-mm">
          <label for="name">Nombre de la Categoría</label>
          <input 
            pInputText 
            id="name" 
            formControlName="name" 
            placeholder="Ej: Entretenimiento" 
            class="mm-input" 
          />
        </div>

        <div class="form-field-mm">
          <label for="description">Descripción (Opcional)</label>
          <input 
            pInputText 
            id="description" 
            formControlName="description" 
            placeholder="Breve detalle..." 
            class="mm-input" 
          />
        </div>

        <div class="form-field-mm">
          <label for="categoryType">Tipo de Categoría</label>
          <p-select
            id="categoryType"
            formControlName="categoryType"
            [options]="typeOptions"
            placeholder="Seleccionar tipo"
            styleClass="mm-select"
          />
        </div>
      </form>

      <ng-template #footer>
        <div class="mm-dialog-footer">
          <button class="btn-mm-sec" (click)="onCancel()">Cancelar</button>
          <button 
            class="btn-mm-pri" 
            [class.loading]="saving()"
            [disabled]="form.invalid || saving()" 
            (click)="onSave()"
          >
            {{ category ? 'Guardar Cambios' : 'Crear Categoría' }}
          </button>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    :host ::ng-deep .mm-dialog .p-dialog-header {
      padding: 1.5rem 1.5rem 0.5rem !important;
      border: none !important;
      background: white !important;
    }
    :host ::ng-deep .mm-dialog .p-dialog-content {
      padding: 1rem 1.5rem !important;
      background: white !important;
    }
    :host ::ng-deep .mm-dialog .p-dialog-footer {
      padding: 1.5rem !important;
      border: none !important;
      background: white !important;
    }

    .mm-dialog-header h3 { font-size: 1.25rem; font-weight: 800; color: #111827; margin: 0; }
    .mm-dialog-header p { font-size: 0.8rem; color: #64748b; margin: 0.25rem 0 0; }

    .mm-form { display: flex; flex-direction: column; gap: 1.25rem; }
    .form-field-mm { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-field-mm label { font-size: 0.8rem; font-weight: 700; color: #1e293b; }

    :host ::ng-deep .mm-input {
      width: 100% !important;
      padding: 0.75rem 1rem !important;
      border: 1.5px solid #f1f5f9 !important;
      border-radius: 12px !important;
      font-size: 0.9rem !important;
      transition: border-color 0.2s !important;
      background: #f8fafc !important;
    }
    :host ::ng-deep .mm-input:focus { border-color: #6B21A8 !important; box-shadow: none !important; background: white !important; }

    :host ::ng-deep .mm-select {
      width: 100% !important;
      background: #f8fafc !important;
      border: 1.5px solid #f1f5f9 !important;
      border-radius: 12px !important;
      padding: 0.25rem 0.5rem !important;
    }
    :host ::ng-deep .mm-select:not(.p-disabled).p-focus { border-color: #6B21A8 !important; box-shadow: none !important; }

    .mm-dialog-footer { display: flex; gap: 0.75rem; width: 100%; }

    .btn-mm-pri, .btn-mm-sec {
      flex: 1;
      padding: 0.75rem;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .btn-mm-pri { background: #6B21A8; color: white; }
    .btn-mm-pri:hover:not(:disabled) { background: #581c87; transform: translateY(-1px); }
    .btn-mm-pri:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-mm-sec { background: #f1f5f9; color: #475569; }
    .btn-mm-sec:hover { background: #e2e8f0; }
  `]
})
export class CategoryDialogComponent implements OnChanges {
  @Input() visible = false;
  @Input() category: Category | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<CategoryRequest>();

  private fb = inject(FormBuilder);
  form: FormGroup;
  saving = signal(false);

  typeOptions = [
    { label: 'Ingreso', value: 'INCOME' },
    { label: 'Gasto', value: 'EXPENSE' }
  ];

  constructor() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      categoryType: ['', Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      if (this.category) {
        this.form.patchValue({
          name: this.category.name,
          description: this.category.description,
          categoryType: this.category.categoryType
        });
      } else {
        this.form.reset();
      }
    }
  }

  onSave(): void {
    if (this.form.invalid) return;
    this.saved.emit(this.form.value as CategoryRequest);
  }

  onCancel(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.form.reset();
  }
}
