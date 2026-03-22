import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { catchError, switchMap, throwError } from 'rxjs';
import { selectAccessToken } from '../store/auth/auth.selectors';
import { AuthActions } from '../store/auth/auth.actions';
import { take } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);
  const http  = inject(HttpClient);

  return store.select(selectAccessToken).pipe(
    take(1),
    switchMap((token) => {
      const authReq = token
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;

      return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401 && !isRefreshing) {
            isRefreshing = true;
            return http.post<{ data: { accessToken: string } }>(
              `${environment.apiBaseUrl}/auth/refresh`,
              {},
              { withCredentials: true },
            ).pipe(
              switchMap((res) => {
                isRefreshing = false;
                store.dispatch(AuthActions.refreshSuccess({ accessToken: res.data.accessToken }));
                const retryReq = req.clone({
                  setHeaders: { Authorization: `Bearer ${res.data.accessToken}` },
                });
                return next(retryReq);
              }),
              catchError((refreshError) => {
                isRefreshing = false;
                store.dispatch(AuthActions.logout());
                return throwError(() => refreshError);
              }),
            );
          }

          return throwError(() => error);
        }),
      );
    }),
  );
};
