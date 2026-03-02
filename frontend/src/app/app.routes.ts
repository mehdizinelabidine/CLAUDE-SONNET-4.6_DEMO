import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'employee/week',
    pathMatch: 'full',
  },
  {
    path: '',
    loadComponent: () =>
      import('./shared/layout/shell/shell').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'employee',
        children: [
          {
            path: 'week',
            loadComponent: () =>
              import('./features/employee/weekly-grid/weekly-grid').then(
                (m) => m.WeeklyGridComponent,
              ),
          },
          {
            path: 'history',
            loadComponent: () =>
              import('./features/employee/history/history').then(
                (m) => m.HistoryComponent,
              ),
          },
        ],
      },
      {
        path: 'admin',
        children: [
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./features/admin/dashboard/dashboard').then(
                (m) => m.DashboardComponent,
              ),
          },
          {
            path: 'reports',
            loadComponent: () =>
              import('./features/admin/reports/reports').then(
                (m) => m.ReportsComponent,
              ),
          },
          {
            path: 'metrics',
            loadComponent: () =>
              import('./features/admin/metrics/metrics').then(
                (m) => m.MetricsComponent,
              ),
          },
        ],
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then((m) => m.LoginComponent),
  },
  { path: '**', redirectTo: 'employee/week' },
];
