import { Component, EventEmitter, Input, OnChanges, Output, signal, SimpleChanges, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { Transaction, TransactionRequest } from '../../../core/models/transaction.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-transaction-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
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
          <h3>{{ transaction ? 'Editar Movimiento' : 'Nuevo Movimiento' }}</h3>
          <p>{{ transaction ? 'Actualiza los detalles de tu registro' : 'Ingresa los datos de tu nueva transacción' }}</p>
        </div>
      </ng-template>

      <form [formGroup]="form" class="mm-form">
        <div class="form-field-mm">
          <label for="description">Descripción</label>
          <input 
            pInputText 
            id="description" 
            formControlName="description" 
            placeholder="Ej: Pago de servicios" 
            class="mm-input" 
          />
        </div>

        <div class="form-field-mm">
          <label for="total">Monto</label>
          <p-inputNumber
            id="total"
            formControlName="total"
            mode="currency"
            currency="USD"
            locale="en-US"
            [minFractionDigits]="2"
            styleClass="w-full"
            inputStyleClass="mm-input"
            placeholder="$0.00"
          />
        </div>

        @if (!defaultType) {
          <div class="form-field-mm">
            <label for="transactionType">Tipo de Movimiento</label>
            <p-select
              id="transactionType"
              formControlName="transactionType"
              [options]="typeOptions"
              placeholder="Seleccionar tipo"
              styleClass="mm-select"
            />
          </div>
        }

        <div class="form-field-mm">
          <label for="categoryId">Categoría</label>
          <p-select
            id="categoryId"
            formControlName="categoryId"
            [options]="categoryOptions()"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccionar categoría"
            styleClass="mm-select"
          />
        </div>
      </form>

      <ng-template #footer>
        <div class="mm-dialog-footer">
          <p-button 
            label="Cancelar" 
            styleClass="btn-mm-sec" 
            (onClick)="onCancel()" 
          />
          <p-button 
            [label]="transaction ? 'Guardar Cambios' : 'Registrar Ahora'"
            styleClass="btn-mm-pri" 
            [loading]="saving()"
            [disabled]="form.invalid || saving()" 
            (onClick)="onSave()"
          />
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .mm-dialog-header h3 { font-size: 1.25rem; font-weight: 800; color: #111827; margin: 0; }
    .mm-dialog-header p { font-size: 0.8rem; color: #64748b; margin: 0.25rem 0 0; }

    .mm-form { display: flex; flex-direction: column; gap: 1.25rem; }
    .form-field-mm { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-field-mm label { font-size: 0.8rem; font-weight: 700; color: #1e293b; }

    .mm-dialog-footer { display: flex; gap: 0.75rem; width: 100%; }

    :host ::ng-deep .p-button.btn-mm-pri {
      background: #6B21A8; 
      color: white; 
      border: none;
      width: 100%;
      justify-content: center;
      padding: 0.75rem;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.9rem;
    }
    :host ::ng-deep .p-button.btn-mm-pri:enabled:hover { background: #581c87; transform: translateY(-1px); }
    :host ::ng-deep .p-button.btn-mm-pri:disabled { opacity: 0.5; cursor: not-allowed; }

    :host ::ng-deep .p-button.btn-mm-sec { 
      background: #f1f5f9; 
      color: #475569; 
      border: none;
      width: 100%;
      justify-content: center;
      padding: 0.75rem;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.9rem;
    }
    :host ::ng-deep .p-button.btn-mm-sec:enabled:hover { background: #e2e8f0; color: #334155; }
  `]
})
export class TransactionDialogComponent implements OnChanges {
  @Input() visible = false;
  @Input() transaction: Transaction | null = null;
  @Input() categories: Category[] = [];
  @Input() defaultType: 'INCOME' | 'EXPENSE' | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<TransactionRequest>();

  private fb = inject(FormBuilder);
  form: FormGroup;
  saving = signal(false);

  typeOptions = [
    { label: 'Ingreso', value: 'INCOME' },
    { label: 'Gasto', value: 'EXPENSE' }
  ];

  categoryOptions = signal<{ label: string; value: number }[]>([]);

  constructor() {
    this.form = this.fb.group({
      description: ['', Validators.required],
      total: [null, [Validators.required, Validators.min(0.01)]],
      transactionType: ['', Validators.required],
      categoryId: [null, Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categories']) {
      this.categoryOptions.set(
        this.categories.map(c => ({ label: c.name, value: c.id }))
      );
    }

    if (changes['transaction'] && this.transaction) {
      this.form.patchValue({
        description: this.transaction.description,
        total: this.transaction.total,
        transactionType: this.transaction.transactionType,
        categoryId: this.transaction.categoryId
      });
    } else if (changes['visible'] && this.visible && !this.transaction) {
      this.form.reset({
        transactionType: this.defaultType
      });
    }
  }

  onSave(): void {
    if (this.form.invalid) return;
    this.saved.emit(this.form.value as TransactionRequest);
  }

  onCancel(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.form.reset({
      transactionType: this.defaultType
    });
  }
}
