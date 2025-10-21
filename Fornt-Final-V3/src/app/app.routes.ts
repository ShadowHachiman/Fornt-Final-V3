import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AccountManageComponent } from './accounts/account-manage/account-manage.component';
import { AccountTreeComponent } from './accounts/account-tree/account-tree.component';
import { UsersComponent } from './users/users.component';
import { UserFormComponent } from './users/user-from/user-from.component';
import { EntryFormComponent } from './entries/entry-form/entry-form.component';
import { EntryDetailComponent } from './entries/entry-detail/entry-detail.component';
import { LedgerComponent } from './entries/ledger/ledger.component';
import { authGuard } from './core/guard/auth.guard';
import { adminGuard } from './core/guard/admin.guard';
import {BalanceComponent} from "./entries/balance/balance.component";
import {JournalComponent} from "./journal/journal/journal.component";

export const routes: Routes = [
  // 🚪 Default redirection
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // 🔐 Autenticación
  { path: 'login', component: LoginComponent },

  // 📊 Dashboard (solo usuarios autenticados)
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },

  // 🧾 Plan de cuentas
  {
    path: 'accounts',
    canActivate: [authGuard],
    children: [
      { path: 'tree', component: AccountTreeComponent },
      { path: 'manage', component: AccountManageComponent, canActivate: [adminGuard] },
      { path: '', redirectTo: 'tree', pathMatch: 'full' }
    ]
  },

  // 👥 Usuarios (solo ADMIN)
  {
    path: 'users',
    canActivate: [adminGuard],
    children: [
      { path: '', component: UsersComponent },
      { path: 'new', component: UserFormComponent }
    ]
  },

  // 📘 Asientos contables
  { path: 'entries/new', component: EntryFormComponent, canActivate: [authGuard] },
  { path: 'entries/:id', component: EntryDetailComponent, canActivate: [authGuard] },

  // 📒 Libro Mayor
  { path: 'ledger', component: LedgerComponent, canActivate: [authGuard] },

  // 💰 Balance (solo ADMIN)
  { path: 'balance', component: BalanceComponent, canActivate: [adminGuard] },

  { path: 'journal', component: JournalComponent, canActivate: [authGuard] },

  // 🚧 Fallback (404) - SIEMPRE AL FINAL
  { path: '**', redirectTo: 'login' }
];
