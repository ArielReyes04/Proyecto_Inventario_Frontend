import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../core/services/inventory.service';

@Component({
  selector: 'app-quick-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div class="mb-8 text-center">
        <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">Consultas Rápidas</h2>
        <p class="mt-4 text-lg text-gray-500">Busca disponibilidad y precios de productos en tiempo real.</p>
      </div>

      <div class="max-w-3xl mx-auto mb-10">
        <div class="relative rounded-md shadow-sm">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
          <input type="text" [(ngModel)]="searchTerm" (input)="filterProducts()" 
                 class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-lg border-gray-300 rounded-full py-4 border shadow-sm" 
                 placeholder="Ej. Martillo, Cable, SKU...">
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        @for (p of filteredProducts; track p.id) {
          <div class="bg-white overflow-hidden shadow rounded-lg border border-gray-200 transition duration-150 hover:shadow-lg">
            <div class="px-4 py-5 sm:p-6">
              <div class="flex items-center justify-between mb-4">
                <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full" 
                      [ngClass]="p.currentStock > p.minimumStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                  Stock: {{ p.currentStock }}
                </span>
                <span class="text-xs text-gray-500 font-mono">{{ p.sku }}</span>
              </div>
              <h3 class="text-lg leading-6 font-medium text-gray-900 truncate">{{ p.name }}</h3>
              <p class="mt-1 max-w-2xl text-sm text-gray-500 line-clamp-2 h-10">{{ p.description }}</p>
              
              <div class="mt-6 flex justify-between items-end border-t pt-4">
                <div>
                  <p class="text-sm font-medium text-gray-500">Ubicación</p>
                  <p class="text-sm text-gray-900 font-semibold">{{ p.location }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-gray-500">PVP</p>
                  <p class="text-2xl font-bold text-indigo-600">\${{ p.salePrice | number:'1.2-2' }}</p>
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      @if (filteredProducts.length === 0 && !isLoading) {
        <div class="text-center py-12">
          <p class="text-gray-500 text-lg">No se encontraron productos que coincidan con "{{ searchTerm }}".</p>
        </div>
      }
    </div>
  `
})
export class QuickSearchComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  
  allProducts: any[] = [];
  filteredProducts: any[] = [];
  searchTerm: string = '';
  isLoading = true;

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;
    this.inventoryService.getAllProducts().subscribe({
      next: (data) => {
        this.allProducts = data;
        this.filteredProducts = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando catálogo offline/online', err);
        this.isLoading = false;
      }
    });
  }

  filterProducts() {
    if (!this.searchTerm) {
      this.filteredProducts = this.allProducts;
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredProducts = this.allProducts.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.sku.toLowerCase().includes(term)
    );
  }
}
