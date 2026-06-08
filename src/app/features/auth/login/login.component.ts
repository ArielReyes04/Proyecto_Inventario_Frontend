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
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-800">Ferretería Kaños</h2>
          <p class="text-gray-500 mt-2">Sistema de Gestión e Inventario</p>
        </div>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
          
          <div *ngIf="errorMsg" class="bg-red-50 text-red-600 p-3 rounded text-sm border border-red-200">
            {{ errorMsg }}
          </div>

          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input 
              id="username" 
              type="text" 
              formControlName="username" 
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="Ingrese su usuario"
            >
            <div *ngIf="loginForm.get('username')?.touched && loginForm.get('username')?.invalid" class="text-red-500 text-xs mt-1">
              El usuario es requerido.
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input 
              id="password" 
              type="password" 
              formControlName="password" 
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="Ingrese su contraseña"
            >
            <div *ngIf="loginForm.get('password')?.touched && loginForm.get('password')?.invalid" class="text-red-500 text-xs mt-1">
              La contraseña es requerida.
            </div>
          </div>

          <button 
            type="submit" 
            [disabled]="loginForm.invalid || isLoading"
            class="w-full bg-primary hover:bg-blue-900 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center"
          >
            <span *ngIf="!isLoading">Ingresar</span>
            <span *ngIf="isLoading" class="animate-pulse">Ingresando...</span>
          </button>
        </form>
      </div>
    </div>
  `
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
