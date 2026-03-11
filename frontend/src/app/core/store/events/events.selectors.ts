import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EventsState } from './events.reducer';

export const selectEventsState = createFeatureSelector<EventsState>('events');
export const selectAllEvents = createSelector(selectEventsState, (s) => s.events);
export const selectEventsLoading = createSelector(selectEventsState, (s) => s.loading);
