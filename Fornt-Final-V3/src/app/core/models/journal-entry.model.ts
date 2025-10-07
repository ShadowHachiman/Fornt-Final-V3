// src/app/core/models/journal-entry.model.ts

import { JournalEntryDetail } from './journal-entry-detail.model';

export interface JournalEntry {
  id?: number; // Opcional
  date: string; // Fecha del asiento (YYYY-MM-DD)
  description: string; // Descripción general del asiento
  totalDebit: number; // Suma total del Debe (Debe ser igual al totalCredit)
  totalCredit: number; // Suma total del Haber
  details: JournalEntryDetail[]; // Arreglo de líneas del asiento
}
