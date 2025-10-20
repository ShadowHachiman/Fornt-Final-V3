// src/app/core/service/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UserCreationDTO } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly base = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /** 👤 Usuario autenticado (el backend usa el token del interceptor) */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.base}/me`);
  }

  /** 👥 Listar usuarios (autorizado por backend; no filtramos en front) */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.base);
  }

  /** ➕ Crear nuevo usuario (ADMIN) */
  createUser(formValue: any) {
    // Si tu formulario trae "roles" como ["ADMIN"] o vacío:
    const roles = Array.isArray(formValue?.roles) && formValue.roles.length
      ? formValue.roles
      : ['ROLE_USER'];

    const payload = {
      username: formValue.username,
      password: formValue.password,
      email: formValue.email,
      roles,             // puede ser ["ADMIN"] o ["ROLE_ADMIN"] — el back normaliza
      active: formValue.active ?? true
    };

    return this.http.post<User>(this.base, payload);
  }

  /** ✏️ Actualizar usuario (opcional) */
  updateUser(id: number, patch: Partial<UserCreationDTO>): Observable<User> {
    return this.http.put<User>(`${this.base}/${id}`, patch);
  }

  /** 🔄 Activar/Desactivar usuario (ADMIN) */
  toggleUserStatus(id: number, active: boolean): Observable<User> {
    return this.http.patch<User>(`${this.base}/${id}/status`, { active });
  }

  /** 🗑️ Eliminar usuario (opcional) */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
