import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layout/dashboard-layout.component';
import { LoginPageComponent } from './pages/login/login-page.component';

export const APP_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginPageComponent, title: 'Entrar | Marcly Afro Style' },
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      { path: 'inicio', loadComponent: () => import('./pages/home/home-page.component').then((m) => m.HomePageComponent), title: 'Início | Marcly Afro Style' },
      { path: 'clientes', loadComponent: () => import('./pages/clients/clients-page.component').then((m) => m.ClientsPageComponent), title: 'Clientes | Marcly Afro Style' },
      { path: 'pedidos', loadComponent: () => import('./pages/orders/orders-page.component').then((m) => m.OrdersPageComponent), title: 'Pedidos | Marcly Afro Style' },
      { path: 'relatorios', loadComponent: () => import('./pages/reports/reports-page.component').then((m) => m.ReportsPageComponent), title: 'Relatórios | Marcly Afro Style' },
      { path: 'configuracoes', loadComponent: () => import('./pages/settings/settings-page.component').then((m) => m.SettingsPageComponent), title: 'Configurações | Marcly Afro Style' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
