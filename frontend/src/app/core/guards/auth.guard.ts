import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { selectIsAuthenticated } from '../store/auth/auth.selectors';

export const authGuard = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectIsAuthenticated).pipe(
    map((authenticated) => authenticated || router.createUrlTree(['/auth/login'])),
  );
};
