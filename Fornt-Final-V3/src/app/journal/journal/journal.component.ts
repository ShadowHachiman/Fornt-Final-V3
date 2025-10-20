import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { JournalService } from '../../core/service/journal.service';
import { JournalEntry, JournalResponse } from '../../core/models/journal.model';

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.css'],
  providers: [DatePipe]
})
export class JournalComponent implements OnInit {
  from!: string;
  to!: string;

  loading = false;
  error = '';
  data?: JournalResponse;

  constructor(private svc: JournalService) {}

  ngOnInit(): void {
    // Rango por defecto: mes actual
    const today = new Date();
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.from = this.toISO(first);
    this.to   = this.toISO(last);

    this.load();
  }

  load(): void {
    if (!this.from || !this.to) {
      this.error = 'Debe seleccionar el rango de fechas';
      return;
    }
    this.loading = true;
    this.error = '';
    this.svc.get(this.from, this.to).subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando libro diario:', err);
        this.error = err?.message || 'Error cargando libro diario';
        this.loading = false;
      }
    });
  }

  trackByEntry(_i: number, e: JournalEntry) { return e.id; }

  get hasData(): boolean {
    return !!this.data && this.data.entries && this.data.entries.length > 0;
  }

  private toISO(d: Date): string {
    const c = new Date(d);
    c.setMinutes(c.getMinutes() - c.getTimezoneOffset());
    return c.toISOString().slice(0,10);
  }
}
