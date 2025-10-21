import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JournalEntryService } from '../../core/service/journal-entry.service';
import { AccountService } from '../../core/service/account.service';
import { Account } from '../../core/models/account.model';
import { LedgerDetail, LedgerResponse } from '../../core/models/ledger-detail.model';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-ledger',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './ledger.component.html',
  styleUrls: ['./ledger.component.css']
})
export class LedgerComponent implements OnInit {
  accounts: Account[] = [];
  ledgerResponse?: LedgerResponse;

  selectedAccountCode?: string;
  from = '';
  to = '';

  loading = false;
  error = '';

  get ledger(): LedgerDetail[] {
    return this.ledgerResponse?.movements || [];
  }

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
      next: (data) => {
        this.accounts = data;
      },
      error: () => {
        this.error = 'Error cargando cuentas';
      }
    });
  }

  /** 🔹 Consulta el libro mayor filtrado */
  loadLedger(): void {
    if (!this.selectedAccountCode) {
      this.error = 'Debe seleccionar una cuenta';
      return;
    }

    // 🚫 Validación: la cuenta elegida debe ser imputable (no una cuenta padre)
    const selected = this.accounts?.find(a => a.code === this.selectedAccountCode);
    if (selected && !selected.imputable) {
      this.error = 'Cuenta incorrecta: seleccioná una cuenta imputable (no una cuenta padre)';
      return;
    }

    this.loading = true;
    this.error = '';

    // ✅ Enviamos el código de la cuenta
    this.entryService.getLedger(this.selectedAccountCode, this.from, this.to).subscribe({
      next: (data) => {
        this.ledgerResponse = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        // Si el backend devuelve 400/404 por cuenta inválida, mostramos mensaje claro
        if (err?.status === 400 || err?.status === 404) {
          this.error = 'Cuenta incorrecta';
        } else {
          this.error = 'Error cargando el libro mayor';
        }
      }
    });
  }

  /** 🔸 Total de débitos (desde el backend) */
  get totalDebit(): number {
    return this.ledgerResponse?.totalDebits || 0;
  }

  /** 🔸 Total de créditos (desde el backend) */
  get totalCredit(): number {
    return this.ledgerResponse?.totalCredits || 0;
  }

  /** 🔸 Balance final (desde el backend) */
  get balance(): number {
    return this.ledgerResponse?.closingBalance || 0;
  }

  /** 🔸 Saldo de apertura */
  get openingBalance(): number {
    return this.ledgerResponse?.openingBalance || 0;
  }

  getPartialBalance(index: number): number {
    return this.ledger
      .slice(0, index + 1)
      .reduce((sum, x) => sum + (x.debit || 0) - (x.credit || 0), 0);
  }
}
