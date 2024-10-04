import { Route } from '@angular/router';
import { AuthGuard } from './auth/guards/auth.guard';

export const appRoutes: Route[] = [
  {
    path: 'admin',
    canActivate: [AuthGuard],
    data: { breadcrumbLabel: 'Home' },
    loadChildren: () => import('./admin/admin.module').then((m) => m.AdminModule),
  },
  { path: 'auth', title: 'ADAPT - Auth', loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule) },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
];
