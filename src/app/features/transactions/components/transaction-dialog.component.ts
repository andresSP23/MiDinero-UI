import { Component, EventEmitter, Input, OnChanges, Output, signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { Transaction, TransactionRequest } from '../../../core/models/transaction.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-transaction-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    DatePickerModule,
    ButtonModule,
  ],
  template: `
    <p-dialog
      [header]="transaction ? 'Editar Transacción' : 'Nueva Transacción'"
      [(visible)]="visible"
      [modal]="true"
      [style]="{ width: '480px' }"
      [draggable]="false"
      [resizable]="false"
      (onHide)="onCancel()"
    >
      <form [formGroup]="form" class="dialog-form">
        <div class="form-field">
          <label for="description">Descripción</label>
          <input pInputText id="description" formControlName="description" placeholder="Ej: Salario mensual" class="w-full" />
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="total">Monto</label>
            <p-inputNumber
              id="total"
              formControlName="total"
              mode="currency"
              currency="USD"
              locale="en-US"
              [minFractionDigits]="2"
              styleClass="w-full"
              inputStyleClass="w-full"
            />
          </div>

          @if (!defaultType) {
            <div class="form-field">
              <label for="transactionType">Tipo</label>
              <p-select
                id="transactionType"
                formControlName="transactionType"
                [options]="typeOptions"
                placeholder="Seleccionar"
                styleClass="w-full"
              />
            </div>
          }
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="categoryId">Categoría</label>
            <p-select
              id="categoryId"
              formControlName="categoryId"
              [options]="categoryOptions()"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccionar"
              styleClass="w-full"
            />
          </div>

          <div class="form-field">
            <label for="date">Fecha</label>
            <p-datePicker
              id="date"
              formControlName="date"
              dateFormat="yy-mm-dd"
              [showIcon]="true"
              styleClass="w-full"
              inputStyleClass="w-full"
            />
          </div>
        </div>

        <div class="form-field">
          <label for="paymentMethod">Método de Pago</label>
          <p-select
            id="paymentMethod"
            formControlName="paymentMethod"
            [options]="paymentOptions"
            placeholder="Seleccionar"
            styleClass="w-full"
          />
        </div>
      </form>

      <ng-template #footer>
        <div class="dialog-footer">
          <p-button label="Cancelar" severity="secondary" [text]="true" (onClick)="onCancel()" />
          <p-button
            [label]="transaction ? 'Actualizar' : 'Crear'"
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

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }
  `]
})
export class TransactionDialogComponent implements OnChanges {
  @Input() visible = false;
  @Input() transaction: Transaction | null = null;
  @Input() categories: Category[] = [];
  @Input() defaultType: 'INCOME' | 'EXPENSE' | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<TransactionRequest>();

  form: FormGroup;
  saving = signal(false);

  typeOptions = [
    { label: 'Ingreso', value: 'INCOME' },
    { label: 'Gasto', value: 'EXPENSE' }
  ];

  paymentOptions = [
    { label: 'Efectivo', value: 'CASH' },
    { label: 'Tarjeta de Crédito', value: 'CREDIT_CARD' },
    { label: 'Tarjeta de Débito', value: 'DEBIT_CARD' },
    { label: 'Transferencia', value: 'TRANSFER' },
    { label: 'Otro', value: 'OTHER' }
  ];

  categoryOptions = signal<{ label: string; value: number }[]>([]);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      description: ['', Validators.required],
      total: [null, [Validators.required, Validators.min(0.01)]],
      transactionType: ['', Validators.required],
      categoryId: [null, Validators.required],
      date: [new Date(), Validators.required],
      paymentMethod: ['', Validators.required]
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
        categoryId: this.transaction.categoryId,
        date: new Date(this.transaction.date),
        paymentMethod: this.transaction.paymentMethod
      });
    } else if (changes['visible'] && this.visible && !this.transaction) {
      this.form.reset({
        date: new Date(),
        transactionType: this.defaultType // Set default type if provided
      });
    }
  }

  onSave(): void {
    if (this.form.invalid) return;

    const value = this.form.value;
    const request: TransactionRequest = {
      ...value,
      date: value.date instanceof Date
        ? value.date.toISOString().split('T')[0]
        : value.date
    };
    this.saved.emit(request);
  }

  onCancel(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.form.reset({
      date: new Date(),
      transactionType: this.defaultType
    });
  }
}
