import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AccountManageComponent } from './accounts/account-manage/account-manage.component';
import { AccountTreeComponent } from './accounts/account-tree/account-tree.component';
import { UsersComponent } from './users/users.component';
import { UserFormComponent } from './users/user-from/user-from.component';

import { authGuard } from './core/guard/auth.guard';
import { adminGuard } from './core/guard/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },

  {
    path: 'accounts',
    canActivate: [authGuard],
    children: [
      { path: 'tree', component: AccountTreeComponent },
      { path: 'manage', component: AccountManageComponent, canActivate: [adminGuard] }, // Solo ADMIN
      { path: '', redirectTo: 'tree', pathMatch: 'full' }
    ]
  },

  {
    path: 'users',
    canActivate: [adminGuard],
    children: [
      { path: '', component: UsersComponent },
      { path: 'new', component: UserFormComponent }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
