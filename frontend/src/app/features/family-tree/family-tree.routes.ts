import { Routes } from '@angular/router';

export const familyTreeRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./tree-view/tree-view.component').then(m => m.TreeViewComponent),
  },
];
