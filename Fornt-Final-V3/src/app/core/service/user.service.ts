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
    // El formulario envía "role" (singular) como "ADMIN" o "USER"
    // Lo convertimos a un array para el backend
    let roles: string[];

    if (formValue?.role) {
      // Si viene "role" (singular), convertirlo a array
      roles = [formValue.role]; // ["ADMIN"] o ["USER"]
    } else if (Array.isArray(formValue?.roles) && formValue.roles.length) {
      // Si viene "roles" (plural) como array, usarlo
      roles = formValue.roles;
    } else {
      // Fallback: usuario normal
      roles = ['USER'];
    }

    const payload = {
      username: formValue.username,
      password: formValue.password,
      email: formValue.email,
      roles,             // ["ADMIN"] o ["USER"]
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
