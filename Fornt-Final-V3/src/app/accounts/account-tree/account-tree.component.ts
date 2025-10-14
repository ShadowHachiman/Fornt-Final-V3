import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../core/service/account.service';
import { Account } from '../../core/models/account.model';

@Component({
  selector: 'app-account-tree',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-tree.component.html',
  styleUrls: ['./account-tree.component.css']
})
export class AccountTreeComponent implements OnInit {
  accounts: Account[] = [];
  loading = false;
  error = '';

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  private loadAccounts(): void {
    this.loading = true;
    this.accountService.getAllAccounts().subscribe({
      next: (data) => {
        this.accounts = data.map(acc => ({
          ...acc,
          children: acc.children ?? []
        }));
        this.loading = false;
      },
      error: () => {
        this.error = 'Error cargando cuentas';
        this.loading = false;
      }
    });
  }
}
