export interface Account {
  id: number;
  code: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  imputable: boolean;
  active: boolean;
  parentCode?: string | null;
  balance?: number; // usado por balance
  children?: Account[];
}
