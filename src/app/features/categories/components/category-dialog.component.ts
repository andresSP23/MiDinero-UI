import { Component, EventEmitter, Input, OnChanges, Output, signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { Category, CategoryRequest } from '../../../core/models/category.model';

@Component({
  selector: 'app-category-dialog',
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
      [header]="category ? 'Editar Categoría' : 'Nueva Categoría'"
      [(visible)]="visible"
      [modal]="true"
      [style]="{ width: '420px' }"
      [draggable]="false"
      [resizable]="false"
      (onHide)="onCancel()"
    >
      <form [formGroup]="form" class="dialog-form">
        <div class="form-field">
          <label for="name">Nombre</label>
          <input pInputText id="name" formControlName="name" placeholder="Ej: Alimentación" class="w-full" />
        </div>

        <div class="form-field">
          <label for="description">Descripción</label>
          <input pInputText id="description" formControlName="description" placeholder="Descripción breve" class="w-full" />
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="categoryType">Tipo</label>
            <p-select
              id="categoryType"
              formControlName="categoryType"
              [options]="typeOptions"
              placeholder="Seleccionar"
              styleClass="w-full"
            />
          </div>

        </div>
      </form>

      <ng-template #footer>
        <div class="dialog-footer">
          <p-button label="Cancelar" severity="secondary" [text]="true" (onClick)="onCancel()" />
          <p-button
            [label]="category ? 'Actualizar' : 'Crear'"
            icon="pi pi-check"
            [loading]="saving()"
            [disabled]="form.invalid"
            (onClick)="onSave()"
          />
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .dialog-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      padding: 0.5rem 0;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-field label {
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--p-text-color);
    }

    .w-full { width: 100%; }

    .color-value {
      font-family: monospace;
      font-size: 0.875rem;
      color: var(--p-text-muted-color);
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }
  `]
})
export class CategoryDialogComponent implements OnChanges {
  @Input() visible = false;
  @Input() category: Category | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<CategoryRequest>();

  form: FormGroup;
  saving = signal(false);

  typeOptions = [
    { label: 'Ingreso', value: 'INCOME' },
    { label: 'Gasto', value: 'EXPENSE' }
  ];

  constructor(private fb: FormBuilder) {
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
    const formValue = this.form.value;
    const request: CategoryRequest = {
      name: formValue.name,
      description: formValue.description,
      categoryType: formValue.categoryType
    };
    this.saved.emit(request);
  }

  onCancel(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.form.reset();
  }

}
