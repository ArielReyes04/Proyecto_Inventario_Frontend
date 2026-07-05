import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../../core/services/inventory.service';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div class="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 leading-tight">Dashboard de Alertas de Stock</h2>
          <p class="mt-1 text-sm text-gray-500">Monitoreo de productos que requieren reabastecimiento urgente.</p>
        </div>
        <div class="mt-4 sm:mt-0 flex gap-2">
           <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            Agotado (0)
          </span>
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            Bajo Stock (<= Mínimo)
          </span>
        </div>
      </div>

      @if (isLoading) {
        <div class="text-center py-12"><p class="text-gray-500">Evaluando catálogo...</p></div>
      } @else {
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          @for (p of alertProducts; track p.id) {
            <div class="bg-white overflow-hidden shadow rounded-lg border-t-4"
                 [ngClass]="p.currentStock === 0 ? 'border-red-500' : 'border-yellow-400'">
              <div class="px-4 py-5 sm:p-6">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="text-lg leading-6 font-medium text-gray-900 truncate" [title]="p.name">{{ p.name }}</h3>
                    <p class="mt-1 max-w-2xl text-xs text-gray-500">{{ p.sku }}</p>
                  </div>
                </div>
                <div class="mt-4 flex justify-between items-center border-t pt-4">
                  <div class="text-center">
                    <p class="text-xs font-medium text-gray-500 uppercase">Actual</p>
                    <p class="mt-1 text-2xl font-bold" [ngClass]="p.currentStock === 0 ? 'text-red-600' : 'text-yellow-600'">{{ p.currentStock }}</p>
                  </div>
                  <div class="text-center border-l pl-4">
                    <p class="text-xs font-medium text-gray-500 uppercase">Mínimo</p>
                    <p class="mt-1 text-xl font-semibold text-gray-700">{{ p.minimumStock }}</p>
                  </div>
                </div>
                <div class="mt-4">
                  <p class="text-xs text-gray-500">Ubicación: <span class="font-medium text-gray-800">{{ p.location }}</span></p>
                </div>
              </div>
            </div>
          }
        </div>

        @if (alertProducts.length === 0) {
          <div class="bg-green-50 border-l-4 border-green-400 p-4 mt-8">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-green-700 font-medium">
                  Excelente estado. Ningún producto se encuentra bajo su nivel de stock mínimo.
                </p>
              </div>
            </div>
          </div>
        }
      }
    </div>
  `
})
export class AlertsComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  
  alertProducts: any[] = [];
  isLoading = true;

  ngOnInit() {
    this.loadAlerts();
  }

  loadAlerts() {
    this.inventoryService.getAllProducts().subscribe({
      next: (data) => {
        // Filtrar productos críticos
        this.alertProducts = data.filter(p => p.currentStock <= p.minimumStock);
        // Ordenar primero los que tienen 0 stock
        this.alertProducts.sort((a, b) => a.currentStock - b.currentStock);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando alertas', err);
        this.isLoading = false;
      }
    });
  }
}
