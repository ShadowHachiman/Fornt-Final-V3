import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../core/service/user.service';
import { AccountService } from '../core/service/account.service';
import { AuthService } from '../core/service/auth.service';
import { User } from '../core/models/user.model';
import { Account } from '../core/models/account.model';
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user?: User;
  totalAccounts: number = 0;
  activeAccounts: number = 0;
  totalUsers: number = 0;
  loading: boolean = true;
  userRole: string = '';

  constructor(
    public auth: AuthService,
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

  /** 🔒 Verifica si el usuario logueado es ADMIN */
  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  private loadDashboardData(): void {
    this.loading = true;

    // 👤 Obtener usuario actual (disponible para todos los usuarios autenticados)
    this.userService.getCurrentUser().subscribe({
      next: (user) => (this.user = user),
      error: () => console.error('Error al obtener usuario actual')
    });

    // 📊 Cargar cuentas (disponible para todos los usuarios autenticados)
    this.accountService.getAllAccounts().subscribe({
      next: (accounts: Account[]) => {
        this.totalAccounts = accounts.length;
        this.activeAccounts = accounts.filter((a) => a.active).length;

        // Si no es admin, terminamos la carga aquí
        if (!this.isAdmin()) {
          this.loading = false;
        }
      },
      error: () => {
        console.error('Error al obtener cuentas');
        if (!this.isAdmin()) {
          this.loading = false;
        }
      }
    });

    // 👥 Solo cargar usuarios si es ADMIN
    if (this.isAdmin()) {
      this.userService.getAllUsers().subscribe({
        next: (users: User[]) => {
          this.totalUsers = users.length;
          this.loading = false;
        },
        error: () => {
          console.error('Error al obtener usuarios');
          this.loading = false;
        }
      });
    }
  }
}
