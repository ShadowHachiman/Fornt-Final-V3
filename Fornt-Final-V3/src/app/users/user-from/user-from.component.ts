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
    roles: ['USER']
  };

  selectedRole: string = 'USER';
  error = '';
  successMessage = '';
  loading = false;

  constructor(private userService: UserService, private router: Router) {}

  onSubmit(): void {
    this.loading = true;
    this.error = '';
    this.successMessage = '';

    // Asegurar que roles sea un array con el rol seleccionado
    this.user.roles = [this.selectedRole];

    this.userService.createUser(this.user).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'User created successfully!';
        setTimeout(() => this.router.navigate(['/users']), 2000);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error creating user:', err);
        if (err.error?.message) {
          this.error = err.error.message;
        } else if (err.error?.error) {
          this.error = err.error.error;
        } else if (err.message) {
          this.error = err.message;
        } else {
          this.error = 'Error creating user. Please try again.';
        }
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }
}
