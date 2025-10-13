import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly tokenKey = 'auth_token';

  constructor(private http: HttpClient) {}

  // 🔐 Login: guarda token y roles
  login(username: string, password: string): Observable<{ token: string; roles: string[] }> {
    return this.http
      .post<{ token: string; roles: string[] }>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap((res) => {
          localStorage.setItem(this.tokenKey, res.token);
          localStorage.setItem('user_roles', JSON.stringify(res.roles || []));
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('user_roles');
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // 🧠 Obtener roles guardados
  getRoles(): string[] {
    const roles = localStorage.getItem('user_roles');
    return roles ? JSON.parse(roles) : [];
  }

  // 👑 Saber si el usuario es ADMIN
  isAdmin(): boolean {
    return this.getRoles().includes('ADMIN');
  }

  // ⚙️ Saber si está autenticado
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
