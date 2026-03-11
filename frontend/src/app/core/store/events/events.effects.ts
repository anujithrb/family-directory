import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { EventsActions, CalendarEvent } from './events.actions';
import { environment } from '../../../../environments/environment';

@Injectable()
export class EventsEffects {
  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventsActions.loadEvents),
      switchMap(({ month, year, eventType }) => {
        let params = new HttpParams().set('limit', 100);
        if (month) params = params.set('month', month);
        if (year) params = params.set('year', year);
        if (eventType) params = params.set('eventType', eventType);
        return this.http.get<{ data: { events: CalendarEvent[]; total: number } }>(
          `${environment.apiBaseUrl}/events`, { params }
        ).pipe(
          map(({ data }) => EventsActions.loadEventsSuccess({ events: data.events, total: data.total })),
          catchError((err) => of(EventsActions.loadEventsFailure({ error: err.message }))),
        );
      }),
    ),
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventsActions.createEvent),
      switchMap(({ data }) =>
        this.http.post<{ data: CalendarEvent }>(`${environment.apiBaseUrl}/events`, data).pipe(
          map(({ data: event }) => EventsActions.createEventSuccess({ event })),
          catchError((err) => of(EventsActions.createEventFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventsActions.deleteEvent),
      switchMap(({ id }) =>
        this.http.delete(`${environment.apiBaseUrl}/events/${id}`).pipe(
          map(() => EventsActions.deleteEventSuccess({ id })),
          catchError((err) => of(EventsActions.deleteEventFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  constructor(private actions$: Actions, private http: HttpClient) {}
}
