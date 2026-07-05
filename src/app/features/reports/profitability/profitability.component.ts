import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../../core/services/inventory.service';

@Component({
  selector: 'app-profitability',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div class="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 leading-tight">Reportes y Capital Inmovilizado</h2>
          <p class="mt-1 text-sm text-gray-500">Visualiza indicadores estratégicos del inventario.</p>
        </div>
        <div class="mt-4 sm:mt-0 flex gap-4">
          <button class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Exportar Excel
          </button>
          <button class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            Descargar PDF
          </button>
        </div>
      </div>

      <!-- Kpis -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate">Capital Total en Bodega</dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">\${{ totalCapital | number:'1.2-2' }}</dd>
          </div>
        </div>
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate">Ganancia Proyectada</dt>
            <dd class="mt-1 text-3xl font-semibold text-green-600">\${{ projectedProfit | number:'1.2-2' }}</dd>
          </div>
        </div>
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate">Total Productos Diferentes</dt>
            <dd class="mt-1 text-3xl font-semibold text-indigo-600">{{ products.length }}</dd>
          </div>
        </div>
      </div>

      <!-- Tabla de Capital Inmovilizado -->
      <div class="bg-white shadow rounded-lg border border-gray-200">
        <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Capital por Producto</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stock Actual</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Costo Unit.</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Invertido</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (p of products; track p.id) {
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ p.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{{ p.currentStock }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">\${{ p.costPrice | number:'1.2-2' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">\${{ (p.currentStock * p.costPrice) | number:'1.2-2' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ProfitabilityComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private cdr = inject(ChangeDetectorRef);
  
  products: any[] = [];
  totalCapital: number = 0;
  projectedProfit: number = 0;

  ngOnInit() {
    this.inventoryService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.calculateKpis();
        this.cdr.detectChanges(); // Forzamos actualización de vista
      },
      error: (err) => console.error(err)
    });
  }

  calculateKpis() {
    this.totalCapital = this.products.reduce((acc, p) => acc + (p.currentStock * p.costPrice), 0);
    const totalSalesValue = this.products.reduce((acc, p) => acc + (p.currentStock * p.salePrice), 0);
    this.projectedProfit = totalSalesValue - this.totalCapital;
  }
}
