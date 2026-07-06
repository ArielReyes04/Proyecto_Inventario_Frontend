import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../../core/services/inventory.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './sales.component.html',
  styleUrls: []
})
export class SalesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private inventoryService = inject(InventoryService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  products: any[] = []; // Catálogo de productos cargados
  cart: any[] = []; // Detalles de la venta
  
  salesForm: FormGroup;
  selectedProduct: any = null;
  quantityToAdd: number = 1;
  
  total: number = 0;
  isSubmitting = false;

  // Variables para el Select buscador (estilo Select2)
  searchTerm: string = '';
  isDropdownOpen: boolean = false;

  // Variables para Modal personalizado
  modalConfig = {
    isVisible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
    onClose: () => {}
  };

  constructor() {
    this.salesForm = this.fb.group({
      receiptNumber: ['', Validators.required],
      customerId: [''] // Opcional para la demostración
    });
  }

  ngOnInit() {
    this.loadProducts();
    // Generar un número de recibo ficticio para pruebas
    this.salesForm.patchValue({
      receiptNumber: 'FAC-' + Math.floor(Math.random() * 10000)
    });
  }

  loadProducts() {
    this.inventoryService.getAllProducts().subscribe({
      next: (data) => {
        // Filtramos solo los que tienen stock > 0 para ventas
        this.products = data.filter(p => p.currentStock > 0);
        this.cdr.detectChanges(); // Forzamos el renderizado
      },
      error: (err) => {
        console.error('Error cargando productos', err);
        this.showModal('Error', 'No se pudieron cargar los productos.', 'error');
      }
    });
  }

  // Getter para los productos filtrados
  get filteredProducts() {
    if (!this.searchTerm) return this.products;
    const term = this.searchTerm.toLowerCase();
    return this.products.filter(p => p.name.toLowerCase().includes(term));
  }

  selectProduct(product: any) {
    this.selectedProduct = product;
    this.searchTerm = product.name; // Mostrar el nombre del producto en el input
    this.isDropdownOpen = false;
    this.quantityToAdd = 1;
  }

  clearSelection() {
    this.selectedProduct = null;
    this.searchTerm = '';
    this.isDropdownOpen = true;
    this.quantityToAdd = 1;
  }

  addToCart() {
    if (!this.selectedProduct || this.quantityToAdd <= 0) return;

    if (this.quantityToAdd > this.selectedProduct.currentStock) {
      this.showModal('Stock Insuficiente', `Solo hay ${this.selectedProduct.currentStock} unidades disponibles de este producto.`, 'error');
      return;
    }

    const subtotal = this.selectedProduct.salePrice * this.quantityToAdd;
    
    // Validar si ya está en el carrito
    const existingIndex = this.cart.findIndex(item => item.productId === this.selectedProduct.id);
    if (existingIndex > -1) {
      const newQty = this.cart[existingIndex].quantity + this.quantityToAdd;
      if (newQty > this.selectedProduct.currentStock) {
        this.showModal('Stock Excedido', 'La cantidad total de este producto en el carrito excede el stock disponible.', 'error');
        return;
      }
      this.cart[existingIndex].quantity = newQty;
      this.cart[existingIndex].subtotal = this.cart[existingIndex].unitPrice * newQty;
    } else {
      this.cart.push({
        productId: this.selectedProduct.id,
        productName: this.selectedProduct.name,
        quantity: this.quantityToAdd,
        unitPrice: this.selectedProduct.salePrice,
        subtotal: subtotal
      });
    }

    this.calculateTotal();
    
    // Limpiar selección para el próximo producto
    this.clearSelection();
    this.isDropdownOpen = false; // Cerrar dropdown después de añadir
  }

  removeFromCart(index: number) {
    this.cart.splice(index, 1);
    this.calculateTotal();
  }

  calculateTotal() {
    this.total = this.cart.reduce((sum, item) => sum + item.subtotal, 0);
  }

  confirmSale() {
    if (this.salesForm.invalid || this.cart.length === 0) return;

    this.isSubmitting = true;
    
    // En un entorno real se obtendría el ID de la base de datos (UUID) asociado al username.
    const userId = "00000000-0000-0000-0000-000000000000"; 

    const requestPayload = {
      type: 'EGRESO_VENTA',
      receiptNumber: this.salesForm.value.receiptNumber,
      userId: userId, 
      customerId: this.salesForm.value.customerId || null,
      details: this.cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }))
    };

    this.inventoryService.registerMovement(requestPayload).subscribe({
      next: (res) => {
        this.showModal('Venta Registrada', 'El comprobante de venta se ha guardado exitosamente.', 'success', () => {
          window.location.reload(); // Recarga la página por completo
        });
      },
      error: (err) => {
        console.error(err);
        this.showModal('Error de Registro', 'Hubo un error al registrar la venta en el servidor. Por favor, revise la consola.', 'error');
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
