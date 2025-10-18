import { JournalEntryDetail } from './journal-entry-detail.model';

export interface JournalEntry {
  id?: number;
  period?: string;
  number?: number;
  reference?: string;
  date: string;
  description: string;
  createdBy?: string;
  lines: JournalEntryDetail[];
}

export interface JournalEntryCreateRequest {
  date: string;
  description: string;
  lines: JournalEntryDetail[];
}
