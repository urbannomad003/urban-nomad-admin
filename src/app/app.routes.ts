import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./main-view-module/auth-module/login/login').then((m) => m.Login),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./main-view-module/auth-module/reset-password/reset-password').then(
        (m) => m.ResetPassword,
      ),
  },
  {
    path: 'products',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./main-view-module/products/products').then((m) => m.Products),
  },
  {
    path: 'users',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./main-view-module/users/users').then((m) => m.Users),
  },
  {
    path: '**',
    redirectTo: 'products',
  },
];