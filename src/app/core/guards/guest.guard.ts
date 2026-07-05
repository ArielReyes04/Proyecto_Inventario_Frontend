import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * guestGuard - Guardián para proteger rutas exclusivas de invitados (como el Login).
 * 
 * Si el usuario ya está autenticado y tiene un token, no debería poder ver 
 * la pantalla de Login, por lo que será redirigido al dashboard principal (/home).
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getToken()) {
    // Si ya tiene sesión, lo mandamos al home
    return router.createUrlTree(['/home']);
  }

  // Si no tiene sesión, lo dejamos entrar a la ruta (ej. /login)
  return true;
};
