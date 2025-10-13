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

  /** 🔐 Login: guarda token y roles */
  login(username: string, password: string): Observable<AuthUser> {
    return this.http
      .post<{ token: string; roles: string[] }>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap((res) => {
          const expiration = new Date(Date.now() + 3600 * 1000); // 1 hora
          localStorage.setItem(this.tokenKey, res.token);
          localStorage.setItem(this.rolesKey, JSON.stringify(res.roles || []));
          localStorage.setItem(this.expiresKey, expiration.toISOString());
        }),
        map((res) => ({
          user: {
            id: 0, //id temporal hasta que venga el real desde /users/me
            username,
            email: '',
            role: res.roles.includes('ADMIN') ? 'ADMIN' : 'USER',
            active: true
          },
          token: {
            token: res.token,
            expiresAt: new Date(Date.now() + 3600 * 1000),
            roles: res.roles
          }
        }))
      );
  }

  /** 🧾 Devuelve el token actual */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /** 📆 Verifica si el token está vencido */
  isTokenExpired(): boolean {
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
    // (en el futuro, podés implementar un endpoint /auth/refresh)
    return of({
      token: this.getToken()!,
      expiresAt: new Date(localStorage.getItem(this.expiresKey)!),
      roles: this.getRoles()
    });
  }

  /** 🧠 Devuelve los roles almacenados */
  getRoles(): string[] {
    const roles = localStorage.getItem(this.rolesKey);
    return roles ? JSON.parse(roles) : [];
  }

  /** 👑 Verifica si el usuario es ADMIN */
  isAdmin(): boolean {
    return this.getRoles().includes('ADMIN');
  }

  /** ⚙️ Verifica si hay sesión válida */
  isAuthenticated(): boolean {
    return !!this.getToken() && !this.isTokenExpired();
  }

  /** 🚪 Logout */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.rolesKey);
    localStorage.removeItem(this.expiresKey);
  }
}
