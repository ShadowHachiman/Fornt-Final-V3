import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BalanceReport } from '../models/balance-report.model';

@Injectable({ providedIn: 'root' })
export class BalanceService {
  private readonly api = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getBalanceAsOf(asOf: string): Observable<BalanceReport> {
    const params = new HttpParams().set('asOf', asOf); // yyyy-MM-dd
    return this.http.get<BalanceReport>(`${this.api}/balance-report`, { params });
  }
}
