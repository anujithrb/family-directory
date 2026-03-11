import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
  },
  {
    path: 'members/new',
    loadComponent: () => import('./member-form/member-form.component').then(m => m.MemberFormComponent),
  },
  {
    path: 'members/:id/edit',
    loadComponent: () => import('./member-form/member-form.component').then(m => m.MemberFormComponent),
  },
];
