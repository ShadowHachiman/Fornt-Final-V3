import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../core/service/user.service';
import { AccountService } from '../core/service/account.service';
import { AuthService } from '../core/service/auth.service';
import { User } from '../core/models/user.model';
import { Account } from '../core/models/account.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user?: User;
  totalAccounts: number = 0;
  activeAccounts: number = 0;
  totalUsers: number = 0;
  loading: boolean = true;

  constructor(
    private auth: AuthService,
    private userService: UserService,
    private accountService: AccountService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  private loadDashboardData(): void {
    this.loading = true;

    this.userService.getCurrentUser().subscribe({
      next: (user) => (this.user = user),
      error: () => console.error('Error al obtener usuario actual')
    });

    this.accountService.getAllAccounts().subscribe({
      next: (accounts: Account[]) => {
        this.totalAccounts = accounts.length;
        this.activeAccounts = accounts.filter((a) => a.active).length;
      },
      error: () => console.error('Error al obtener cuentas')
    });

    this.userService.getAllUsers().subscribe({
      next: (users: User[]) => {
        this.totalUsers = users.length;
        this.loading = false;
      },
      error: () => console.error('Error al obtener usuarios')
    });
  }
}
