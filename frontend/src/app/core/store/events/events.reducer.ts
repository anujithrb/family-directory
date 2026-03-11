import { createReducer, on } from '@ngrx/store';
import { EventsActions, CalendarEvent } from './events.actions';

export interface EventsState {
  events: CalendarEvent[];
  total: number;
  loading: boolean;
  error: string | null;
}

export const initialState: EventsState = {
  events: [],
  total: 0,
  loading: false,
  error: null,
};

export const eventsReducer = createReducer(
  initialState,
  on(EventsActions.loadEvents, (state) => ({ ...state, loading: true })),
  on(EventsActions.loadEventsSuccess, (state, { events, total }) => ({
    ...state, events, total, loading: false, error: null,
  })),
  on(EventsActions.loadEventsFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(EventsActions.createEventSuccess, (state, { event }) => ({
    ...state, events: [...state.events, event], total: state.total + 1,
  })),
  on(EventsActions.deleteEventSuccess, (state, { id }) => ({
    ...state, events: state.events.filter((e) => e.id !== id), total: state.total - 1,
  })),
);
