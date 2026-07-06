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
  templateUrl: './users.component.html',
  styleUrls: []
})
export class UsersComponent implements OnInit {

  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  
  users: any[] = [];
  isLoading = true;
  isSaving = false;
  
  // Custom Modal
  modalConfig = {
    isVisible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
    onClose: () => {}
  };

  showFeedbackModal(title: string, message: string, type: 'success' | 'error' | 'info') {
    this.modalConfig = { isVisible: true, title, message, type, onClose: () => {} };
    this.cdr.detectChanges();
  }

  closeFeedbackModal() {
    this.modalConfig.isVisible = false;
    this.cdr.detectChanges();
  }
  
  // Modals state for actions
  isModalOpen = false;
  isDeactivateModalOpen = false;
  isDeleteModalOpen = false;
  
  // Edit logic
  editMode = false;
  editingUserId: string | null = null;
  selectedUser: any = null;

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
    this.closeModal();
    this.loadUsers();
    this.showFeedbackModal('Éxito', msg, 'success');
  }

  private handleError(msg: string) {
    this.isSaving = false;
    this.showFeedbackModal('Error', msg, 'error');
    this.cdr.detectChanges();
  }
}
