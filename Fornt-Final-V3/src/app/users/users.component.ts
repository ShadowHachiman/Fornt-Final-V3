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
    console.log('Toggling user status:', { userId: user.id, newStatus, currentRoles: this.auth.getRoles() });

    this.userService.toggleUserStatus(user.id, newStatus).subscribe({
      next: (updatedUser) => {
        console.log('User status updated successfully:', updatedUser);
        user.active = updatedUser.active;
        this.error = '';
      },
      error: (err) => {
        console.error('Error toggling user status:', err);
        console.log('Error details:', { status: err.status, statusText: err.statusText, error: err.error });

        if (err.status === 0) {
          this.error = 'Cannot connect to server. Please check if the backend is running.';
        } else if (err.status === 403) {
          this.error = 'Access denied. You need ADMIN privileges to perform this action.';
        } else if (err.error?.message) {
          this.error = err.error.message;
        } else if (err.error?.error) {
          this.error = err.error.error;
        } else if (err.message) {
          this.error = err.message;
        } else {
          this.error = 'Failed to update user status';
        }
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
