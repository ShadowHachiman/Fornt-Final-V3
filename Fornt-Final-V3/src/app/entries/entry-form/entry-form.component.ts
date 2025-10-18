import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { JournalEntryService } from '../../core/service/journal-entry.service';
import { JournalEntryCreateRequest } from '../../core/models/journal-entry.model';
import { JournalEntryDetail } from '../../core/models/journal-entry-detail.model';
import { AccountService } from '../../core/service/account.service';
import { Account } from '../../core/models/account.model';

@Component({
  selector: 'app-entry-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.css']
})
export class EntryFormComponent implements OnInit {
  entry: JournalEntryCreateRequest = {
    date: new Date().toISOString().substring(0, 10),
    description: '',
    lines: []
  };

  accounts: Account[] = [];
  imputables: Account[] = [];
  error = '';
  success = '';
  loading = false;

  constructor(
    private entryService: JournalEntryService,
    private accountService: AccountService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.accountService.getAllAccounts().subscribe({
      next: (data) => {
        this.accounts = data;
        // Solo cuentas imputables y activas
        this.imputables = data.filter(a => a.imputable && a.active);
      },
      error: () => (this.error = 'Error cargando cuentas')
    });
  }

  addLine(): void {
    this.entry.lines.push({
      accountCode: '',
      debit: 0,
      credit: 0,
      memo: null
    });
  }

  removeLine(index: number): void {
    this.entry.lines.splice(index, 1);
  }

  get totalDebit(): number {
    return this.entry.lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
  }

  get totalCredit(): number {
    return this.entry.lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
  }

  isBalanced(): boolean {
    const debit = Math.round(this.totalDebit * 100);
    const credit = Math.round(this.totalCredit * 100);
    return debit === credit && debit > 0;
  }

  onDebitChange(line: JournalEntryDetail): void {
    if (line.debit && line.debit > 0) {
      line.credit = 0;
    }
  }

  onCreditChange(line: JournalEntryDetail): void {
    if (line.credit && line.credit > 0) {
      line.debit = 0;
    }
  }

  getAccountName(code: string): string {
    const account = this.accounts.find(a => a.code === code);
    return account ? `${account.code} - ${account.name}` : code;
  }

  onSubmit(): void {
    this.error = '';
    this.success = '';

    if (!this.entry.date) {
      this.error = 'La fecha es requerida';
      return;
    }

    if (!this.entry.description?.trim()) {
      this.error = 'La descripción es requerida';
      return;
    }

    if (this.entry.lines.length < 2) {
      this.error = 'Debe agregar al menos 2 líneas';
      return;
    }

    if (!this.isBalanced()) {
      this.error = 'El asiento no está balanceado (Debe = Haber)';
      return;
    }

    // Validar que todas las líneas tengan cuenta seleccionada
    const invalidLines = this.entry.lines.filter(l => !l.accountCode);
    if (invalidLines.length > 0) {
      this.error = 'Todas las líneas deben tener una cuenta seleccionada';
      return;
    }

    this.loading = true;
    this.entryService.createEntry(this.entry).subscribe({
      next: (response) => {
        this.success = `✅ Asiento creado exitosamente: ${response.reference}`;
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error creando asiento:', err);
        this.error = err.message || 'Error al guardar el asiento';
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
