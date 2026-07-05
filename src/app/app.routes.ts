import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { HomeComponent } from './features/dashboard/home/home.component';
import { UsersComponent } from './features/admin/users/users.component';
import { ProfileComponent } from './features/profile/profile.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { roleGuard } from './core/guards/role.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'admin/users', component: UsersComponent, canActivate: [adminGuard] },
      { 
        path: 'sales', 
        loadComponent: () => import('./features/sales/sales.component').then(m => m.SalesComponent),
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'Vendedor'] } // RBAC a nivel de UI
      },
      {
        path: 'quick-search',
        loadComponent: () => import('./features/quick-search/quick-search.component').then(m => m.QuickSearchComponent),
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'Vendedor', 'Encargado de Bodega'] }
      },
      {
        path: 'inventory/alerts',
        loadComponent: () => import('./features/inventory/alerts/alerts.component').then(m => m.AlertsComponent),
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'Encargado de Bodega'] }
      },
      {
        path: 'inventory/incomes',
        loadComponent: () => import('./features/inventory/incomes/incomes.component').then(m => m.IncomesComponent),
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'Encargado de Bodega'] }
      },
      { 
        path: 'inventory/reconciliation', 
        loadComponent: () => import('./features/inventory/reconciliation/reconciliation.component').then(m => m.ReconciliationComponent),
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'Encargado de Bodega'] } 
      },
      {
        path: 'reports/profitability',
        loadComponent: () => import('./features/reports/profitability/profitability.component').then(m => m.ProfitabilityComponent),
        canActivate: [roleGuard],
        data: { roles: ['Administrador'] }
      },
      {
        path: 'inventory/products',
        loadComponent: () => import('./features/inventory/products/products.component').then(m => m.ProductsComponent),
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'Encargado de Bodega'] }
      },
      {
        path: 'reports/audit',
        loadComponent: () => import('./features/reports/audit/audit.component').then(m => m.AuditComponent),
        canActivate: [roleGuard],
        data: { roles: ['Administrador'] }
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'home' }
];
