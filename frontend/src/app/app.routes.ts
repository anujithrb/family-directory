import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/directory',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes),
  },
  {
    path: 'directory',
    loadChildren: () => import('./features/directory/directory.routes').then(m => m.directoryRoutes),
    canActivate: [authGuard],
  },
  {
    path: 'tree',
    loadChildren: () => import('./features/family-tree/family-tree.routes').then(m => m.familyTreeRoutes),
    canActivate: [authGuard],
  },
  {
    path: 'calendar',
    loadChildren: () => import('./features/calendar/calendar.routes').then(m => m.calendarRoutes),
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.routes').then(m => m.profileRoutes),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '/directory',
  },
];
