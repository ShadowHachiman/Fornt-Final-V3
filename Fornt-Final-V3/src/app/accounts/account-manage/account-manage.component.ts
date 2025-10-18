import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
  accounts: Account[] = [];
  parentAccounts: Account[] = [];

  message = '';
  error = '';
  loading = false;
  loadingAccounts = true;

  accountTypes = [
    { value: 'ASSET', label: '💰 Activo' },
    { value: 'LIABILITY', label: '📋 Pasivo' },
    { value: 'EQUITY', label: '🏛️ Patrimonio' },
    { value: 'REVENUE', label: '💵 Ingreso' },
    { value: 'EXPENSE', label: '💸 Egreso' }
  ];

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAccounts();
  }

  initForm(): void {
    this.accountForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      type: ['ASSET', Validators.required],
      imputable: [false],
      parentCode: [null]
    });
  }

  loadAccounts(): void {
    this.accountService.getAllAccounts().subscribe({
      next: (data) => {
        this.accounts = data;
        // Solo cuentas no imputables pueden ser padres
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
    console.log('🔵 Submit iniciado');
    console.log('🔵 Form valid?', this.accountForm.valid);
    console.log('🔵 Form value:', this.accountForm.value);

    if (this.accountForm.invalid) {
      this.error = 'Por favor completa todos los campos requeridos';
      console.log('❌ Formulario inválido');
      return;
    }

    this.loading = true;
    this.message = '';
    this.error = '';

    const formValue = this.accountForm.value;
    const accountData = {
      code: formValue.code,
      name: formValue.name,
      type: formValue.type,
      imputable: formValue.imputable,
      parentCode: formValue.parentCode || null
    };

    console.log('📤 Enviando datos:', accountData);

    this.accountService.createAccount(accountData).subscribe({
      next: (response) => {
        console.log('✅ Cuenta creada:', response);
        this.message = `✅ Cuenta creada exitosamente: ${response.code} - ${response.name}`;
        this.loading = false;

        // Recargar cuentas y resetear formulario
        this.loadAccounts();
        this.accountForm.reset({
          type: 'ASSET',
          imputable: false,
          parentCode: null
        });

        // Redirigir después de 2 segundos
        setTimeout(() => {
          console.log('🔄 Redirigiendo a /accounts/tree');
          this.router.navigate(['/accounts/tree']);
        }, 2000);
      },
      error: (err) => {
        console.error('❌ Error creando cuenta:', err);
        console.error('❌ Error completo:', JSON.stringify(err, null, 2));
        this.error = err.message || 'Error al crear la cuenta';
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/accounts/tree']);
  }

  // Helpers para el template
  get codeControl() {
    return this.accountForm.get('code');
  }

  get nameControl() {
    return this.accountForm.get('name');
  }
}
