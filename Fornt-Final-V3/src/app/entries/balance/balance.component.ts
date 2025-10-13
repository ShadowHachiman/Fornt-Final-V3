import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../core/service/account.service';
import { Account } from '../../core/models/account.model';

@Component({
  selector: 'app-balance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.css']
})
export class BalanceComponent implements OnInit {
  accounts: Account[] = [];
  loading = true;
  error = '';

  totalActivo = 0;
  totalPasivo = 0;
  totalPatrimonio = 0;

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.accountService.getAllAccounts().subscribe({
      next: (data) => {
        this.accounts = data;
        this.calculateTotals();
        this.loading = false;
      },
      error: () => {
        this.error = 'Error cargando cuentas';
        this.loading = false;
      }
    });
  }

  /** 🔹 Cálculo de totales según tipo y si es imputable */
  calculateTotals(): void {
    this.totalActivo = this.accounts
      .filter(a => a.typeAccount === 'ASSET' && a.isImputable)
      .reduce((sum, a) => sum + (a['balance'] || 0), 0);

    this.totalPasivo = this.accounts
      .filter(a => a.typeAccount === 'LIABILITY' && a.isImputable)
      .reduce((sum, a) => sum + (a['balance'] || 0), 0);

    this.totalPatrimonio = this.accounts
      .filter(a => a.typeAccount === 'EQUITY' && a.isImputable)
      .reduce((sum, a) => sum + (a['balance'] || 0), 0);
  }

  get totalGeneral(): number {
    return this.totalActivo - (this.totalPasivo + this.totalPatrimonio);
  }
}
