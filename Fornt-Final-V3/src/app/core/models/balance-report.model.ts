// Balance a una fecha específica
export interface BalanceReport {
  asOf: string;
  assets: number;
  liabilities: number;
  equity: number;
  income: number;
  expense: number;
  result: number;
  balanced: boolean;
  difference: number;
}

// Balance entre fechas (con apertura y cierre)
export interface BalanceRangeReport {
  from: string;
  to: string;
  opening: BalanceReport;
  periodAssets: number;
  periodLiabilities: number;
  periodEquity: number;
  periodIncome: number;
  periodExpense: number;
  periodResult: number;
  closing: BalanceReport;
}
