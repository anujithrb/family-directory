import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthActions, UserProfile } from './auth.actions';
import { environment } from '../../../../environments/environment';

@Injectable()
export class AuthEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ email, password }) =>
        this.http.post<{ data: { accessToken: string } }>(
          `${environment.apiBaseUrl}/auth/login`,
          { email, password },
          { withCredentials: true },
        ).pipe(
          switchMap(({ data }) =>
            this.http.get<{ data: UserProfile }>(`${environment.apiBaseUrl}/auth/me`).pipe(
              map((res) => AuthActions.loginSuccess({ accessToken: data.accessToken, user: res.data })),
            ),
          ),
          catchError((err) => of(AuthActions.loginFailure({ error: err.error?.error?.message || 'Login failed' }))),
        ),
      ),
    ),
  );

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(() => this.router.navigate(['/directory'])),
    ),
    { dispatch: false },
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      switchMap(() =>
        this.http.post(`${environment.apiBaseUrl}/auth/logout`, {}).pipe(
          map(() => AuthActions.logoutSuccess()),
          catchError(() => of(AuthActions.logoutSuccess())),
        ),
      ),
    ),
  );

  logoutSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logoutSuccess),
      tap(() => this.router.navigate(['/auth/login'])),
    ),
    { dispatch: false },
  );

  loadProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadProfile),
      switchMap(() =>
        this.http.get<{ data: UserProfile }>(`${environment.apiBaseUrl}/auth/me`).pipe(
          map(({ data }) => AuthActions.loadProfileSuccess({ user: data })),
          catchError((err) => of(AuthActions.loadProfileFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private router: Router,
  ) {}
}
