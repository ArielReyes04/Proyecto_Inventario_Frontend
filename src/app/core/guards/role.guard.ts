import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * roleGuard - Guardián de rutas dinámico basado en roles (RBAC).
 * 
 * Este guard verifica si el usuario autenticado tiene al menos uno de los roles
 * requeridos especificados en los datos de la ruta (route.data.roles).
 * Si no los tiene, lo redirige al home o muestra una pantalla de acceso denegado.
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUser;
  
  // Si no hay usuario autenticado, mandar al login
  if (!user) {
    return router.createUrlTree(['/login']);
  }

  // Obtenemos los roles permitidos desde la configuración de la ruta
  const allowedRoles = route.data?.['roles'] as string[];

  // Si la ruta no especifica roles, se permite el acceso por defecto
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  // Verificamos si el usuario tiene algún rol que coincida con los permitidos
  const hasPermission = user.roles.some(role => allowedRoles.includes(role));

  if (hasPermission) {
    return true;
  }

  // Si no tiene permisos, lo redirigimos al home o acceso denegado
  return router.createUrlTree(['/home']);
};
