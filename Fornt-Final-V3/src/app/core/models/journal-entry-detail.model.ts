// src/app/core/models/journal-entry-detail.model.ts

export interface JournalEntryDetail {
  id?: number; // Opcional, si es nuevo
  accountId: number; // ID de la cuenta imputable
  accountCode: string; // Código de la cuenta (para display)
  accountName: string; // Nombre de la cuenta (para display)
  description: string; // Descripción de la línea
  debit: number; // Monto en el Debe
  credit: number; // Monto en el Haber
}
