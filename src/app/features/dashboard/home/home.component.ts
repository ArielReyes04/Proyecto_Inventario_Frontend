import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">¡Bienvenido a Ferretería Kaños!</h1>
      <p class="text-gray-600 text-lg mb-6">Nos alegra tenerte de vuelta en el sistema, <span class="font-semibold text-primary">{{ authService.currentUser?.username }}</span>.</p>
      
      <div class="bg-blue-50 border-l-4 border-primary p-4 rounded mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <!-- Icon -->
            <svg class="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-blue-800">
              Has iniciado sesión con el rol de: 
              <span class="font-bold uppercase ml-1">{{ userRole }}</span>
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div class="bg-gray-50 rounded-lg p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
          <h3 class="font-bold text-gray-700 text-lg mb-2">Estadísticas</h3>
          <p class="text-gray-500 text-sm">Resumen de ventas e inventario del mes actual.</p>
        </div>
        <div class="bg-gray-50 rounded-lg p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
          <h3 class="font-bold text-gray-700 text-lg mb-2">Inventario</h3>
          <p class="text-gray-500 text-sm">Alertas de productos con bajo stock o vencimientos.</p>
        </div>
        <div class="bg-gray-50 rounded-lg p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
          <h3 class="font-bold text-gray-700 text-lg mb-2">Notificaciones</h3>
          <p class="text-gray-500 text-sm">No tienes notificaciones pendientes para revisar.</p>
        </div>
      </div>
    </div>
  `
})
export class HomeComponent {
  authService = inject(AuthService);

  get userRole(): string {
    return this.authService.currentUser?.roles?.[0] || 'Desconocido';
  }
}
