import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';       // ✅ agregado Router
import { UserService } from '../core/service/user.service';
import { AuthService } from '../core/service/auth.service';
import { User } from '../core/models/user.model';             // ✅ agregado User

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading = true;
  error = '';

  constructor(
    private userService: UserService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error loading users';
        this.loading = false;
      }
    });
  }

  toggleStatus(user: User): void {
    const newStatus = !user.active;
    this.userService.toggleUserStatus(user.id, newStatus).subscribe({
      next: () => {
        user.active = newStatus;
      },
      error: () => {
        this.error = 'Failed to update user status';
      }
    });
  }

  goToCreateUser(): void {
    this.router.navigate(['/users/new']);
  }

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }
}
