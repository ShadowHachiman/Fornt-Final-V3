import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../core/service/user.service';
import { UserCreationDTO } from '../../core/models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-from.component.html',
  styleUrls: ['./user-from.component.css']
})
export class UserFormComponent {
  user: UserCreationDTO = {
    username: '',
    email: '',
    password: '',
    role: 'USER'
  };

  error = '';
  successMessage = '';
  loading = false;

  constructor(private userService: UserService, private router: Router) {}

  onSubmit(): void {
    this.loading = true;
    this.error = '';
    this.successMessage = '';
    this.userService.createUser(this.user).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = '✅ User created successfully!';
        setTimeout(() => this.router.navigate(['/users']), 2000); // 🔁 redirige tras 2s
      },
      error: () => {
        this.loading = false;
        this.error = 'Error creating user. Please try again.';
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }
}
