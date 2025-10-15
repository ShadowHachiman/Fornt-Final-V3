export interface LedgerDetail {
  entryId: number;
  date: string;
  description: string;
  debit: number;
  credit: number;
}

export interface LedgerResponse {
  accountCode: string;
  accountName: string;
  from: string;
  to: string;
  openingBalance: number;
  totalDebits: number;
  totalCredits: number;
  closingBalance: number;
  movements: LedgerDetail[];
}
