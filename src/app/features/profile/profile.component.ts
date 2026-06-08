import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ProfileService } from '../../core/services/profile.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (!password) return null;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
      
      <!-- MENU LATERAL -->
      <div class="w-full md:w-1/4 bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-fit">
        <h2 class="text-xl font-bold text-gray-800 mb-6 px-2">Configuración</h2>
        <ul class="space-y-2">
          <li>
            <button 
              (click)="activeTab = 'personal'" 
              class="w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center"
              [ngClass]="activeTab === 'personal' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              Datos Personales
            </button>
          </li>
          <li>
            <button 
              (click)="activeTab = 'password'" 
              class="w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center"
              [ngClass]="activeTab === 'password' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              Cambiar Contraseña
            </button>
          </li>
        </ul>
      </div>

      <!-- CONTENIDO -->
      <div class="w-full md:w-3/4 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        
        <!-- FEEDBACK MESSAGES -->
        <div *ngIf="successMsg" class="bg-green-50 text-green-700 p-4 rounded-lg mb-6 border border-green-200 flex items-center">
          <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
          {{ successMsg }}
        </div>
        <div *ngIf="errorMsg" class="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200 flex items-center">
          <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
          {{ errorMsg }}
        </div>

        <!-- LOADER -->
        <div *ngIf="isLoading" class="text-center py-12 text-gray-500">
          Cargando datos...
        </div>

        <!-- TAB: DATOS PERSONALES -->
        <div *ngIf="!isLoading && activeTab === 'personal'">
          <h2 class="text-2xl font-bold text-gray-800 mb-2">Datos Personales</h2>
          <p class="text-gray-500 mb-8 pb-4 border-b">Actualiza tu información de contacto e identidad básica.</p>

          <form [formGroup]="profileForm" (ngSubmit)="onUpdateProfile()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <!-- Información de Solo Lectura -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
                <div class="w-full px-4 py-2 border border-gray-300 rounded bg-gray-100 text-gray-600 cursor-not-allowed">
                  {{ currentUser?.username }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">DNI / Cédula</label>
                <div class="w-full px-4 py-2 border border-gray-300 rounded bg-gray-100 text-gray-600 cursor-not-allowed">
                  {{ currentUser?.person?.dni }}
                </div>
              </div>

              <!-- Información Editable -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Primer Nombre</label>
                <input type="text" formControlName="firstName" class="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary outline-none transition">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Segundo Nombre</label>
                <input type="text" formControlName="middleName" class="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary outline-none transition">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                <input type="text" formControlName="lastName" class="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary outline-none transition">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nacionalidad</label>
                <input type="text" formControlName="nationality" class="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary outline-none transition">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input type="text" formControlName="phoneNumber" class="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary outline-none transition">
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <input type="email" formControlName="email" class="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary outline-none transition">
              </div>
              
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Dirección Física</label>
                <input type="text" formControlName="address" class="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary outline-none transition">
              </div>
            </div>

            <div class="flex justify-end pt-4 border-t">
              <button type="submit" [disabled]="profileForm.invalid || isSaving" class="px-6 py-2 bg-primary text-white rounded shadow hover:bg-blue-800 disabled:bg-blue-300 transition font-medium">
                {{ isSaving ? 'Guardando...' : 'Guardar Cambios' }}
              </button>
            </div>
          </form>
        </div>

        <!-- TAB: CAMBIAR CONTRASEÑA -->
        <div *ngIf="!isLoading && activeTab === 'password'">
          <h2 class="text-2xl font-bold text-gray-800 mb-2">Seguridad</h2>
          <p class="text-gray-500 mb-8 pb-4 border-b">Protege tu cuenta modificando tu contraseña de acceso.</p>

          <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()" class="max-w-md">
            
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
              <input type="password" formControlName="currentPassword" class="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary outline-none transition">
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input type="password" formControlName="newPassword" class="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary outline-none transition">
              
              <!-- Indicador de seguridad -->
              <div *ngIf="passwordForm.get('newPassword')?.value" class="mt-2">
                <div class="h-1.5 w-full bg-gray-200 rounded overflow-hidden flex">
                  <div class="h-full transition-all duration-300" [ngClass]="passwordStrengthColor" [style.width]="passwordStrength + '%'"></div>
                </div>
                <span class="text-xs font-medium mt-1 inline-block" [ngClass]="passwordStrengthTextColor">{{ passwordStrengthLabel }}</span>
              </div>
            </div>

            <div class="mb-8" *ngIf="passwordForm.get('newPassword')?.value">
              <label class="block text-sm font-medium text-gray-700 mb-1">Repetir Contraseña</label>
              <input type="password" formControlName="confirmPassword" class="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary outline-none transition" [ngClass]="{'border-red-500': passwordForm.hasError('passwordMismatch')}">
              <span *ngIf="passwordForm.hasError('passwordMismatch')" class="text-xs text-red-500 mt-1 block">Las nuevas contraseñas no coinciden.</span>
            </div>

            <div class="pt-4 border-t">
              <button type="submit" [disabled]="passwordForm.invalid || isSaving" class="px-6 py-2 bg-primary text-white rounded shadow hover:bg-blue-800 disabled:bg-blue-300 transition font-medium">
                {{ isSaving ? 'Cambiando...' : 'Cambiar Contraseña' }}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  activeTab: 'personal' | 'password' = 'personal';
  isLoading = true;
  isSaving = false;
  successMsg = '';
  errorMsg = '';
  currentUser: any;

  private profileService = inject(ProfileService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  profileForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    middleName: [''],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', Validators.required],
    address: ['', Validators.required],
    nationality: ['', Validators.required]
  });

  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatchValidator });

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading = true;
    this.profileService.getProfile().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.profileForm.patchValue({
          firstName: user.person.firstName,
          middleName: user.person.middleName,
          lastName: user.person.lastName,
          email: user.person.email,
          phoneNumber: user.person.phoneNumber,
          address: user.person.address,
          nationality: user.person.nationality
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMsg = 'Error al cargar el perfil.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onUpdateProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.clearMessages();

    this.profileService.updateProfile(this.profileForm.value).subscribe({
      next: (user) => {
        this.currentUser = user;
        this.showSuccess('Tus datos personales han sido actualizados correctamente.');
      },
      error: (err) => {
        this.showError(err.error?.message || 'Error al actualizar el perfil.');
      }
    });
  }

  onChangePassword() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.clearMessages();

    const payload = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword
    };

    this.profileService.changePassword(payload).subscribe({
      next: () => {
        this.passwordForm.reset();
        this.showSuccess('Tu contraseña ha sido cambiada de forma exitosa.');
      },
      error: (err) => {
        this.showError(err.error || 'La contraseña actual no es correcta o hubo un error.');
      }
    });
  }

  clearMessages() {
    this.successMsg = '';
    this.errorMsg = '';
    this.cdr.detectChanges();
  }

  showSuccess(msg: string) {
    this.isSaving = false;
    this.successMsg = msg;
    this.cdr.detectChanges();
    setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 5000);
  }

  showError(msg: string) {
    this.isSaving = false;
    this.errorMsg = msg;
    this.cdr.detectChanges();
  }

  // ==== GETTERS DE FORTALEZA DE CONTRASEÑA ====
  get passwordStrength(): number {
    const p = this.passwordForm.get('newPassword')?.value || '';
    let strength = 0;
    if (p.length > 5) strength += 25;
    if (p.length > 8) strength += 25;
    if (/[A-Z]/.test(p)) strength += 25;
    if (/[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p)) strength += 25;
    return strength;
  }

  get passwordStrengthColor(): string {
    const s = this.passwordStrength;
    if (s === 0) return 'bg-transparent';
    if (s <= 25) return 'bg-red-500';
    if (s <= 50) return 'bg-yellow-500';
    if (s <= 75) return 'bg-blue-500';
    return 'bg-green-500';
  }

  get passwordStrengthTextColor(): string {
    const s = this.passwordStrength;
    if (s === 0) return '';
    if (s <= 25) return 'text-red-500';
    if (s <= 50) return 'text-yellow-600';
    if (s <= 75) return 'text-blue-600';
    return 'text-green-600';
  }

  get passwordStrengthLabel(): string {
    const s = this.passwordStrength;
    if (s === 0) return '';
    if (s <= 25) return 'Débil';
    if (s <= 50) return 'Aceptable';
    if (s <= 75) return 'Fuerte';
    return 'Muy Segura';
  }
}
