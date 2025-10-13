import { JournalEntryDetail } from './journal-entry-detail.model';

export interface JournalEntry {
  id?: number;
  date: string;
  description: string;
  totalDebit: number;
  totalCredit: number;
  details: JournalEntryDetail[];
}
