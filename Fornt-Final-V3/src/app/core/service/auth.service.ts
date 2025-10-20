import { Injectable } from '@angular/core';
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

  constructor(private http: HttpClient) {}

  /** ✅ Detecta si estamos en el navegador */
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  /** 🔐 Login: guarda token y roles */
  login(username: string, password: string): Observable<AuthUser> {
    return this.http
      .post<{ username: string; roles: string[]; accessToken: string; expiresIn: number }>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap((res) => {
          console.log('Login response:', { username: res.username, roles: res.roles, hasToken: !!res.accessToken });
          if (this.isBrowser()) {
            const expiration = new Date(Date.now() + (res.expiresIn * 1000)); // expiresIn viene en segundos
            localStorage.setItem(this.tokenKey, res.accessToken);
            localStorage.setItem(this.rolesKey, JSON.stringify(res.roles || []));
            localStorage.setItem(this.expiresKey, expiration.toISOString());
            console.log('Saved to localStorage:', {
              token: res.accessToken.substring(0, 20) + '...',
              roles: res.roles,
              expiration: expiration.toISOString()
            });
          }
        }),
        map((res) => ({
          user: {
            id: 0, // temporal hasta que venga desde /users/me
            username: res.username,
            email: '',
            role: res.roles.some(r => r.includes('ADMIN')) ? 'ADMIN' : 'USER',
            active: true,
          },
          token: {
            token: res.accessToken,
            expiresAt: new Date(Date.now() + (res.expiresIn * 1000)),
            roles: res.roles,
          },
        }))
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
    const rolesString = localStorage.getItem(this.rolesKey);
    const roles = rolesString ? JSON.parse(rolesString) : [];
    console.log('getRoles() called:', { rolesString, roles });
    return roles;
  }

  /** 👑 Verifica si el usuario es ADMIN */
  isAdmin(): boolean {
    const roles = this.getRoles();
    return roles.includes('ADMIN') || roles.includes('ROLE_ADMIN');
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
