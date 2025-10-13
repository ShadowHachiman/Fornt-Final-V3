import { Account } from './account.model';

export interface JournalEntryDetail {
  id?: number;
  accountId?: number;
  account?: Account; // Para mostrar código y nombre en el front
  debit: number;
  credit: number;
}
