import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InventoryService } from '../../../core/services/inventory.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './products.component.html',
  styleUrls: []
})
export class ProductsComponent implements OnInit {

  private inventoryService = inject(InventoryService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  
  products: any[] = [];
  categories: any[] = [];
  isLoading = true;
  isSaving = false;
  
  // Custom Modal
  modalConfig = {
    isVisible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
    onClose: () => {}
  };

  showFeedbackModal(title: string, message: string, type: 'success' | 'error' | 'info') {
    this.modalConfig = { isVisible: true, title, message, type, onClose: () => {} };
    this.cdr.detectChanges();
  }

  closeFeedbackModal() {
    this.modalConfig.isVisible = false;
    this.cdr.detectChanges();
  }
  
  // Modals state for forms/actions
  isModalOpen = false;
  isDeactivateModalOpen = false;
  
  // Edit logic
  editMode = false;
  editingProductId: string | null = null;
  selectedProduct: any = null;

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
    this.closeModal();
    this.loadData();
    this.showFeedbackModal('Éxito', msg, 'success');
  }

  private handleError(msg: string) {
    this.isSaving = false;
    this.showFeedbackModal('Error', msg, 'error');
    this.cdr.detectChanges();
  }
}
