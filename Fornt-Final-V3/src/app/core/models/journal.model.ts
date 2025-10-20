export interface JournalLine {
  lineNo: number;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  memo?: string;
}

export interface JournalEntry {
  id: number;
  period: string;
  number: number;
  date: string;        // ISO yyyy-MM-dd
  description: string;
  totalDebit: number;
  totalCredit: number;
  createdBy?: string | null;
  lines: JournalLine[];
}

export interface JournalResponse {
  entries: JournalEntry[];
  totalDebit: number;
  totalCredit: number;
}
