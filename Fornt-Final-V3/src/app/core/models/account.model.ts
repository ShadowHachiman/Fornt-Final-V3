export interface Account {
  id: number;
  code: string;
  name: string;
  typeAccount: string;
  isImputable: boolean;
  active: boolean;
  parentId?: number;
  balance?: number;
}
