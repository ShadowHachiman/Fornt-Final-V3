import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account } from '../models/account.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private apiUrl = `${environment.apiUrl}/accounts`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las cuentas disponibles (ADMIN o USER)
   */
  getAllAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(this.apiUrl);
  }

  /**
   * Obtiene el árbol jerárquico de cuentas
   */
  getAccountTree(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.apiUrl}/tree`);
  }

  /**
   * Busca cuentas por texto (nombre o código)
   */
  searchAccounts(searchTerm: string): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.apiUrl}?search=${searchTerm}`);
  }
}
