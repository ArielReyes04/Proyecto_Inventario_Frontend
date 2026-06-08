import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (!password) return null; // Solo valida si hay contraseña
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="relative">
      <!-- HEADER -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
          <p class="text-gray-500 text-sm mt-1">Crea, edita y administra los accesos de los empleados.</p>
        </div>
        <button (click)="openModal()" class="bg-primary hover:bg-blue-800 text-white px-4 py-2 rounded shadow-sm flex items-center font-medium transition">
          + Nuevo Usuario
        </button>
      </div>

      <!-- FEEDBACK MESSAGES -->
      <div *ngIf="successMsg" class="bg-green-50 text-green-700 p-3 rounded mb-4 border border-green-200">
        {{ successMsg }}
      </div>
      <div *ngIf="errorMsg" class="bg-red-50 text-red-600 p-3 rounded mb-4 border border-red-200">
        {{ errorMsg }}
      </div>

      <!-- LOADER -->
      <div *ngIf="isLoading" class="text-center py-8 text-gray-500">
        Cargando usuarios...
      </div>

      <!-- TABLE -->
      <div *ngIf="!isLoading" class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario / Rol</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let user of users" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-primary font-bold">
                    {{ user.person?.firstName?.charAt(0) || user?.username?.charAt(0)?.toUpperCase() || 'U' }}
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ user.person?.firstName }} {{ user.person?.lastName }}
                    </div>
                    <div class="text-sm text-gray-500">{{ user.person?.email || user?.username + '@empresa.com' }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 font-semibold mb-1">{{ user?.username }}</div>
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {{ user.roles && user.roles.length > 0 ? user.roles[0] : 'Sin Rol' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                      [ngClass]="user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                  {{ user.active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                <button (click)="openModal(user)" class="text-indigo-600 hover:text-indigo-900 font-bold">Editar</button>
                <button (click)="openDeactivateModal(user)" class="text-yellow-600 hover:text-yellow-900 font-bold">
                  {{ user.active ? 'Desactivar' : 'Activar' }}
                </button>
                <button (click)="openDeleteModal(user)" class="text-red-600 hover:text-red-900 font-bold">Eliminar</button>
              </td>
            </tr>
            <tr *ngIf="users.length === 0">
              <td colspan="4" class="px-6 py-4 text-center text-gray-500">No hay usuarios registrados.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MODAL DE FORMULARIO DE USUARIO (Crear / Editar) -->
      <div *ngIf="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto pt-10 pb-10">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden flex flex-col max-h-[90vh]">
          
          <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 flex-shrink-0">
            <h3 class="text-lg font-bold text-gray-800">{{ editMode ? 'Editar Empleado' : 'Registrar Nuevo Empleado' }}</h3>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 focus:outline-none">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="px-6 py-4 overflow-y-auto flex-1">
            <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
              
              <!-- Información de la Persona -->
              <h4 class="text-sm font-semibold text-primary uppercase tracking-wider mb-4 border-b pb-2">Datos Personales</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">DNI (Cédula)</label>
                  <input type="text" formControlName="dni" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nacionalidad</label>
                  <input type="text" formControlName="nationality" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Primer Nombre</label>
                  <input type="text" formControlName="firstName" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Segundo Nombre</label>
                  <input type="text" formControlName="middleName" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                  <input type="text" formControlName="lastName" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input type="text" formControlName="phoneNumber" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none">
                </div>
              </div>

              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input type="text" formControlName="address" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none">
              </div>

              <div class="mb-8">
                <label class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <input type="email" formControlName="email" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none">
              </div>

              <!-- Información de Acceso -->
              <h4 class="text-sm font-semibold text-primary uppercase tracking-wider mb-4 border-b pb-2">Datos de Sistema</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Rol en el Sistema</label>
                  <select formControlName="role" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none bg-white">
                    <option value="">Seleccione un Rol...</option>
                    <option value="Administrador">Administrador</option>
                    <option value="Encargado de Bodega">Encargado de Bodega</option>
                    <option value="Vendedor">Vendedor</option>
                    <option value="Asistente de Compras">Asistente de Compras</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario {{ editMode ? '(No editable)' : '(Opcional)' }}</label>
                  <input type="text" formControlName="username" [placeholder]="editMode ? '' : 'Autogenerado si está vacío'" [readonly]="editMode" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none" [ngClass]="{'bg-gray-200 text-gray-500': editMode, 'bg-gray-50 text-gray-500': !editMode}">
                </div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    {{ editMode ? 'Nueva Contraseña (Opcional)' : 'Contraseña (Opcional)' }}
                  </label>
                  <input type="password" formControlName="password" [placeholder]="editMode ? 'Deje en blanco para mantener actual' : 'DNI por defecto si está vacío'" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none bg-gray-50">
                  <!-- Indicador de seguridad -->
                  <div *ngIf="userForm.get('password')?.value" class="mt-2">
                    <div class="h-1.5 w-full bg-gray-200 rounded overflow-hidden flex">
                      <div class="h-full transition-all duration-300" [ngClass]="passwordStrengthColor" [style.width]="passwordStrength + '%'"></div>
                    </div>
                    <span class="text-xs font-medium mt-1 inline-block" [ngClass]="passwordStrengthTextColor">{{ passwordStrengthLabel }}</span>
                  </div>
                </div>

                <!-- Repetir contraseña aparece solo si se ha escrito algo en contraseña -->
                <div *ngIf="userForm.get('password')?.value">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
                  <input type="password" formControlName="confirmPassword" placeholder="Repita la contraseña" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none bg-gray-50" [ngClass]="{'border-red-500': userForm.hasError('passwordMismatch')}">
                  <span *ngIf="userForm.hasError('passwordMismatch')" class="text-xs text-red-500 mt-1">Las contraseñas no coinciden.</span>
                </div>
              </div>

            </form>
          </div>
          
          <!-- FOOTER MODAL -->
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3 flex-shrink-0">
            <button (click)="closeModal()" type="button" class="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition font-medium">
              Cancelar
            </button>
            <button (click)="onSubmit()" [disabled]="userForm.invalid || isSaving" type="button" class="px-4 py-2 bg-primary text-white rounded hover:bg-blue-800 disabled:bg-blue-300 transition font-medium flex items-center">
              <span *ngIf="!isSaving">{{ editMode ? 'Actualizar Usuario' : 'Guardar Usuario' }}</span>
              <span *ngIf="isSaving">Guardando...</span>
            </button>
          </div>
          
        </div>
      </div>

      <!-- MODAL CONFIRMAR DESACTIVAR -->
      <div *ngIf="isDeactivateModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
          <div class="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 mx-auto mb-4">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h3 class="text-lg font-bold text-center text-gray-900 mb-2">¿{{ selectedUser?.active ? 'Desactivar' : 'Activar' }} a {{ selectedUser?.username }}?</h3>
          <p class="text-sm text-center text-gray-500 mb-6">
            El usuario {{ selectedUser?.active ? 'no podrá acceder al sistema mientras esté inactivo.' : 'volverá a tener acceso al sistema.' }} ¿Deseas continuar?
          </p>
          <div class="flex justify-center space-x-3">
            <button (click)="isDeactivateModalOpen = false" class="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition font-medium">Cancelar</button>
            <button (click)="confirmDeactivate()" [disabled]="isSaving" class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-yellow-300 transition font-medium">
              Confirmar
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL CONFIRMAR ELIMINAR -->
      <div *ngIf="isDeleteModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
          <div class="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </div>
          <h3 class="text-lg font-bold text-center text-gray-900 mb-2">¿Eliminar a {{ selectedUser?.username }}?</h3>
          <p class="text-sm text-center text-gray-500 mb-6">
            Esta acción eliminará al usuario del listado. Sus registros históricos permanecerán en la base de datos (Borrado Lógico).
          </p>
          <div class="flex justify-center space-x-3">
            <button (click)="isDeleteModalOpen = false" class="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition font-medium">Cancelar</button>
            <button (click)="confirmDelete()" [disabled]="isSaving" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-300 transition font-medium">
              Eliminar
            </button>
          </div>
        </div>
      </div>

    </div>
  `
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  
  users: any[] = [];
  isLoading = true;
  isSaving = false;
  
  // Modals state
  isModalOpen = false;
  isDeactivateModalOpen = false;
  isDeleteModalOpen = false;
  
  // Edit logic
  editMode = false;
  editingUserId: string | null = null;
  selectedUser: any = null;

  successMsg = '';
  errorMsg = '';

  userForm: FormGroup = this.fb.group({
    dni: ['', Validators.required],
    firstName: ['', Validators.required],
    middleName: [''],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', Validators.required],
    address: ['', Validators.required],
    nationality: ['Ecuatoriana', Validators.required],
    role: ['', Validators.required],
    username: [''],
    password: [''],
    confirmPassword: ['']
  }, { validators: passwordMatchValidator });

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching users', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ==== GETTERS DE FORTALEZA DE CONTRASEÑA ====
  get passwordStrength(): number {
    const p = this.userForm.get('password')?.value || '';
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

  // ==== LÓGICA DE MODALES ====

  openModal(user?: any) {
    this.successMsg = '';
    this.errorMsg = '';
    
    if (user) {
      this.editMode = true;
      this.editingUserId = user.id;
      // Llenar formulario con datos del usuario existente
      this.userForm.patchValue({
        dni: user.person?.dni || '',
        firstName: user.person?.firstName || '',
        middleName: user.person?.middleName || '',
        lastName: user.person?.lastName || '',
        email: user.person?.email || '',
        phoneNumber: user.person?.phoneNumber || '',
        address: user.person?.address || '',
        nationality: user.person?.nationality || 'Ecuatoriana',
        role: user.roles && user.roles.length > 0 ? user.roles[0] : '',
        username: user.username || '',
        password: '', // Las contraseñas no se cargan por seguridad
        confirmPassword: ''
      });
    } else {
      this.editMode = false;
      this.editingUserId = null;
      this.userForm.reset({ nationality: 'Ecuatoriana', role: '' });
    }
    
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  openDeactivateModal(user: any) {
    this.selectedUser = user;
    this.isDeactivateModalOpen = true;
  }

  openDeleteModal(user: any) {
    this.selectedUser = user;
    this.isDeleteModalOpen = true;
  }

  // ==== ACCIONES ====

  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMsg = '';
    this.cdr.detectChanges();
    
    const payload = { ...this.userForm.value };
    
    // Auto-generar si estamos creando
    if (!this.editMode) {
      if (!payload.username) {
        payload.username = payload.firstName.charAt(0).toLowerCase() + payload.lastName.toLowerCase().replace(/\\s/g, '');
      }
      if (!payload.password) {
        payload.password = payload.dni;
      }
    }

    // Remover confirmPassword del payload que va al backend
    delete payload.confirmPassword;

    if (this.editMode && this.editingUserId) {
      // Actualizar
      this.userService.updateUser(this.editingUserId, payload).subscribe({
        next: () => {
          this.handleSuccess('Usuario actualizado correctamente.');
        },
        error: (err) => {
          this.handleError('Error al actualizar: ' + (err.error?.message || 'Conflictos con DNI o Correo.'));
        }
      });
    } else {
      // Crear
      this.userService.createUser(payload).subscribe({
        next: () => {
          this.handleSuccess('¡Usuario creado exitosamente!');
        },
        error: (err) => {
          this.handleError('Error al crear el usuario. Verifique si el DNI o Email ya existen.');
        }
      });
    }
  }

  confirmDeactivate() {
    if (!this.selectedUser) return;
    this.isSaving = true;
    this.cdr.detectChanges();

    this.userService.toggleUserStatus(this.selectedUser.id).subscribe({
      next: () => {
        this.isDeactivateModalOpen = false;
        this.handleSuccess(`Usuario ${this.selectedUser.active ? 'desactivado' : 'activado'} correctamente.`);
      },
      error: (err) => {
        this.isDeactivateModalOpen = false;
        this.handleError('Error al cambiar el estado del usuario.');
      }
    });
  }

  confirmDelete() {
    if (!this.selectedUser) return;
    this.isSaving = true;
    this.cdr.detectChanges();

    this.userService.deleteUser(this.selectedUser.id).subscribe({
      next: () => {
        this.isDeleteModalOpen = false;
        this.handleSuccess('Usuario eliminado correctamente.');
      },
      error: (err) => {
        this.isDeleteModalOpen = false;
        this.handleError('Error al eliminar al usuario.');
      }
    });
  }

  // ==== UTILIDADES ====

  private handleSuccess(msg: string) {
    this.isSaving = false;
    this.successMsg = msg;
    this.closeModal();
    this.loadUsers();
    
    setTimeout(() => {
      this.successMsg = '';
      this.cdr.detectChanges();
    }, 5000);
  }

  private handleError(msg: string) {
    this.isSaving = false;
    this.errorMsg = msg;
    this.cdr.detectChanges();
  }
}
