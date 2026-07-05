import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InventoryService } from '../../../core/services/inventory.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="relative">
      <!-- HEADER -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Gestión de Productos</h1>
          <p class="text-gray-500 text-sm mt-1">Crea, edita y administra el catálogo de productos.</p>
        </div>
        <button (click)="openModal()" class="bg-primary hover:bg-blue-800 text-white px-4 py-2 rounded shadow-sm flex items-center font-medium transition">
          + Nuevo Producto
        </button>
      </div>

      <!-- FEEDBACK MESSAGES -->
      <div *ngIf="successMsg" class="bg-green-50 text-green-700 p-3 rounded mb-4 border border-green-200">
        {{ successMsg }}
      </div>
      <div *ngIf="errorMsg" class="bg-red-50 text-red-600 p-3 rounded mb-4 border border-red-200">
        {{ errorMsg }}
      </div>

      <!-- LOADER -->
      <div *ngIf="isLoading" class="text-center py-8 text-gray-500">
        Cargando productos...
      </div>

      <!-- TABLE -->
      <div *ngIf="!isLoading" class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU / Producto</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precios (Costo / Venta)</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let product of products" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 font-semibold">{{ product.sku }}</div>
                <div class="text-sm text-gray-500">{{ product.name }}</div>
                <div class="text-xs text-gray-400 truncate w-40">{{ product.description }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">Costo: \${{ product.costPrice | number:'1.2-2' }}</div>
                <div class="text-sm font-medium text-green-600">Venta: \${{ product.salePrice | number:'1.2-2' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">Actual: {{ product.currentStock }}</div>
                <div class="text-xs text-gray-500">Mínimo: {{ product.minimumStock }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                      [ngClass]="product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                  {{ product.active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                <button (click)="openModal(product)" class="text-indigo-600 hover:text-indigo-900 font-bold">Editar</button>
                <button (click)="openDeactivateModal(product)" class="text-yellow-600 hover:text-yellow-900 font-bold">
                  {{ product.active ? 'Desactivar' : 'Activar' }}
                </button>
              </td>
            </tr>
            <tr *ngIf="products.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">No hay productos registrados.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MODAL DE FORMULARIO DE PRODUCTO (Crear / Editar) -->
      <div *ngIf="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto pt-10 pb-10">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden flex flex-col max-h-[90vh]">
          
          <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 flex-shrink-0">
            <h3 class="text-lg font-bold text-gray-800">{{ editMode ? 'Editar Producto' : 'Registrar Nuevo Producto' }}</h3>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 focus:outline-none">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="px-6 py-4 overflow-y-auto flex-1">
            <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
              
              <h4 class="text-sm font-semibold text-primary uppercase tracking-wider mb-4 border-b pb-2">Información Básica</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input type="text" formControlName="sku" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input type="text" formControlName="name" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none">
                </div>
              </div>
              
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea formControlName="description" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none"></textarea>
              </div>

              <h4 class="text-sm font-semibold text-primary uppercase tracking-wider mb-4 border-b pb-2">Inventario y Categorización</h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select formControlName="categoryId" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none bg-white">
                    <option value="">Seleccione...</option>
                    <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                  <input type="text" formControlName="location" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
                  <input type="number" formControlName="minimumStock" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none">
                </div>
              </div>

              <h4 class="text-sm font-semibold text-primary uppercase tracking-wider mb-4 border-b pb-2">Precios</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Precio de Costo ($)</label>
                  <input type="number" step="0.01" formControlName="costPrice" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Precio de Venta ($)</label>
                  <input type="number" step="0.01" formControlName="salePrice" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none">
                </div>
              </div>

            </form>
          </div>
          
          <!-- FOOTER MODAL -->
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3 flex-shrink-0">
            <button (click)="closeModal()" type="button" class="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition font-medium">
              Cancelar
            </button>
            <button (click)="onSubmit()" [disabled]="productForm.invalid || isSaving" type="button" class="px-4 py-2 bg-primary text-white rounded hover:bg-blue-800 disabled:bg-blue-300 transition font-medium flex items-center">
              <span *ngIf="!isSaving">{{ editMode ? 'Actualizar Producto' : 'Guardar Producto' }}</span>
              <span *ngIf="isSaving">Guardando...</span>
            </button>
          </div>
          
        </div>
      </div>

      <!-- MODAL CONFIRMAR DESACTIVAR -->
      <div *ngIf="isDeactivateModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
          <div class="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 mx-auto mb-4">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h3 class="text-lg font-bold text-center text-gray-900 mb-2">¿{{ selectedProduct?.active ? 'Desactivar' : 'Activar' }} {{ selectedProduct?.name }}?</h3>
          <p class="text-sm text-center text-gray-500 mb-6">
            {{ selectedProduct?.active ? 'El producto ya no estará disponible para ventas ni ingresos si lo desactivas.' : 'El producto volverá a estar disponible en el inventario.' }}
          </p>
          <div class="flex justify-center space-x-3">
            <button (click)="isDeactivateModalOpen = false" class="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition font-medium">Cancelar</button>
            <button (click)="confirmDeactivate()" [disabled]="isSaving" class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-yellow-300 transition font-medium">
              Confirmar
            </button>
          </div>
        </div>
      </div>

    </div>
  `
})
export class ProductsComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  
  products: any[] = [];
  categories: any[] = [];
  isLoading = true;
  isSaving = false;
  
  // Modals state
  isModalOpen = false;
  isDeactivateModalOpen = false;
  
  // Edit logic
  editMode = false;
  editingProductId: string | null = null;
  selectedProduct: any = null;

  successMsg = '';
  errorMsg = '';

  productForm: FormGroup = this.fb.group({
    sku: ['', Validators.required],
    name: ['', Validators.required],
    description: [''],
    location: [''],
    costPrice: [0, [Validators.required, Validators.min(0)]],
    salePrice: [0, [Validators.required, Validators.min(0)]],
    minimumStock: [0, [Validators.required, Validators.min(0)]],
    categoryId: ['', Validators.required]
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    
    // Cargar productos
    this.inventoryService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching products', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });

    // Cargar categorías para el select
    this.inventoryService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('Error fetching categories', err)
    });
  }

  openModal(product?: any) {
    this.successMsg = '';
    this.errorMsg = '';
    
    if (product) {
      this.editMode = true;
      this.editingProductId = product.id;
      this.productForm.patchValue({
        sku: product.sku || '',
        name: product.name || '',
        description: product.description || '',
        location: product.location || '',
        costPrice: product.costPrice || 0,
        salePrice: product.salePrice || 0,
        minimumStock: product.minimumStock || 0,
        categoryId: product.category?.id || ''
      });
    } else {
      this.editMode = false;
      this.editingProductId = null;
      this.productForm.reset({ costPrice: 0, salePrice: 0, minimumStock: 0 });
    }
    
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  openDeactivateModal(product: any) {
    this.selectedProduct = product;
    this.isDeactivateModalOpen = true;
  }

  onSubmit() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMsg = '';
    this.cdr.detectChanges();
    
    const payload = { ...this.productForm.value };

    if (this.editMode && this.editingProductId) {
      // Actualizar
      this.inventoryService.updateProduct(this.editingProductId, payload).subscribe({
        next: () => {
          this.handleSuccess('Producto actualizado correctamente.');
        },
        error: (err) => {
          this.handleError('Error al actualizar el producto.');
        }
      });
    } else {
      // Crear
      this.inventoryService.createProduct(payload).subscribe({
        next: () => {
          this.handleSuccess('¡Producto creado exitosamente!');
        },
        error: (err) => {
          this.handleError('Error al crear el producto. Verifique si el SKU ya existe.');
        }
      });
    }
  }

  confirmDeactivate() {
    if (!this.selectedProduct) return;
    this.isSaving = true;
    this.cdr.detectChanges();

    this.inventoryService.toggleProductStatus(this.selectedProduct.id).subscribe({
      next: () => {
        this.isDeactivateModalOpen = false;
        this.handleSuccess(`Producto ${this.selectedProduct.active ? 'desactivado' : 'activado'} correctamente.`);
      },
      error: (err) => {
        this.isDeactivateModalOpen = false;
        this.handleError('Error al cambiar el estado del producto.');
      }
    });
  }

  private handleSuccess(msg: string) {
    this.isSaving = false;
    this.successMsg = msg;
    this.closeModal();
    this.loadData();
    
    setTimeout(() => {
      this.successMsg = '';
      this.cdr.detectChanges();
    }, 5000);
  }

  private handleError(msg: string) {
    this.isSaving = false;
    this.errorMsg = msg;
    this.cdr.detectChanges();
  }
}
