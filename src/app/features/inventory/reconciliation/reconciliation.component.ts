import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../../core/services/inventory.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reconciliation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reconciliation.component.html',
  styleUrls: []
})
export class ReconciliationComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  products: any[] = [];
  isSubmitting = false;

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.inventoryService.getAllProducts().subscribe({
      next: (data) => {
        // Inicializamos physicalStock igual al currentStock por defecto
        this.products = data.map(p => ({
          ...p,
          physicalStock: p.currentStock
        }));
        this.cdr.detectChanges(); // Forzamos renderizado visual
      },
      error: (err) => console.error('Error cargando catálogo', err)
    });
  }

  getDifference(product: any): number {
    return product.physicalStock - product.currentStock;
  }

  getAbsDifference(product: any): number {
    return Math.abs(this.getDifference(product));
  }

  // Custom Modal State
  modalConfig = {
    isVisible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
    onClose: () => {}
  };

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

  submitReconciliation() {
    const positiveItems = this.products.filter(p => this.getDifference(p) > 0);
    const negativeItems = this.products.filter(p => this.getDifference(p) < 0);
    
    if (positiveItems.length === 0 && negativeItems.length === 0) {
      this.showModal('Sin Cambios', 'No hay diferencias de stock que ajustar respecto al sistema.', 'info');
      return;
    }

    this.isSubmitting = true;
    const userId = "00000000-0000-0000-0000-000000000000"; // Ignorado por el backend ahora

    let pendingRequests = 0;
    const checkCompletion = () => {
      pendingRequests--;
      if (pendingRequests === 0) {
        this.showModal('Toma Física Exitosa', 'El ajuste de inventario se ha enviado al sistema exitosamente y el stock ha sido corregido.', 'success', () => {
          window.location.reload(); // Recarga toda la página
        });
      }
    };

    if (positiveItems.length > 0) {
      pendingRequests++;
      const positivePayload = {
        type: 'INGRESO_COMPRA',
        receiptNumber: 'AJUS-POS-' + Date.now(),
        userId: userId,
        details: positiveItems.map(p => ({
          productId: p.id,
          quantity: this.getAbsDifference(p),
          unitPrice: p.costPrice
        }))
      };
      
      this.inventoryService.registerMovement(positivePayload).subscribe({
        next: () => checkCompletion(),
        error: (err) => {
          console.error(err);
          this.showModal('Error', 'Hubo un error al registrar el sobrante de stock.', 'error');
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    }

    if (negativeItems.length > 0) {
      pendingRequests++;
      const negativePayload = {
        type: 'EGRESO_VENTA',
        receiptNumber: 'AJUS-NEG-' + Date.now(),
        userId: userId,
        details: negativeItems.map(p => ({
          productId: p.id,
          quantity: this.getAbsDifference(p),
          unitPrice: p.costPrice
        }))
      };

      this.inventoryService.registerMovement(negativePayload).subscribe({
        next: () => checkCompletion(),
        error: (err) => {
          console.error(err);
          this.showModal('Error', 'Hubo un error al registrar la pérdida/merma de stock.', 'error');
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    }
  }
}
