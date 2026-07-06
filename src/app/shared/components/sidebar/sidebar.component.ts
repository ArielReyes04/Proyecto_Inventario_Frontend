import { Component, inject, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <aside [class.w-64]="!isCollapsed" [class.w-20]="isCollapsed" class="h-screen bg-slate-900 border-r border-white/10 text-white pt-20 fixed left-0 top-0 overflow-y-auto overflow-x-hidden transition-all duration-300 shadow-[4px_0_24px_rgba(0,0,0,0.2)] z-40">
      
      <!-- Botón para expandir/contraer -->
      <button (click)="onToggle()" class="absolute top-20 right-4 w-8 h-8 bg-slate-800/80 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-700 hover:text-cyan-400 transition-all z-50 border border-white/10 hover:border-cyan-400/50 shadow-md">
        <svg class="w-5 h-5 transition-transform duration-300" [class.rotate-180]="isCollapsed" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
      </button>

      <nav class="mt-12 pb-10">
        <ul class="space-y-1 px-3">
          <!-- Opciones Generales -->
          <li class="mb-4">
            <a routerLink="/home" routerLinkActive="bg-gradient-to-r from-blue-600/20 to-cyan-600/10 border-l-4 border-cyan-400 text-cyan-300 shadow-[inset_0_0_12px_rgba(34,211,238,0.1)]" [routerLinkActiveOptions]="{exact: true}" class="flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-100/70 hover:bg-slate-800/50 hover:text-blue-50 transition-all group border-l-4 border-transparent" [title]="isCollapsed ? 'Inicio' : ''">
              <svg class="w-5 h-5 flex-shrink-0 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              <span class="font-medium whitespace-nowrap transition-opacity duration-200" [class.hidden]="isCollapsed">Inicio</span>
            </a>
          </li>
          
          <div class="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4"></div>
          
          <!-- Opciones de Ventas (Vendedor o Admin) -->
          @if (hasRole('Vendedor') || hasRole('Administrador')) {
            <li class="pt-2 mb-4">
              <div class="px-4 flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3" [class.justify-center]="isCollapsed">
                <div class="w-1.5 h-1.5 rounded-full bg-cyan-500/50 flex-shrink-0"></div>
                <span [class.hidden]="isCollapsed" class="whitespace-nowrap transition-opacity duration-200">Mostrador</span>
              </div>
              <a routerLink="/sales" routerLinkActive="bg-gradient-to-r from-blue-600/20 to-cyan-600/10 border-l-4 border-cyan-400 text-cyan-300 shadow-[inset_0_0_12px_rgba(34,211,238,0.1)]" class="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-blue-100/70 hover:bg-slate-800/50 hover:text-blue-50 transition-all group mb-1 border-l-4 border-transparent" [title]="isCollapsed ? 'Registrar Ventas' : ''">
                <svg class="w-5 h-5 flex-shrink-0 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                <span class="font-medium whitespace-nowrap transition-opacity duration-200" [class.hidden]="isCollapsed">Registrar Ventas</span>
              </a>
              <a routerLink="/quick-search" routerLinkActive="bg-gradient-to-r from-blue-600/20 to-cyan-600/10 border-l-4 border-cyan-400 text-cyan-300 shadow-[inset_0_0_12px_rgba(34,211,238,0.1)]" class="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-blue-100/70 hover:bg-slate-800/50 hover:text-blue-50 transition-all group border-l-4 border-transparent" [title]="isCollapsed ? 'Consultas Rápidas' : ''">
                <svg class="w-5 h-5 flex-shrink-0 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <span class="font-medium whitespace-nowrap transition-opacity duration-200" [class.hidden]="isCollapsed">Consultas Rápidas</span>
              </a>
            </li>
            <div class="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4"></div>
          }

          <!-- Opciones de Bodega (Encargado o Admin) -->
          @if (hasRole('Encargado de Bodega') || hasRole('Administrador')) {
            <li class="pt-2 mb-4">
              <div class="px-4 flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3" [class.justify-center]="isCollapsed">
                <div class="w-1.5 h-1.5 rounded-full bg-blue-500/50 flex-shrink-0"></div>
                <span [class.hidden]="isCollapsed" class="whitespace-nowrap transition-opacity duration-200">Inventario</span>
              </div>
              <a routerLink="/inventory/alerts" routerLinkActive="bg-gradient-to-r from-blue-600/20 to-cyan-600/10 border-l-4 border-cyan-400 text-cyan-300 shadow-[inset_0_0_12px_rgba(34,211,238,0.1)]" class="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-blue-100/70 hover:bg-slate-800/50 hover:text-blue-50 transition-all group mb-1 border-l-4 border-transparent" [title]="isCollapsed ? 'Alertas de Stock' : ''">
                <svg class="w-5 h-5 flex-shrink-0 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                <span class="font-medium whitespace-nowrap transition-opacity duration-200" [class.hidden]="isCollapsed">Alertas de Stock</span>
              </a>
              <a routerLink="/inventory/incomes" routerLinkActive="bg-gradient-to-r from-blue-600/20 to-cyan-600/10 border-l-4 border-cyan-400 text-cyan-300 shadow-[inset_0_0_12px_rgba(34,211,238,0.1)]" class="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-blue-100/70 hover:bg-slate-800/50 hover:text-blue-50 transition-all group mb-1 border-l-4 border-transparent" [title]="isCollapsed ? 'Ingreso Mercadería' : ''">
                <svg class="w-5 h-5 flex-shrink-0 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                <span class="font-medium whitespace-nowrap transition-opacity duration-200" [class.hidden]="isCollapsed">Ingreso Mercadería</span>
              </a>
              <a routerLink="/inventory/products" routerLinkActive="bg-gradient-to-r from-blue-600/20 to-cyan-600/10 border-l-4 border-cyan-400 text-cyan-300 shadow-[inset_0_0_12px_rgba(34,211,238,0.1)]" class="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-blue-100/70 hover:bg-slate-800/50 hover:text-blue-50 transition-all group mb-1 border-l-4 border-transparent" [title]="isCollapsed ? 'Gestión de Productos' : ''">
                <svg class="w-5 h-5 flex-shrink-0 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                <span class="font-medium whitespace-nowrap transition-opacity duration-200" [class.hidden]="isCollapsed">Gestión de Productos</span>
              </a>
              <a routerLink="/inventory/reconciliation" routerLinkActive="bg-gradient-to-r from-blue-600/20 to-cyan-600/10 border-l-4 border-cyan-400 text-cyan-300 shadow-[inset_0_0_12px_rgba(34,211,238,0.1)]" class="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-blue-100/70 hover:bg-slate-800/50 hover:text-blue-50 transition-all group border-l-4 border-transparent" [title]="isCollapsed ? 'Toma Física' : ''">
                <svg class="w-5 h-5 flex-shrink-0 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                <span class="font-medium whitespace-nowrap transition-opacity duration-200" [class.hidden]="isCollapsed">Toma Física</span>
              </a>
            </li>
            <div class="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4"></div>
          }
          
          <!-- Opciones de Administración (Solo Admin) -->
          @if (hasRole('Administrador')) {
            <li class="pt-2 mb-4">
              <div class="px-4 flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3" [class.justify-center]="isCollapsed">
                <div class="w-1.5 h-1.5 rounded-full bg-indigo-500/50 flex-shrink-0"></div>
                <span [class.hidden]="isCollapsed" class="whitespace-nowrap transition-opacity duration-200">Administración</span>
              </div>
              <a routerLink="/admin/users" routerLinkActive="bg-gradient-to-r from-blue-600/20 to-cyan-600/10 border-l-4 border-cyan-400 text-cyan-300 shadow-[inset_0_0_12px_rgba(34,211,238,0.1)]" class="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-blue-100/70 hover:bg-slate-800/50 hover:text-blue-50 transition-all group mb-1 border-l-4 border-transparent" [title]="isCollapsed ? 'Gestión de Usuarios' : ''">
                <svg class="w-5 h-5 flex-shrink-0 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                <span class="font-medium whitespace-nowrap transition-opacity duration-200" [class.hidden]="isCollapsed">Gestión de Usuarios</span>
              </a>
              <a routerLink="/reports/audit" routerLinkActive="bg-gradient-to-r from-blue-600/20 to-cyan-600/10 border-l-4 border-cyan-400 text-cyan-300 shadow-[inset_0_0_12px_rgba(34,211,238,0.1)]" class="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-blue-100/70 hover:bg-slate-800/50 hover:text-blue-50 transition-all group mb-1 border-l-4 border-transparent" [title]="isCollapsed ? 'Auditoría del Sistema' : ''">
                <svg class="w-5 h-5 flex-shrink-0 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                <span class="font-medium whitespace-nowrap transition-opacity duration-200" [class.hidden]="isCollapsed">Auditoría del Sistema</span>
              </a>
              <a routerLink="/reports/profitability" routerLinkActive="bg-gradient-to-r from-blue-600/20 to-cyan-600/10 border-l-4 border-cyan-400 text-cyan-300 shadow-[inset_0_0_12px_rgba(34,211,238,0.1)]" class="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-blue-100/70 hover:bg-slate-800/50 hover:text-blue-50 transition-all group border-l-4 border-transparent" [title]="isCollapsed ? 'Reportes Rentabilidad' : ''">
                <svg class="w-5 h-5 flex-shrink-0 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
                <span class="font-medium whitespace-nowrap transition-opacity duration-200" [class.hidden]="isCollapsed">Reportes Rentabilidad</span>
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
  
  isCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<boolean>();

  onToggle() {
    this.isCollapsed = !this.isCollapsed;
    this.toggleSidebar.emit(this.isCollapsed);
  }

  hasRole(role: string): boolean {
    const user = this.authService.currentUser;
    return user?.roles?.includes(role) ?? false;
  }
}
