import { createActionGroup, props } from '@ngrx/store';

export interface CalendarEvent {
  id: string;
  title: string;
  eventType: 'BIRTHDAY' | 'ANNIVERSARY' | 'CUSTOM';
  date: string;
  recurrenceRule?: string;
  description?: string;
  eventMembers?: { familyMember: { id: string; firstName: string; lastName: string } }[];
}

export const EventsActions = createActionGroup({
  source: 'Events',
  events: {
    'Load Events': props<{ month?: number; year?: number; eventType?: string }>(),
    'Load Events Success': props<{ events: CalendarEvent[]; total: number }>(),
    'Load Events Failure': props<{ error: string }>(),
    'Create Event': props<{ data: Partial<CalendarEvent> & { memberIds?: string[] } }>(),
    'Create Event Success': props<{ event: CalendarEvent }>(),
    'Create Event Failure': props<{ error: string }>(),
    'Delete Event': props<{ id: string }>(),
    'Delete Event Success': props<{ id: string }>(),
    'Delete Event Failure': props<{ error: string }>(),
  },
});
