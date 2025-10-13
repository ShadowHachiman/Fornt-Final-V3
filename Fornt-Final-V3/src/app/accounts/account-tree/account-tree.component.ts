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
  loading = true;

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.accountService.getAccountTree().subscribe({
      next: (data: Account[]) => {
        this.accounts = data;
        this.loading = false;
      },
      error: () => {
        console.error('Error fetching account tree');
        this.loading = false;
      }
    });
  }
}
