import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../../../core/services/inventory.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-incomes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div class="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 leading-tight">Ingreso de Mercadería (Compras)</h2>
          <p class="mt-1 text-sm text-gray-500">Registre el ingreso de productos enviados por los proveedores.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Panel Izquierdo -->
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Datos de la Guía</h3>
            <form [formGroup]="incomeForm" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Número de Factura / Guía</label>
                <input type="text" formControlName="receiptNumber" 
                       class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
              </div>
            </form>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Agregar Lote</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Seleccione Producto</label>
                <select (change)="onProductSelect($event)" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                  <option value="">-- Seleccionar --</option>
                  @for (p of products; track p.id) {
                    <option [value]="p.id">{{ p.name }} (Stock Actual: {{ p.currentStock }})</option>
                  }
                </select>
              </div>
              
              @if (selectedProduct) {
                <div>
                  <label class="block text-sm font-medium text-gray-700">Cantidad a Ingresar</label>
                  <div class="flex items-center space-x-2 mt-1">
                    <input type="number" min="1" [(ngModel)]="quantityToAdd" 
                           class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                    <button (click)="addToBatch()" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                      Añadir
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Panel Derecho: Lote de Ingreso -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Detalle de Ingreso</h3>
            
            <div class="flex-grow overflow-auto">
              @if (batch.length === 0) {
                <div class="text-center py-12">
                  <p class="mt-1 text-sm text-gray-500">Agregue productos para conformar el lote de ingreso.</p>
                </div>
              } @else {
                <table class="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cant.</th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Costo Unit.</th>
                      <th class="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    @for (item of batch; track item.productId; let i = $index) {
                      <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.productName }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{{ item.quantity }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">\${{ item.unitPrice | number:'1.2-2' }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button (click)="removeFromBatch(i)" class="text-red-600 hover:text-red-900 font-semibold">Eliminar</button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              }
            </div>

            <div class="mt-6 border-t pt-4">
              <button (click)="confirmIncome()" 
                      [disabled]="batch.length === 0 || incomeForm.invalid || isSubmitting"
                      class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">
                {{ isSubmitting ? 'Guardando en Sistema...' : 'Confirmar Ingreso de Mercadería' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class IncomesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private inventoryService = inject(InventoryService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  products: any[] = [];
  batch: any[] = [];
  
  incomeForm: FormGroup;
  selectedProduct: any = null;
  quantityToAdd: number = 1;
  isSubmitting = false;

  constructor() {
    this.incomeForm = this.fb.group({
      receiptNumber: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.inventoryService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.cdr.detectChanges(); // Forzamos el renderizado del select
      },
      error: (err) => console.error('Error cargando productos', err)
    });
  }

  onProductSelect(event: any) {
    const productId = event.target.value;
    this.selectedProduct = this.products.find(p => p.id === productId);
  }

  addToBatch() {
    if (!this.selectedProduct || this.quantityToAdd <= 0) return;

    const existingIndex = this.batch.findIndex(item => item.productId === this.selectedProduct.id);
    if (existingIndex > -1) {
      this.batch[existingIndex].quantity += this.quantityToAdd;
    } else {
      this.batch.push({
        productId: this.selectedProduct.id,
        productName: this.selectedProduct.name,
        quantity: this.quantityToAdd,
        unitPrice: this.selectedProduct.costPrice // El ingreso se registra al costo
      });
    }

    this.quantityToAdd = 1;
  }

  removeFromBatch(index: number) {
    this.batch.splice(index, 1);
  }

  confirmIncome() {
    if (this.incomeForm.invalid || this.batch.length === 0) return;

    this.isSubmitting = true;
    const userId = "00000000-0000-0000-0000-000000000000"; // Simulado

    const requestPayload = {
      type: 'INGRESO_COMPRA',
      receiptNumber: this.incomeForm.value.receiptNumber,
      userId: userId,
      details: this.batch.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }))
    };

    this.inventoryService.registerMovement(requestPayload).subscribe({
      next: () => {
        alert('Ingreso registrado exitosamente. Stock actualizado.');
        window.location.reload(); // Recarga la página por completo
      },
      error: (err) => {
        console.error(err);
        alert('Error al registrar el ingreso.');
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }
}
