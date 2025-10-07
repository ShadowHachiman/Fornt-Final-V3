// src/app/core/models/account.model.ts

export interface Account {
  id: number;
  code: string;
  name: string;
  isImputable: boolean;
  active: boolean;
  // El backend debe enviar la jerarquía usando una propiedad para los hijos
  children?: Account[];
}
