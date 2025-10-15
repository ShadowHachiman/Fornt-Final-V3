import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAdmin = authService.isAdmin();
  const roles = authService.getRoles();

  console.log('🔐 Admin Guard ejecutado');
  console.log('🔐 Roles del usuario:', roles);
  console.log('🔐 Es admin?', isAdmin);

  if (isAdmin) {
    console.log('✅ Acceso permitido');
    return true;
  } else {
    console.log('❌ Acceso denegado - redirigiendo a dashboard');
    router.navigate(['/dashboard']);
    return false;
  }
};
