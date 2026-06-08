import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <aside class="w-64 h-screen bg-secondary text-white pt-20 fixed left-0 top-0 overflow-y-auto transition-transform duration-300">
      <nav class="mt-4">
        <ul class="space-y-2 px-4">
          <li>
            <a routerLink="/home" routerLinkActive="bg-primary text-white" class="block px-4 py-3 rounded text-gray-300 hover:bg-gray-800 hover:text-white transition">
              <span class="font-medium">Inicio</span>
            </a>
          </li>
          
          <li *ngIf="authService.isAdmin()" class="pt-4">
            <p class="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Administración</p>
            <a routerLink="/admin/users" routerLinkActive="bg-primary text-white" class="block px-4 py-3 rounded text-gray-300 hover:bg-gray-800 hover:text-white transition">
              <span class="font-medium">Usuarios</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  `
})
export class SidebarComponent {
  authService = inject(AuthService);
}
