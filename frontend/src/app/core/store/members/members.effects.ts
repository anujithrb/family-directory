import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { MembersActions, FamilyMember } from './members.actions';
import { environment } from '../../../../environments/environment';

@Injectable()
export class MembersEffects {
  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MembersActions.loadMembers),
      switchMap(({ search, isLiving, page }) => {
        let params = new HttpParams().set('page', page ?? 1).set('limit', 20);
        if (search) params = params.set('search', search);
        if (isLiving !== undefined) params = params.set('isLiving', isLiving);
        return this.http.get<{ data: { members: FamilyMember[]; total: number } }>(
          `${environment.apiBaseUrl}/family-members`, { params }
        ).pipe(
          map(({ data }) => MembersActions.loadMembersSuccess({ members: data.members, total: data.total })),
          catchError((err) => of(MembersActions.loadMembersFailure({ error: err.message }))),
        );
      }),
    ),
  );

  loadOne$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MembersActions.loadMember),
      switchMap(({ id }) =>
        this.http.get<{ data: FamilyMember }>(`${environment.apiBaseUrl}/family-members/${id}`).pipe(
          map(({ data }) => MembersActions.loadMemberSuccess({ member: data })),
          catchError((err) => of(MembersActions.loadMemberFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MembersActions.createMember),
      switchMap(({ data }) =>
        this.http.post<{ data: FamilyMember }>(`${environment.apiBaseUrl}/family-members`, data).pipe(
          map(({ data: member }) => MembersActions.createMemberSuccess({ member })),
          catchError((err) => of(MembersActions.createMemberFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MembersActions.updateMember),
      switchMap(({ id, data }) =>
        this.http.patch<{ data: FamilyMember }>(`${environment.apiBaseUrl}/family-members/${id}`, data).pipe(
          map(({ data: member }) => MembersActions.updateMemberSuccess({ member })),
          catchError((err) => of(MembersActions.updateMemberFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MembersActions.deleteMember),
      switchMap(({ id }) =>
        this.http.delete(`${environment.apiBaseUrl}/family-members/${id}`).pipe(
          map(() => MembersActions.deleteMemberSuccess({ id })),
          catchError((err) => of(MembersActions.deleteMemberFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  constructor(private actions$: Actions, private http: HttpClient) {}
}
