// src/app/core/models/balance-report.model.ts

export interface BalanceReportItem {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  // Estos campos se calculan en el backend
  balanceDebit: number;
  balanceCredit: number;
}
