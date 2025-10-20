import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AccountService } from '../../core/service/account.service';
import { Account } from '../../core/models/account.model';

type Nature = 'DEBIT' | 'CREDIT';

@Component({
  selector: 'app-account-manage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './account-manage.component.html',
  styleUrls: ['./account-manage.component.css']
})
export class AccountManageComponent implements OnInit {
  accountForm!: FormGroup;
  accounts: Account[] = [];
  parentAccounts: Account[] = [];

  message = '';
  error = '';
  loading = false;
  loadingAccounts = true;

  // 👇 INCOME (no REVENUE) para que el backend lo acepte
  accountTypes = [
    { value: 'ASSET',     label: '💰 Activo' },
    { value: 'LIABILITY', label: '📋 Pasivo' },
    { value: 'EQUITY',    label: '🏛️ Patrimonio' },
    { value: 'INCOME',    label: '💵 Ingreso' },
    { value: 'EXPENSE',   label: '💸 Egreso' }
  ];

  natureOptions: { value: Nature; label: string }[] = [
    { value: 'DEBIT',  label: 'Deudora (DEBIT)' },
    { value: 'CREDIT', label: 'Acreedora (CREDIT)' }
  ];

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAccounts();

    // Ajuste automático de naturaleza según tipo
    this.accountForm.get('type')!.valueChanges.subscribe(t => {
      const nature = this.computeNature(t as string);
      this.accountForm.patchValue({ balanceNature: nature }, { emitEvent: false });
    });
  }

  initForm(): void {
    this.accountForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      type: ['ASSET', Validators.required],
      imputable: [false],
      parentCode: [null],
      balanceNature: ['DEBIT' as Nature, Validators.required]
    });
  }

  private computeNature(type: string): Nature {
    switch ((type || '').toUpperCase()) {
      case 'ASSET':
      case 'EXPENSE':
        return 'DEBIT';   // Deudora
      case 'LIABILITY':
      case 'EQUITY':
      case 'INCOME':
      default:
        return 'CREDIT';  // Acreedora
    }
  }

  loadAccounts(): void {
    this.accountService.getAllAccounts().subscribe({
      next: (data) => {
        this.accounts = data;
        this.parentAccounts = data.filter(a => !a.imputable && a.active);
        this.loadingAccounts = false;
      },
      error: () => {
        this.error = 'Error cargando cuentas';
        this.loadingAccounts = false;
      }
    });
  }

  onSubmit(): void {
    if (this.accountForm.invalid) {
      this.error = 'Por favor completa todos los campos requeridos';
      return;
    }

    this.loading = true;
    this.message = '';
    this.error = '';

    const v = this.accountForm.value;
    const payload = {
      code: v.code,
      name: v.name,
      type: v.type,
      imputable: v.imputable,
      parentCode: v.parentCode || null,
      balanceNature: v.balanceNature
    };

    this.accountService.createAccount(payload).subscribe({
      next: (response) => {
        this.message = `✅ Cuenta creada: ${response.code} - ${response.name}`;
        this.loading = false;
        this.loadAccounts();
        this.accountForm.reset({
          code: '',
          name: '',
          type: 'ASSET',
          imputable: false,
          parentCode: null,
          balanceNature: this.computeNature('ASSET')
        });
        setTimeout(() => this.router.navigate(['/accounts/tree']), 1000);
      },
      error: (err) => {
        this.error = err?.message || 'Error al crear la cuenta';
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/accounts/tree']);
  }

  // Helpers
  get codeControl() { return this.accountForm.get('code'); }
  get nameControl() { return this.accountForm.get('name'); }
}
