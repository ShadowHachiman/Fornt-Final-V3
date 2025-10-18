import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AccountService } from '../../core/service/account.service';
import { Account } from '../../core/models/account.model';

@Component({
  selector: 'app-account-tree',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './account-tree.component.html',
  styleUrls: ['./account-tree.component.css']
})
export class AccountTreeComponent implements OnInit {
  accounts: Account[] = [];
  filteredAccounts: Account[] = [];
  searchTerm = '';
  loading = false;
  error = '';
  expandedNodes = new Set<number>();

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.loadAccountTree();
  }

  loadAccountTree(): void {
    this.loading = true;
    this.accountService.getAccountTree().subscribe({
      next: (data) => {
        this.accounts = this.processAccounts(data);
        this.filteredAccounts = this.accounts;
        // Expandir todos los nodos de nivel 1 por defecto
        this.accounts.forEach(acc => this.expandedNodes.add(acc.id));
        this.loading = false;
      },
      error: () => {
        this.error = 'Error cargando plan de cuentas';
        this.loading = false;
      }
    });
  }

  processAccounts(accounts: Account[]): Account[] {
    return accounts.map(acc => ({
      ...acc,
      children: acc.children ? this.processAccounts(acc.children) : []
    }));
  }

  toggleNode(accountId: number): void {
    if (this.expandedNodes.has(accountId)) {
      this.expandedNodes.delete(accountId);
    } else {
      this.expandedNodes.add(accountId);
    }
  }

  isExpanded(accountId: number): boolean {
    return this.expandedNodes.has(accountId);
  }

  hasChildren(account: Account): boolean {
    return account.children !== undefined && account.children.length > 0;
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      ASSET: '💰',
      LIABILITY: '📋',
      EQUITY: '🏛️',
      REVENUE: '💵',
      EXPENSE: '💸'
    };
    return icons[type] || '📊';
  }

  getTypeName(type: string): string {
    const names: Record<string, string> = {
      ASSET: 'Activo',
      LIABILITY: 'Pasivo',
      EQUITY: 'Patrimonio',
      REVENUE: 'Ingreso',
      EXPENSE: 'Egreso'
    };
    return names[type] || type;
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredAccounts = this.accounts;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredAccounts = this.filterAccounts(this.accounts, term);

    // Expandir todos los nodos cuando hay búsqueda
    if (this.searchTerm.trim()) {
      this.expandAll();
    }
  }

  filterAccounts(accounts: Account[], term: string): Account[] {
    const result: Account[] = [];

    for (const account of accounts) {
      const matches =
        account.code.toLowerCase().includes(term) ||
        account.name.toLowerCase().includes(term);

      const filteredChildren = account.children
        ? this.filterAccounts(account.children, term)
        : [];

      if (matches || filteredChildren.length > 0) {
        result.push({
          ...account,
          children: filteredChildren
        });
      }
    }

    return result;
  }

  expandAll(): void {
    this.collectAllIds(this.filteredAccounts).forEach(id => this.expandedNodes.add(id));
  }

  collapseAll(): void {
    this.expandedNodes.clear();
  }

  collectAllIds(accounts: Account[]): number[] {
    let ids: number[] = [];
    for (const account of accounts) {
      ids.push(account.id);
      if (account.children) {
        ids = ids.concat(this.collectAllIds(account.children));
      }
    }
    return ids;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearch();
  }
}
