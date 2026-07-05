import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../../core/services/inventory.service';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div class="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 leading-tight">Auditoría del Sistema</h2>
          <p class="mt-1 text-sm text-gray-500">Historial inmutable de movimientos de inventario realizados por los usuarios.</p>
        </div>
        <div class="mt-4 sm:mt-0">
          <button (click)="loadMovements()" class="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded shadow-sm flex items-center font-medium transition">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            Refrescar
          </button>
        </div>
      </div>

      <!-- LOADER -->
      <div *ngIf="isLoading" class="text-center py-12 text-gray-500">
        Cargando historial...
      </div>

      <!-- TABLE -->
      <div *ngIf="!isLoading" class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha / Hora</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario Responsable</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comprobante</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo Movimiento</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <ng-container *ngFor="let movement of movements">
              <tr class="hover:bg-gray-50 cursor-pointer" (click)="toggleDetails(movement.id)">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ movement.movementDate | date:'dd/MM/yyyy HH:mm:ss' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-primary font-bold text-xs">
                      {{ (movement.userName || 'S').charAt(0).toUpperCase() }}
                    </div>
                    <div class="ml-3 text-sm font-medium text-gray-900">
                      {{ movement.userName || 'Sistema' }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                  {{ movement.receiptNumber }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                        [ngClass]="getMovementTypeClass(movement.type)">
                    {{ formatType(movement.type) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                  \${{ movement.total | number:'1.2-2' }}
                </td>
              </tr>
              <!-- DETALLE DESPLEGABLE -->
              <tr *ngIf="expandedRow === movement.id" class="bg-gray-50">
                <td colspan="5" class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-700 mb-2">Detalle de Ítems Afectados:</div>
                  <table class="min-w-full divide-y divide-gray-200 bg-white border rounded">
                    <thead class="bg-gray-100">
                      <tr>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Producto</th>
                        <th class="px-4 py-2 text-right text-xs font-medium text-gray-500">Cantidad</th>
                        <th class="px-4 py-2 text-right text-xs font-medium text-gray-500">Precio Unit.</th>
                        <th class="px-4 py-2 text-right text-xs font-medium text-gray-500">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                      <tr *ngFor="let detail of movement.details">
                        <td class="px-4 py-2 text-sm text-gray-800">{{ detail.product?.name }} <span class="text-xs text-gray-400">({{ detail.product?.sku }})</span></td>
                        <td class="px-4 py-2 text-sm text-gray-600 text-right">{{ detail.quantity }}</td>
                        <td class="px-4 py-2 text-sm text-gray-600 text-right">\${{ detail.unitPrice | number:'1.2-2' }}</td>
                        <td class="px-4 py-2 text-sm text-gray-900 font-semibold text-right">\${{ detail.subtotal | number:'1.2-2' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </ng-container>
            <tr *ngIf="movements.length === 0">
              <td colspan="5" class="px-6 py-8 text-center text-gray-500">No hay movimientos registrados en el sistema.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AuditComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private cdr = inject(ChangeDetectorRef);
  
  movements: any[] = [];
  isLoading = true;
  expandedRow: string | null = null;

  ngOnInit() {
    this.loadMovements();
  }

  loadMovements() {
    this.isLoading = true;
    this.inventoryService.getAllMovements().subscribe({
      next: (data) => {
        // Ordenar por fecha descendente
        this.movements = data.sort((a, b) => new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime());
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching movements', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleDetails(id: string) {
    if (this.expandedRow === id) {
      this.expandedRow = null;
    } else {
      this.expandedRow = id;
    }
  }

  getMovementTypeClass(type: string): string {
    if (type.includes('INGRESO')) {
      return 'bg-green-100 text-green-800 border border-green-200';
    } else if (type.includes('EGRESO')) {
      return 'bg-red-100 text-red-800 border border-red-200';
    }
    return 'bg-gray-100 text-gray-800';
  }

  formatType(type: string): string {
    return type.replace('_', ' ');
  }
}
