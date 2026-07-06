import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../../../core/services/inventory.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-incomes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './incomes.component.html',
  styleUrls: []
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

  // Select2 style search
  searchTerm: string = '';
  isDropdownOpen: boolean = false;

  // Custom Modal
  modalConfig = {
    isVisible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
    onClose: () => {}
  };

  constructor() {
    this.incomeForm = this.fb.group({
      receiptNumber: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadProducts();
    // Número simulado de guía/factura
    this.incomeForm.patchValue({
      receiptNumber: 'IN-' + Math.floor(Math.random() * 10000)
    });
  }

  loadProducts() {
    this.inventoryService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando productos', err);
        this.showModal('Error', 'No se pudieron cargar los productos.', 'error');
      }
    });
  }

  get filteredProducts() {
    if (!this.searchTerm) return this.products;
    const term = this.searchTerm.toLowerCase();
    return this.products.filter(p => p.name.toLowerCase().includes(term));
  }

  selectProduct(product: any) {
    this.selectedProduct = product;
    this.searchTerm = product.name;
    this.isDropdownOpen = false;
    this.quantityToAdd = 1;
  }

  clearSelection() {
    this.selectedProduct = null;
    this.searchTerm = '';
    this.isDropdownOpen = true;
    this.quantityToAdd = 1;
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

    this.clearSelection();
    this.isDropdownOpen = false;
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
        this.showModal('Ingreso Registrado', 'El ingreso de mercadería se registró exitosamente. El stock ha sido actualizado.', 'success', () => {
          window.location.reload();
        });
      },
      error: (err) => {
        console.error(err);
        this.showModal('Error de Registro', 'Hubo un error al registrar el ingreso. Revise la consola.', 'error');
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Métodos del Modal
  showModal(title: string, message: string, type: 'success' | 'error' | 'info', onClose: () => void = () => {}) {
    this.modalConfig = { isVisible: true, title, message, type, onClose };
    this.cdr.detectChanges();
  }

  closeModal() {
    this.modalConfig.isVisible = false;
    this.cdr.detectChanges();
    if (this.modalConfig.onClose) {
      this.modalConfig.onClose();
    }
  }
}
