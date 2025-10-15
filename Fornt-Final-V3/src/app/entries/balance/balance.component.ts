import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BalanceService } from '../../core/service/balance.service';
import { BalanceReport } from '../../core/models/balance-report.model';

@Component({
  selector: 'app-balance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.css']
})
export class BalanceComponent implements OnInit {
  balanceReport?: BalanceReport;
  asOf: string = new Date().toISOString().substring(0, 10);
  loading = false;
  error = '';

  constructor(private balanceService: BalanceService) {}

  ngOnInit(): void {
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
        this.error = err.message || 'Error cargando balance';
        this.loading = false;
      }
    });
  }

  get totalActivo(): number {
    return this.balanceReport?.assets || 0;
  }

  get totalPasivo(): number {
    return this.balanceReport?.liabilities || 0;
  }

  get totalPatrimonio(): number {
    return this.balanceReport?.equity || 0;
  }

  get totalIngresos(): number {
    return this.balanceReport?.income || 0;
  }

  get totalEgresos(): number {
    return this.balanceReport?.expense || 0;
  }

  get resultado(): number {
    return this.balanceReport?.result || 0;
  }

  get isBalanced(): boolean {
    return this.balanceReport?.balanced || false;
  }

  get difference(): number {
    return this.balanceReport?.difference || 0;
  }
}
