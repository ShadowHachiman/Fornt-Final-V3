import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { JournalEntryService } from '../../core/service/journal-entry.service';
import { JournalEntry } from '../../core/models/journal-entry.model';

@Component({
  selector: 'app-entry-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entry-list.component.html',
  styleUrls: ['./entry-list.component.css']
})
export class EntryListComponent implements OnInit {
  entries: JournalEntry[] = [];
  from = '';
  to = '';
  loading = false;
  error = '';

  constructor(private entryService: JournalEntryService, private router: Router) {}

  ngOnInit(): void {
    this.loadEntries();
  }

  loadEntries(): void {
    this.loading = true;
    this.entryService.getEntries(this.from, this.to).subscribe({
      next: (data) => {
        this.entries = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error loading journal entries';
        this.loading = false;
      }
    });
  }

  viewDetail(id: number): void {
    this.router.navigate(['/entries', id]);
  }

  newEntry(): void {
    this.router.navigate(['/entries/new']);
  }
}
