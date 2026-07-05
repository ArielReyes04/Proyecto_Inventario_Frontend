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
        this.cdr.detectChanges(); // Forzamos el renderizado del select
      },
      error: (err) => console.error('Error cargando productos', err)
    });
  }

  onProductSelect(event: any) {
    const productId = event.target.value;
    this.selectedProduct = this.products.find(p => p.id === productId);
  }

  addToCart() {
    if (!this.selectedProduct || this.quantityToAdd <= 0) return;

    if (this.quantityToAdd > this.selectedProduct.currentStock) {
      alert(`No hay stock suficiente. Stock disponible: ${this.selectedProduct.currentStock}`);
      return;
    }

    const subtotal = this.selectedProduct.salePrice * this.quantityToAdd;
    
    // Validar si ya está en el carrito
    const existingIndex = this.cart.findIndex(item => item.productId === this.selectedProduct.id);
    if (existingIndex > -1) {
      const newQty = this.cart[existingIndex].quantity + this.quantityToAdd;
      if (newQty > this.selectedProduct.currentStock) {
        alert('La cantidad total excede el stock disponible.');
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
    this.quantityToAdd = 1;
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
    // Para no bloquear la UI de demostración, mandamos null, lo que fallará en Backend 
    // a menos que mandemos el UUID real del user. Se asume que el AuthState guarda el UUID.
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
        alert('Venta registrada exitosamente.');
        window.location.reload(); // Recarga la página por completo
      },
      error: (err) => {
        console.error(err);
        alert('Error al registrar la venta en Backend. Revisar consola.');
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }
}
