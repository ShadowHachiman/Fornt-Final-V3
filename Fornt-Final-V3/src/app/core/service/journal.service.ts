import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { JournalResponse } from '../models/journal.model';

@Injectable({ providedIn: 'root' })
export class JournalService {
  private readonly api = `${environment.apiUrl}/journal`;

  constructor(private http: HttpClient) {}

  get(from: string, to: string): Observable<JournalResponse> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<JournalResponse>(this.api, { params });
  }
}
