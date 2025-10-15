import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BalanceReport, BalanceRangeReport } from '../models/balance-report.model';

@Injectable({ providedIn: 'root' })
export class BalanceService {
  private readonly apiUrl = `${environment.apiUrl}/balance-report`;

  constructor(private http: HttpClient) {}

  /** 📊 Balance a una fecha específica */
  getBalanceAsOf(asOf: string): Observable<BalanceReport> {
    const params = new HttpParams().set('asOf', asOf);
    return this.http.get<BalanceReport>(this.apiUrl, { params });
  }

  /** 📊 Balance entre fechas (con apertura y cierre) */
  getBalanceRange(from: string, to: string): Observable<BalanceRangeReport> {
    const params = new HttpParams()
      .set('from', from)
      .set('to', to);
    return this.http.get<BalanceRangeReport>(`${this.apiUrl}/range`, { params });
  }
}
