import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

/**
 * errorInterceptor - Interceptor Funcional para manejar errores globales.
 * Intercepta todas las peticiones HTTP salientes y evalúa si la respuesta 
 * trae un código de error de autorización (401) o de permisos (403).
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el backend dice "No autorizado" o "Prohibido" (el token expiró o es inválido)
      if (error.status === 401 || error.status === 403) {
        // Limpiamos la sesión y redirigimos de forma segura
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
