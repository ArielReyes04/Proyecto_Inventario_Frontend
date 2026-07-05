import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="w-64 h-screen bg-secondary text-white pt-20 fixed left-0 top-0 overflow-y-auto transition-transform duration-300">
      <nav class="mt-4">
        <ul class="space-y-2 px-4">
          <!-- Opciones Generales -->
          <li>
            <a routerLink="/home" routerLinkActive="bg-primary text-white" class="block px-4 py-3 rounded text-gray-300 hover:bg-gray-800 hover:text-white transition">
              <span class="font-medium">Inicio</span>
            </a>
          </li>
          
          <!-- Opciones de Ventas (Vendedor o Admin) -->
          @if (hasRole('Vendedor') || hasRole('Administrador')) {
            <li class="pt-2">
              <p class="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Mostrador</p>
              <a routerLink="/sales" routerLinkActive="bg-primary text-white" class="block px-4 py-3 rounded text-gray-300 hover:bg-gray-800 hover:text-white transition mb-1">
                <span class="font-medium">Registrar Ventas</span>
              </a>
              <a routerLink="/quick-search" routerLinkActive="bg-primary text-white" class="block px-4 py-3 rounded text-gray-300 hover:bg-gray-800 hover:text-white transition">
                <span class="font-medium">Consultas Rápidas</span>
              </a>
            </li>
          }

          <!-- Opciones de Bodega (Encargado o Admin) -->
          @if (hasRole('Encargado de Bodega') || hasRole('Administrador')) {
            <li class="pt-2">
              <p class="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Bodega e Inventario</p>
              <a routerLink="/inventory/alerts" routerLinkActive="bg-primary text-white" class="block px-4 py-3 rounded text-gray-300 hover:bg-gray-800 hover:text-white transition mb-1">
                <span class="font-medium">Alertas de Stock</span>
              </a>
              <a routerLink="/inventory/incomes" routerLinkActive="bg-primary text-white" class="block px-4 py-3 rounded text-gray-300 hover:bg-gray-800 hover:text-white transition mb-1">
                <span class="font-medium">Ingreso Mercadería</span>
              </a>
              <a routerLink="/inventory/products" routerLinkActive="bg-primary text-white" class="block px-4 py-3 rounded text-gray-300 hover:bg-gray-800 hover:text-white transition mb-1">
                <span class="font-medium">Gestión de Productos</span>
              </a>
              <a routerLink="/inventory/reconciliation" routerLinkActive="bg-primary text-white" class="block px-4 py-3 rounded text-gray-300 hover:bg-gray-800 hover:text-white transition">
                <span class="font-medium">Toma Física</span>
              </a>
            </li>
          }
          
          <!-- Opciones de Administración (Solo Admin) -->
          @if (hasRole('Administrador')) {
            <li class="pt-2">
              <p class="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Administración</p>
              <a routerLink="/admin/users" routerLinkActive="bg-primary text-white" class="block px-4 py-3 rounded text-gray-300 hover:bg-gray-800 hover:text-white transition mb-1">
                <span class="font-medium">Gestión de Usuarios</span>
              </a>
              <a routerLink="/reports/audit" routerLinkActive="bg-primary text-white" class="block px-4 py-3 rounded text-gray-300 hover:bg-gray-800 hover:text-white transition mb-1">
                <span class="font-medium">Auditoría del Sistema</span>
              </a>
              <a routerLink="/reports/profitability" routerLinkActive="bg-primary text-white" class="block px-4 py-3 rounded text-gray-300 hover:bg-gray-800 hover:text-white transition">
                <span class="font-medium">Reportes Rentabilidad</span>
              </a>
            </li>
          }
        </ul>
      </nav>
    </aside>
  `
})
export class SidebarComponent {
  authService = inject(AuthService);

  hasRole(role: string): boolean {
    const user = this.authService.currentUser;
    return user?.roles?.includes(role) ?? false;
  }
}
