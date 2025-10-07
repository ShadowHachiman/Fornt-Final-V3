// src/app/core/models/ledger-detail.model.ts

export interface LedgerDetail {
  date: string; // Fecha del movimiento
  journalEntryId: number; // ID del asiento original
  description: string; // Descripción de la línea del asiento
  debit: number;
  credit: number;
  runningBalance: number; // Saldo acumulado (calculado en el backend)
}
