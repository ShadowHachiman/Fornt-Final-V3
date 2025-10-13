import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JournalEntryService } from '../../core/service/journal-entry.service';
import { AccountService } from '../../core/service/account.service';
import { Account } from '../../core/models/account.model';
import { LedgerDetail } from '../../core/models/ledger-detail.model';

@Component({
  selector: 'app-ledger',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ledger.component.html',
  styleUrls: ['./ledger.component.css']
})
export class LedgerComponent implements OnInit {
  accounts: Account[] = [];
  ledger: LedgerDetail[] = [];

  selectedAccountId?: number;
  from = '';
  to = '';

  loading = false;
  error = '';

  constructor(
    private accountService: AccountService,
    private entryService: JournalEntryService
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  /** 🔹 Carga las cuentas disponibles */
  loadAccounts(): void {
    this.accountService.getAllAccounts().subscribe({
      next: (data) => (this.accounts = data),
      error: () => (this.error = 'Error cargando cuentas')
    });
  }

  /** 🔹 Consulta el libro mayor filtrado */
  loadLedger(): void {
    if (!this.selectedAccountId) {
      this.error = 'Debe seleccionar una cuenta';
      return;
    }

    this.loading = true;
    this.error = '';

    // ✅ Convertimos a string por compatibilidad con el servicio
    this.entryService.getLedger(this.selectedAccountId.toString(), this.from, this.to).subscribe({
      next: (data) => {
        this.ledger = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error cargando libro mayor';
        this.loading = false;
      }
    });
  }

  /** 🔸 Total de débitos */
  get totalDebit(): number {
    return this.ledger.reduce((sum, d) => sum + (d.debit || 0), 0);
  }

  /** 🔸 Total de créditos */
  get totalCredit(): number {
    return this.ledger.reduce((sum, d) => sum + (d.credit || 0), 0);
  }

  /** 🔸 Balance final */
  get balance(): number {
    return this.totalDebit - this.totalCredit;
  }

  getPartialBalance(index: number): number {
    return this.ledger
      .slice(0, index + 1)
      .reduce((sum, x) => sum + (x.debit || 0) - (x.credit || 0), 0);
  }
}
