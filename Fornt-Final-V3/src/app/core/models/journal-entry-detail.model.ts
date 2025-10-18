export interface JournalEntryDetail {
  accountCode: string;
  debit: number;
  credit: number;
  memo?: string | null;
}
