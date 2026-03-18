import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { JournalEntry } from '../models/journal-entry.model';
import { LedgerResponse } from '../models/ledger-detail.model';

@Injectable({ providedIn: 'root' })
export class JournalEntryService {
  private readonly apiUrl = `${environment.apiUrl}/entries`;

  constructor(private http: HttpClient) {}

  /** 📘 Obtener lista de asientos contables (Libro Diario) */
  getEntries(from?: string, to?: string): Observable<JournalEntry[]> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);

    return this.http.get<JournalEntry[]>(this.apiUrl, { params });
  }

  /** 📄 Obtener un asiento contable por ID */
  getEntryById(id: number): Observable<JournalEntry> {
    return this.http.get<JournalEntry>(`${this.apiUrl}/${id}`);
  }

  /** 🧾 Crear un nuevo asiento contable */
  createEntry(entry: { date: string; description: string; lines: any[] }): Observable<JournalEntry> {
    return this.http.post<JournalEntry>(this.apiUrl, entry);
  }

  /** 📊 Obtener el Libro Mayor filtrado por cuenta y fechas */
  getLedger(account: number | string, from?: string, to?: string): Observable<LedgerResponse> {
    let params = new HttpParams().set('account', account.toString());
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);

    return this.http.get<LedgerResponse>(`${environment.apiUrl}/ledger`, { params });
  }

  /** 📅 Obtener el último asiento registrado (para validar fechas) */
  getLastEntry(): Observable<JournalEntry | null> {
    return this.http.get<JournalEntry | null>(`${this.apiUrl}/last`);
  }
}
