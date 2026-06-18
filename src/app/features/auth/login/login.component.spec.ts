import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';

import { vi } from 'vitest';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockAuthService = {
      login: vi.fn()
    };
    mockRouter = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should invalidate form when empty', () => {
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('should validate form when filled', () => {
    component.loginForm.controls['username'].setValue('testuser');
    component.loginForm.controls['password'].setValue('password');
    expect(component.loginForm.valid).toBeTruthy();
  });

  it('should call authService and navigate on successful login', () => {
    component.loginForm.controls['username'].setValue('testuser');
    component.loginForm.controls['password'].setValue('password');
    
    mockAuthService.login.mockReturnValue(of({ token: 'fake-token' }));
    
    component.onSubmit();
    
    expect(mockAuthService.login).toHaveBeenCalledWith({ username: 'testuser', password: 'password' });
    expect(component.isLoading).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should display error message on login failure', () => {
    component.loginForm.controls['username'].setValue('testuser');
    component.loginForm.controls['password'].setValue('wrong-password');
    
    mockAuthService.login.mockReturnValue(throwError(() => new Error('Invalid credentials')));
    
    component.onSubmit();
    
    expect(mockAuthService.login).toHaveBeenCalled();
    expect(component.isLoading).toBe(false);
    expect(component.errorMsg).toBe('Credenciales inválidas. Por favor intente de nuevo.');
  });
});
