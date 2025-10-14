import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, UserCreationDTO } from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  /** 👤 Obtener el usuario autenticado usando el token guardado */
  getCurrentUser(): Observable<User> {
    const token = this.auth.getToken();

    if (!token) {
      console.warn('⚠️ No hay token guardado, devolviendo usuario vacío');
      return of({
        id: 0,
        username: '',
        email: '',
        role: 'USER', // ✅ tipo literal permitido
        active: false
      } as User);
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http
      .get<User>(`${this.apiUrl}/me`, { headers })
      .pipe(
        catchError((err) => {
          console.error('❌ Error obteniendo el usuario autenticado:', err);
          return of({
            id: 0,
            username: '',
            email: '',
            role: 'USER', // ✅ se mantiene consistente con el modelo
            active: false
          } as User);
        })
      );
  }

  /** 👥 Listar todos los usuarios (solo ADMIN) */
  getAllUsers(): Observable<User[]> {
    if (!this.auth.isAdmin()) return of([] as User[]);
    return this.http.get<User[]>(this.apiUrl);
  }

  /** ➕ Crear nuevo usuario */
  createUser(user: UserCreationDTO): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  /** 🔄 Activar/Desactivar usuario */
  toggleUserStatus(id: number, active: boolean): Observable<User> {
    return this.http
      .patch<User>(`${this.apiUrl}/${id}/status`, { active })
      .pipe(catchError(() => of({} as User)));
  }
}
