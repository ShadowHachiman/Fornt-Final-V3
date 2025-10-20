import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { AuthUser, AuthToken } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly tokenKey = 'auth_token';
  private readonly rolesKey = 'user_roles';
  private readonly expiresKey = 'token_expiration';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /** ✅ Detecta si estamos en el navegador usando el patrón oficial de Angular */
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /** 🔐 Login: guarda token y roles */
  login(username: string, password: string): Observable<AuthUser> {
    return this.http
      .post<{ username: string; roles: string[]; accessToken: string; expiresIn: number }>(
        `${this.apiUrl}/login`,
        { username, password }
      )
      .pipe(
        tap((res) => {
          if (!this.isBrowser() || !res.accessToken) {
            return;
          }

          const expiration = new Date(Date.now() + (res.expiresIn * 1000)); // expiresIn viene en segundos

          // ✅ Normalizamos los roles para quitar el prefijo "ROLE_" y uniformar a mayúsculas
          const normalizedRoles = (res.roles || []).map(r =>
            r.replace(/^ROLE_/, '').toUpperCase()
          );

          localStorage.setItem(this.tokenKey, res.accessToken);
          localStorage.setItem(this.rolesKey, JSON.stringify(normalizedRoles));
          localStorage.setItem(this.expiresKey, expiration.toISOString());
        }),
        map((res) => {
          // También usamos los roles normalizados aquí
          const normalizedRoles = (res.roles || []).map(r =>
            r.replace(/^ROLE_/, '').toUpperCase()
          );

          return {
            user: {
              id: 0, // temporal hasta que venga desde /users/me
              username: res.username,
              email: '',
              role: normalizedRoles.some(r => r.includes('ADMIN')) ? 'ADMIN' : 'USER',
              active: true,
            },
            token: {
              token: res.accessToken,
              expiresAt: new Date(Date.now() + (res.expiresIn * 1000)),
              roles: normalizedRoles,
            },
          };
        })
      );
  }

  /** 🧾 Devuelve el token actual */
  getToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(this.tokenKey);
  }

  /** 📆 Verifica si el token está vencido */
  isTokenExpired(): boolean {
    if (!this.isBrowser()) return true;
    const expiration = localStorage.getItem(this.expiresKey);
    if (!expiration) return true;
    return new Date() > new Date(expiration);
  }

  /** ♻️ Intenta refrescar el token si está próximo a expirar */
  refreshToken(): Observable<AuthToken | null> {
    if (this.isTokenExpired()) {
      this.logout();
      return of(null);
    }
    if (!this.isBrowser()) return of(null);

    return of({
      token: this.getToken()!,
      expiresAt: new Date(localStorage.getItem(this.expiresKey)!),
      roles: this.getRoles(),
    });
  }

  /** 🧠 Devuelve los roles almacenados */
  getRoles(): string[] {
    if (!this.isBrowser()) return [];

    try {
      const roles = localStorage.getItem(this.rolesKey);
      if (roles) {
        const parsed = JSON.parse(roles);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('⚠️ Error al parsear roles de localStorage:', e);
    }

    // 🧩 Fallback: intentar decodificar desde el token (por si roles no se guardaron)
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.roles || payload.authorities || [];
      } catch (err) {
        console.warn('⚠️ No se pudo decodificar el token:', err);
      }
    }

    return [];
  }

  /** 👑 Verifica si el usuario es ADMIN */
  isAdmin(): boolean {
    const roles = this.getRoles();
    // normaliza todos los roles a mayúsculas y busca la palabra ADMIN en cualquiera
    return roles.some(r => r.toUpperCase().includes('ADMIN'));
  }

  /** ⚙️ Verifica si hay sesión válida */
  isAuthenticated(): boolean {
    if (!this.isBrowser()) return false;
    return !!this.getToken() && !this.isTokenExpired();
  }

  /** 🚪 Logout */
  logout(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.rolesKey);
    localStorage.removeItem(this.expiresKey);
  }
}
