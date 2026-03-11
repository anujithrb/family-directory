import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpClient } from '@angular/common/http';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { TreeActions, TreeNode, TreeEdge } from './tree.actions';
import { environment } from '../../../../environments/environment';

@Injectable()
export class TreeEffects {
  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TreeActions.loadTree),
      switchMap(() =>
        this.http.get<{ data: { nodes: TreeNode[]; edges: TreeEdge[] } }>(
          `${environment.apiBaseUrl}/family-tree`
        ).pipe(
          map(({ data }) => TreeActions.loadTreeSuccess({ nodes: data.nodes, edges: data.edges })),
          catchError((err) => of(TreeActions.loadTreeFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  constructor(private actions$: Actions, private http: HttpClient) {}
}
