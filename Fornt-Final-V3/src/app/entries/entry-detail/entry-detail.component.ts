import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { JournalEntryService } from '../../core/service/journal-entry.service';
import { JournalEntry } from '../../core/models/journal-entry.model';


@Component({
  selector: 'app-entry-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './entry-detail.component.html',
  styleUrls: ['./entry-detail.component.css']
})
export class EntryDetailComponent implements OnInit {
  entry?: JournalEntry;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private entryService: JournalEntryService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'Asiento no válido';
      this.loading = false;
      return;
    }

    this.entryService.getEntryById(id).subscribe({
      next: (data) => {
        this.entry = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar el asiento';
        this.loading = false;
      }
    });
  }

  get totalDebit(): number {
    return (this.entry?.lines ?? []).reduce((sum: number, d: any) => sum + (d.debit || 0), 0);
  }

  get totalCredit(): number {
    return (this.entry?.lines ?? []).reduce((sum: number, d: any) => sum + (d.credit || 0), 0);
  }


  back(): void {
    this.router.navigate(['/entries']);
  }
}
