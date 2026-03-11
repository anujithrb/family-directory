import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../store/auth/auth.selectors';

export const adminGuard = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectCurrentUser).pipe(
    map((user) => (user?.role === 'ADMIN') || router.createUrlTree(['/directory'])),
  );
};
