import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  template: `
    <header class="bg-primary text-white shadow-md w-full h-16 flex items-center justify-between px-6 fixed top-0 z-50">
      <div class="flex items-center space-x-2">
        <span class="text-xl font-bold tracking-wider">Ferretería Kaños</span>
      </div>
      <div class="flex items-center space-x-4">
        <span class="text-sm">Hola, {{ authService.currentUser?.username }}</span>
        <button (click)="goToProfile()" class="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded text-sm font-semibold">
          Mi Perfil
        </button>
        <button (click)="logout()" class="bg-red-500 hover:bg-red-600 transition px-4 py-2 rounded text-sm font-semibold">
          Cerrar Sesión
        </button>
      </div>
    </header>
  `
})
export class NavbarComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
