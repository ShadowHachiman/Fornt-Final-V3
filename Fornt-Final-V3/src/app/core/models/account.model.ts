export interface Account {
  id: number;
  code: string;
  name: string;
  type: string; // puedes mantenerlo si lo usa backend
  typeAccount?: 'ASSET' | 'LIABILITY' | 'EQUITY'; // usado por balance.component
  isImputable: boolean;
  active?: boolean; // usado por dashboard
  balance?: number; // usado por balance
  parentId?: number;
  children?: Account[];
}
