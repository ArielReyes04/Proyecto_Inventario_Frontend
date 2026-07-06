import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="min-h-screen flex">
      <!-- Left side: Image -->
      <div class="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        <div class="absolute inset-0 bg-cover bg-center transition-transform duration-10000 hover:scale-105" style="background-image: url('https://zummar.com/wp-content/uploads/2025/05/Herramientas-para-la-casa-C-1-1024x682-2.jpg');"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        <div class="relative z-10 flex flex-col justify-end p-16 w-full text-white pb-24">
          <h1 class="text-6xl font-extrabold mb-4 tracking-tight drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-white">Ferretería Kaños</h1>
          <p class="text-xl text-blue-100 max-w-lg font-light leading-relaxed drop-shadow-md">Sistema de Gestión e Inventario. Construyendo el futuro con la fuerza del norte.</p>
        </div>
      </div>
      
      <!-- Right side: Form with animated background -->
      <div class="w-full lg:w-1/2 flex items-center justify-center animated-bg relative p-8">
        <div class="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]"></div>
        <div class="max-w-md w-full bg-white/10 backdrop-blur-2xl p-10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/10 text-white z-10 transition-all hover:border-white/20">
          <div class="text-center mb-10">
            <h2 class="text-4xl font-bold tracking-tight mb-2">Bienvenido</h2>
            <p class="text-blue-100/80 font-light">Ingresa tus credenciales para continuar</p>
          </div>
          
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            
            <div *ngIf="errorMsg" class="bg-red-500/20 text-red-100 p-4 rounded-xl text-sm border border-red-500/30 backdrop-blur-md flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              {{ errorMsg }}
            </div>

            <div class="space-y-1.5 group">
              <label for="username" class="block text-sm font-medium text-blue-50/80 group-focus-within:text-blue-200 transition-colors">Usuario</label>
              <input 
                id="username" 
                type="text" 
                formControlName="username" 
                class="w-full px-5 py-3.5 bg-slate-800/40 border border-slate-600/50 rounded-xl text-white placeholder-slate-400/70 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 outline-none transition-all backdrop-blur-sm"
                placeholder="Ingrese su usuario"
              >
              <div *ngIf="loginForm.get('username')?.touched && loginForm.get('username')?.invalid" class="text-red-300 text-xs mt-1 pl-1">
                El usuario es requerido.
              </div>
            </div>

            <div class="space-y-1.5 group">
              <label for="password" class="block text-sm font-medium text-blue-50/80 group-focus-within:text-blue-200 transition-colors">Contraseña</label>
              <input 
                id="password" 
                type="password" 
                formControlName="password" 
                class="w-full px-5 py-3.5 bg-slate-800/40 border border-slate-600/50 rounded-xl text-white placeholder-slate-400/70 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 outline-none transition-all backdrop-blur-sm"
                placeholder="Ingrese su contraseña"
              >
              <div *ngIf="loginForm.get('password')?.touched && loginForm.get('password')?.invalid" class="text-red-300 text-xs mt-1 pl-1">
                La contraseña es requerida.
              </div>
            </div>

            <button 
              type="submit" 
              [disabled]="loginForm.invalid || isLoading"
              class="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-3.5 px-4 rounded-xl shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:shadow-[0_0_25px_rgba(8,145,178,0.5)] transition-all duration-300 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed flex justify-center items-center mt-8 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span *ngIf="!isLoading">Ingresar al sistema</span>
              <span *ngIf="isLoading" class="flex items-center gap-2">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Ingresando...
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animated-bg {
      background: linear-gradient(-45deg, #0f172a, #1e293b, #0c4a6e, #083344, #172554);
      background-size: 400% 400%;
      animation: gradient 15s ease infinite;
    }
    @keyframes gradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  isLoading = false;
  errorMsg = '';

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMsg = '';
      
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMsg = 'Credenciales inválidas. Por favor intente de nuevo.';
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
