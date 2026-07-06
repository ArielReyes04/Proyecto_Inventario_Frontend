import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  template: `
    <header class="bg-slate-900/95 backdrop-blur-lg border-b border-white/10 shadow-lg w-full h-16 flex items-center justify-between px-6 fixed top-0 z-50 transition-all duration-300">
      <div class="flex items-center space-x-3 group cursor-pointer">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_12px_rgba(34,211,238,0.4)] group-hover:shadow-[0_0_18px_rgba(34,211,238,0.7)] transition-all">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <span class="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-white">Ferretería Kaños</span>
      </div>
      <div class="flex items-center space-x-6">
        <div class="flex items-center space-x-2 text-blue-100/80">
          <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
          <span class="text-sm font-medium">Hola, {{ authService.currentUser?.username }}</span>
        </div>
        
        <div class="h-6 w-px bg-white/10"></div>
        
        <button (click)="goToProfile()" class="flex items-center space-x-2 text-sm font-semibold text-blue-100/80 hover:text-cyan-300 transition-colors duration-300 group">
          <svg class="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          <span>Perfil</span>
        </button>
        
        <button (click)="logout()" class="flex items-center space-x-2 bg-slate-800/50 hover:bg-red-500/20 text-blue-100 hover:text-red-400 border border-white/5 hover:border-red-500/30 transition-all duration-300 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:shadow-red-500/20 group">
          <svg class="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          <span>Salir</span>
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
