import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AccountService } from '../../core/service/account.service';
import { Account } from '../../core/models/account.model';

type Nature = 'DEBIT' | 'CREDIT';

@Component({
  selector: 'app-account-manage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './account-manage.component.html',
  styleUrls: ['./account-manage.component.css']
})
export class AccountManageComponent implements OnInit {
  accountForm!: FormGroup;
  accounts: Account[] = [];
  parentAccounts: Account[] = [];
  editingAccount: Account | null = null;

  message = '';
  error = '';
  loading = false;
  loadingAccounts = true;
  codeValidationError = '';
  searchTerm = '';

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
      // Filtrar padres cuando cambia el tipo
      this.filterParentAccounts();
    });
  }

  initForm(): void {
    this.accountForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^[0-9]+$/), Validators.maxLength(8)]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      type: ['ASSET', Validators.required],
      imputable: [false],
      parentCode: [null],
      balanceNature: ['DEBIT' as Nature, Validators.required]
    });

    // Validación en tiempo real del código
    this.accountForm.get('code')?.valueChanges.subscribe(() => {
      this.validateCode();
    });

    // Re-validar código cuando cambia el padre o tipo
    this.accountForm.get('parentCode')?.valueChanges.subscribe(() => {
      this.validateCode();
      // Auto-sugerir código cuando cambia el padre (si está vacío)
      if (!this.accountForm.get('code')?.value) {
        this.suggestCode();
      }
    });
  }

  /**
   * Sugiere automáticamente el siguiente código disponible
   */
  suggestCode(): void {
    const type = this.accountForm.get('type')?.value;
    const parentCode = this.accountForm.get('parentCode')?.value;

    let suggestedCode = '';

    if (parentCode) {
      // Caso 1: Tiene padre → buscar siguiente hijo
      suggestedCode = this.getNextChildCode(parentCode);
    } else {
      // Caso 2: Sin padre → buscar siguiente código del tipo
      suggestedCode = this.getNextCodeForType(type);
    }

    if (suggestedCode) {
      this.accountForm.patchValue({ code: suggestedCode }, { emitEvent: true });
    }
  }

  /**
   * Obtiene el siguiente código hijo disponible para un padre
   * Regla:
   * - Si padre termina en 00 (ej: 100, 200) → hijos incrementan de 10 en 10: 110, 120, 130
   * - Si padre termina en X0 pero no 00 (ej: 110, 120) → hijos incrementan de 1: 111, 112, 113
   */
  private getNextChildCode(parentCode: string): string {
    const parentNum = parseInt(parentCode);
    const endsInDoubleZero = parentNum % 100 === 0; // Termina en 00 (100, 200, 300)
    const endsInSingleZero = parentNum % 10 === 0 && !endsInDoubleZero; // Termina en X0 (110, 120, 130)

    if (endsInDoubleZero) {
      // Padre nivel 1 (ej: 400) → buscar siguiente múltiplo de 10 disponible
      const minNum = parentNum + 10; // Mínimo: 410
      const maxNum = parentNum + 90; // Máximo: 490

      for (let candidate = minNum; candidate <= maxNum; candidate += 10) {
        if (!this.accounts.find(a => a.code === candidate.toString())) {
          return candidate.toString();
        }
      }

      // Si no hay disponibles, devolver el primero (aunque esté ocupado)
      return minNum.toString();

    } else if (endsInSingleZero) {
      // Padre nivel 2 (ej: 410) → buscar siguiente secuencial disponible
      const minNum = parentNum + 1; // Mínimo: 411
      const maxNum = (Math.floor(parentNum / 10) + 1) * 10 - 1; // Máximo: 419

      for (let candidate = minNum; candidate <= maxNum; candidate++) {
        if (!this.accounts.find(a => a.code === candidate.toString())) {
          return candidate.toString();
        }
      }

      // Si no hay disponibles, devolver el primero (aunque esté ocupado)
      return minNum.toString();

    } else {
      // Padre nivel 3 → no debería tener hijos, pero devolver siguiente por si acaso
      return (parentNum + 1).toString();
    }
  }

  /**
   * Obtiene el siguiente código disponible para un tipo (sin padre)
   * Sugiere códigos de 3 dígitos: 100, 110, 120, etc.
   */
  private getNextCodeForType(type: string): string {
    const typePrefix: { [key: string]: string } = {
      'ASSET': '1',
      'LIABILITY': '2',
      'EQUITY': '3',
      'INCOME': '4',
      'EXPENSE': '5'
    };

    const prefix = typePrefix[type];
    if (!prefix) return '';

    // Buscar todas las cuentas de 3 dígitos que empiezan con el prefijo
    const accountsOfType = this.accounts
      .filter(a => a.code.startsWith(prefix) && a.code.length === 3)
      .map(a => a.code)
      .sort();

    if (accountsOfType.length === 0) {
      // No hay cuentas de este tipo, sugerir código base de 3 dígitos
      return prefix + '00'; // ej: 100, 200, 300, etc.
    }

    // Obtener el último código de 3 dígitos
    const lastCode = accountsOfType[accountsOfType.length - 1];
    const lastNumber = parseInt(lastCode);

    if (!isNaN(lastNumber)) {
      // Intentar sugerir siguiente múltiplo de 10 o siguiente disponible
      const nextRound = Math.ceil((lastNumber + 1) / 10) * 10; // Redondear a múltiplo de 10

      // Verificar si el múltiplo está disponible
      const roundCandidate = nextRound.toString().padStart(3, '0');
      if (roundCandidate.startsWith(prefix) &&
          !this.accounts.find(a => a.code === roundCandidate)) {
        return roundCandidate;
      }

      // Si no, buscar siguiente disponible
      for (let i = lastNumber + 1; i < parseInt(prefix + '99'); i++) {
        const candidate = i.toString().padStart(3, '0');
        if (candidate.startsWith(prefix) &&
            !this.accounts.find(a => a.code === candidate)) {
          return candidate;
        }
      }
    }

    // Fallback: siguiente múltiplo de 10
    return prefix + '00';
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
        this.filterParentAccounts();
        this.loadingAccounts = false;
      },
      error: () => {
        this.error = 'Error cargando cuentas';
        this.loadingAccounts = false;
      }
    });
  }

  /**
   * Filtra las cuentas padre según el tipo seleccionado
   * Solo muestra cuentas del mismo tipo, no imputables y activas
   */
  filterParentAccounts(): void {
    const selectedType = this.accountForm.get('type')?.value;

    if (!selectedType) {
      this.parentAccounts = [];
      return;
    }

    this.parentAccounts = this.accounts.filter(a => {
      // Normalizar tipos para manejar INCOME/REVENUE (backend usa INCOME, modelo usa REVENUE)
      const normalizeType = (t: string) => (t === 'INCOME' || t === 'REVENUE') ? 'INCOME' : t;

      return !a.imputable &&
             a.active &&
             normalizeType(a.type) === normalizeType(selectedType);
    });
  }

  /**
   * Valida el código de cuenta según reglas de jerarquía y tipo
   */
  validateCode(): void {
    this.codeValidationError = '';
    const code = this.accountForm.get('code')?.value?.trim();
    const type = this.accountForm.get('type')?.value;
    const parentCode = this.accountForm.get('parentCode')?.value;

    if (!code) {
      return; // No validar si está vacío (lo maneja required)
    }

    // 1. Validar código único PRIMERO (es el más común)
    // Si estamos editando, excluir la cuenta actual de la validación
    const duplicate = this.accounts.find(a =>
      a.code === code && (!this.editingAccount || a.id !== this.editingAccount.id)
    );
    if (duplicate) {
      this.codeValidationError = `El código "${code}" ya existe (${duplicate.name})`;
      return;
    }

    // 2. Validar longitud razonable
    if (code.length > 8) {
      this.codeValidationError = 'El código no puede tener más de 8 dígitos';
      return;
    }

    // 3. Validar prefijo según tipo de cuenta (solo primer dígito)
    const typePrefix: { [key: string]: string } = {
      'ASSET': '1',
      'LIABILITY': '2',
      'EQUITY': '3',
      'INCOME': '4',
      'EXPENSE': '5'
    };

    const expectedPrefix = typePrefix[type];
    if (expectedPrefix && !code.startsWith(expectedPrefix)) {
      this.codeValidationError = `El código debe comenzar con ${expectedPrefix} para tipo ${this.getTypeLabel(type)}`;
      return;
    }

    // 4. Si tiene padre, validar jerarquía según estructura de 3 dígitos
    if (parentCode) {
      const parent = this.accounts.find(a => a.code === parentCode);
      const parentNum = parseInt(parentCode);
      const codeNum = parseInt(code);

      // Debe empezar con el mismo dígito (mismo tipo)
      if (!code.startsWith(parentCode.charAt(0))) {
        this.codeValidationError = `El código debe empezar con "${parentCode.charAt(0)}" (mismo tipo que padre: ${parent?.name})`;
        return;
      }

      // Validar según el nivel del padre
      const endsInDoubleZero = parentNum % 100 === 0; // Padre nivel 1 (100, 200, etc.)
      const endsInSingleZero = parentNum % 10 === 0 && !endsInDoubleZero; // Padre nivel 2 (110, 120, etc.)

      if (endsInDoubleZero) {
        // Padre nivel 1 (ej: 100): hijo debe estar en el mismo centenar y ser múltiplo de 10
        const parentHundred = Math.floor(parentNum / 100);
        const codeHundred = Math.floor(codeNum / 100);

        if (parentHundred !== codeHundred) {
          this.codeValidationError = `El código debe estar en el rango ${parentNum}-${parentNum + 99} (hijo de ${parent?.name})`;
          return;
        }

        if (codeNum % 10 !== 0) {
          this.codeValidationError = `Los hijos de "${parentCode}" deben ser múltiplos de 10 (ej: ${parentNum + 10}, ${parentNum + 20})`;
          return;
        }

        if (codeNum <= parentNum) {
          this.codeValidationError = `El código debe ser mayor que el padre "${parentCode}"`;
          return;
        }
      } else if (endsInSingleZero) {
        // Padre nivel 2 (ej: 110): hijo debe estar en la misma decena
        const parentTen = Math.floor(parentNum / 10);
        const codeTen = Math.floor(codeNum / 10);

        if (parentTen !== codeTen) {
          this.codeValidationError = `El código debe estar en el rango ${parentNum + 1}-${parentNum + 9} (hijo de ${parent?.name})`;
          return;
        }

        if (codeNum % 10 === 0) {
          this.codeValidationError = `Los hijos de "${parentCode}" no pueden ser múltiplos de 10 (deben ser ${parentNum + 1}, ${parentNum + 2}, etc.)`;
          return;
        }

        if (codeNum <= parentNum) {
          this.codeValidationError = `El código debe ser mayor que el padre "${parentCode}"`;
          return;
        }
      } else {
        // Padre nivel 3 (ej: 111): no debería tener hijos en esta estructura
        this.codeValidationError = `La cuenta "${parentCode}" (${parent?.name}) ya es de nivel 3 y no puede tener hijos`;
        return;
      }
    }
  }

  /**
   * Obtiene la etiqueta del tipo de cuenta
   */
  private getTypeLabel(type: string): string {
    const typeObj = this.accountTypes.find(t => t.value === type);
    return typeObj?.label || type;
  }

  onSubmit(): void {
    // Validar código antes de enviar
    this.validateCode();

    if (this.accountForm.invalid) {
      this.error = 'Por favor completa todos los campos requeridos';
      return;
    }

    if (this.codeValidationError) {
      this.error = this.codeValidationError;
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

    if (this.editingAccount) {
      // Modo edición
      this.accountService.updateAccount(this.editingAccount.id, payload).subscribe({
        next: (response) => {
          this.message = `✅ Cuenta actualizada: ${response.code} - ${response.name}`;
          this.loading = false;
          this.loadAccounts();
          this.cancelEdit();
        },
        error: (err) => {
          this.error = err?.message || 'Error al actualizar la cuenta';
          this.loading = false;
        }
      });
    } else {
      // Modo creación
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
        },
        error: (err) => {
          this.error = err?.message || 'Error al crear la cuenta';
          this.loading = false;
        }
      });
    }
  }

  /**
   * Carga una cuenta para edición
   */
  editAccount(account: Account): void {
    this.editingAccount = account;
    this.accountForm.patchValue({
      code: account.code,
      name: account.name,
      type: account.type === 'REVENUE' ? 'INCOME' : account.type, // Normalizar
      imputable: account.imputable,
      parentCode: account.parentCode || null,
      balanceNature: this.computeNature(account.type)
    });
    this.message = `Editando cuenta: ${account.code} - ${account.name}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Cancela la edición y vuelve a modo creación
   */
  cancelEdit(): void {
    this.editingAccount = null;
    this.message = '';
    this.error = '';
    this.accountForm.reset({
      code: '',
      name: '',
      type: 'ASSET',
      imputable: false,
      parentCode: null,
      balanceNature: this.computeNature('ASSET')
    });
  }

  /**
   * Activa/Desactiva una cuenta
   */
  toggleStatus(account: Account): void {
    const newStatus = !account.active;
    const action = newStatus ? 'activar' : 'desactivar';

    if (!confirm(`¿Está seguro que desea ${action} la cuenta "${account.code} - ${account.name}"?`)) {
      return;
    }

    this.accountService.toggleAccountStatus(account.id, newStatus).subscribe({
      next: () => {
        this.message = `✅ Cuenta ${newStatus ? 'activada' : 'desactivada'}: ${account.code} - ${account.name}`;
        this.loadAccounts();
      },
      error: (err) => {
        this.error = err?.message || `Error al ${action} la cuenta`;
      }
    });
  }

  /**
   * Elimina una cuenta
   */
  deleteAccount(account: Account): void {
    if (!confirm(`⚠️ ¿Está seguro que desea ELIMINAR la cuenta "${account.code} - ${account.name}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    this.accountService.deleteAccount(account.id).subscribe({
      next: () => {
        this.message = `✅ Cuenta eliminada: ${account.code} - ${account.name}`;
        this.loadAccounts();
      },
      error: (err) => {
        this.error = err?.message || 'Error al eliminar la cuenta';
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/accounts/tree']);
  }

  /**
   * Devuelve el hint del prefijo esperado según el tipo
   */
  getTypePrefixHint(): string {
    const type = this.accountForm.get('type')?.value;
    const parentCode = this.accountForm.get('parentCode')?.value;

    const typePrefix: { [key: string]: string } = {
      'ASSET': '1',
      'LIABILITY': '2',
      'EQUITY': '3',
      'INCOME': '4',
      'EXPENSE': '5'
    };

    if (parentCode) {
      const parent = this.accounts.find(a => a.code === parentCode);
      return `"${parentCode}xxx" (subcuenta de: ${parent?.name || parentCode})`;
    }

    return `"${typePrefix[type]}xxx" (ej: ${typePrefix[type]}, ${typePrefix[type]}1, ${typePrefix[type]}00, etc.)`;
  }

  /**
   * Filtra cuentas por búsqueda
   */
  get filteredAccounts(): Account[] {
    if (!this.searchTerm) {
      return this.accounts;
    }
    const term = this.searchTerm.toLowerCase();
    return this.accounts.filter(a =>
      a.code.toLowerCase().includes(term) ||
      a.name.toLowerCase().includes(term) ||
      a.type.toLowerCase().includes(term)
    );
  }

  // Helpers
  get codeControl() { return this.accountForm.get('code'); }
  get nameControl() { return this.accountForm.get('name'); }
}
