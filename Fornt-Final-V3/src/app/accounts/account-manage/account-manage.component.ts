import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../core/service/account.service';
import { Account } from '../../core/models/account.model';

@Component({
  selector: 'app-account-manage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-manage.component.html',
  styleUrls: ['./account-manage.component.css']
})
export class AccountManageComponent implements OnInit {
  accountForm!: FormGroup;
  message = '';
  loading = false;

  constructor(private fb: FormBuilder, private accountService: AccountService) {}

  ngOnInit(): void {
    this.accountForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      type: ['ASSET', Validators.required],
      balanceNature: ['DEBIT', Validators.required],
      imputable: [false],
      active: [true]
    });
  }

  onSubmit(): void {
    if (this.accountForm.invalid) return;

    this.loading = true;
    const newAccount: Account = this.accountForm.value;

    this.accountService.createAccount(newAccount).subscribe({
      next: () => {
        this.message = '✅ Account created successfully!';
        this.loading = false;
        this.accountForm.reset({ type: 'ASSET', balanceNature: 'DEBIT', imputable: false, active: true });
      },
      error: () => {
        this.message = '❌ Error creating account.';
        this.loading = false;
      }
    });
  }
}
