import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BalanceService } from '../../core/service/balance.service';
import { BalanceReport } from '../../core/models/balance-report.model';

@Component({
  selector: 'app-balance',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.css']
})
export class BalanceComponent implements OnInit {
  balanceReport?: BalanceReport;

  // fecha local (evita desfase por UTC)
  asOf: string = this.todayLocalISO();

  loading = false;
  error = '';

  constructor(private balanceService: BalanceService) {}

  ngOnInit(): void {
    this.loadBalance();
  }

  onDateChange(): void {
    if (!this.asOf) return;
    this.loadBalance();
  }

  loadBalance(): void {
    if (!this.asOf) {
      this.error = 'Debe seleccionar una fecha';
      return;
    }
    this.loading = true;
    this.error = '';

    this.balanceService.getBalanceAsOf(this.asOf).subscribe({
      next: (data) => {
        this.balanceReport = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando balance:', err);
        this.error = err?.message || 'Error cargando balance';
        this.loading = false;
      }
    });
  }

  // Getters “seguros”
  get totalActivo()      { return this.balanceReport?.assets      ?? 0; }
  get totalPasivo()      { return this.balanceReport?.liabilities ?? 0; }
  get totalPatrimonio()  { return this.balanceReport?.equity      ?? 0; }
  get totalIngresos()    { return this.balanceReport?.income      ?? 0; }
  get totalEgresos()     { return this.balanceReport?.expense     ?? 0; }
  get resultado()        { return this.balanceReport?.result      ?? 0; }
  get isBalanced()       { return this.balanceReport?.balanced    ?? false; }
  get difference()       { return this.balanceReport?.difference  ?? 0; }

  private todayLocalISO(): string {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }
}
