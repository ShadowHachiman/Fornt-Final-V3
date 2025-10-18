import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../service/auth.service';

/**
 * 🛡️ Error Interceptor
 * Maneja todos los errores HTTP de forma centralizada
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error inesperado';

      switch (error.status) {
        case 400: // Bad Request - Errores de validación
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else {
            errorMessage = 'Datos inválidos. Por favor revise los campos ingresados.';
          }
          console.error('❌ Validation Error:', error.error);
          break;

        case 401: // Unauthorized - Token inválido o expirado
          errorMessage = 'Sesión expirada. Por favor inicie sesión nuevamente.';
          console.error('🔒 Unauthorized:', error.message);
          authService.logout();
          router.navigate(['/auth/login'], {
            queryParams: { returnUrl: router.url }
          });
          break;

        case 403: // Forbidden - Sin permisos
          errorMessage = 'No tiene permisos para realizar esta acción.';
          console.error('🚫 Forbidden:', error.message);
          router.navigate(['/dashboard']);
          break;

        case 404: // Not Found
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else {
            errorMessage = 'Recurso no encontrado.';
          }
          console.error('🔍 Not Found:', error.url);
          break;

        case 409: // Conflict - Ya existe
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else {
            errorMessage = 'El recurso ya existe o hay un conflicto con los datos.';
          }
          console.error('⚠️ Conflict:', error.error);
          break;

        case 500: // Internal Server Error
          errorMessage = 'Error interno del servidor. Por favor intente más tarde.';
          console.error('💥 Server Error:', error.error);
          break;

        case 503: // Service Unavailable
          errorMessage = 'Servicio no disponible. Por favor intente más tarde.';
          console.error('🔧 Service Unavailable:', error.message);
          break;

        default:
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          console.error('❓ Unknown Error:', error);
      }

      // Retornar error con mensaje mejorado
      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        originalError: error
      }));
    })
  );
};
