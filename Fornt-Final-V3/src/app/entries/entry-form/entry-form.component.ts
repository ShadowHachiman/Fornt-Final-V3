import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { JournalEntryService } from '../../core/service/journal-entry.service';
import { JournalEntry } from '../../core/models/journal-entry.model';
import { JournalEntryDetail } from '../../core/models/journal-entry-detail.model'; // 👈 ESTA LÍNEA
import { AccountService } from '../../core/service/account.service';
import { Account } from '../../core/models/account.model';

@Component({
  selector: 'app-entry-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.css']
})

export class EntryFormComponent {
  entry: JournalEntry = {
    id: undefined,
    date: new Date().toISOString().substring(0, 10),
    description: '',
    totalDebit: 0,
    totalCredit: 0,
    details: []
  };


  accounts: Account[] = [];
  error = '';
  loading = false;

  constructor(
    private entryService: JournalEntryService,
    private accountService: AccountService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.accountService.getAllAccounts().subscribe({
      next: (data) => (this.accounts = data),
      error: () => (this.error = 'Error loading accounts')
    });
  }

  addDetail(): void {
    this.entry.details.push({
      account: undefined,
      debit: 0,
      credit: 0
    } as JournalEntryDetail);
  }

  removeDetail(index: number): void {
    this.entry.details.splice(index, 1);
  }

  get totalDebit(): number {
    return this.entry.details.reduce((sum: number, d: any) => sum + (d.debit || 0), 0);
  }

  get totalCredit(): number {
    return this.entry.details.reduce((sum: number, d: any) => sum + (d.credit || 0), 0);
  }

  isBalanced(): boolean {
    return this.totalDebit === this.totalCredit && this.totalDebit > 0;
  }

  onSubmit(): void {
    if (!this.isBalanced()) {
      this.error = 'El asiento no está balanceado';
      return;
    }

    this.loading = true;
    this.entryService.createEntry(this.entry).subscribe({
      next: () => this.router.navigate(['/entries']),
      error: () => {
        this.error = 'Error al guardar el asiento';
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/entries']);
  }
}
