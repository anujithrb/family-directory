import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventsActions, CalendarEvent } from '../../../core/store/events/events.actions';
import { selectAllEvents } from '../../../core/store/events/events.selectors';

interface DayCell {
  date: Date;
  isCurrentMonth: boolean;
  events: CalendarEvent[];
}

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-view.component.html',
  styleUrl: './calendar-view.component.scss',
})
export class CalendarViewComponent implements OnInit {
  currentDate = new Date();
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDays$!: Observable<DayCell[]>;

  private touchStartX = 0;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.loadEvents();
    this.buildCalendar();
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    const delta = this.touchStartX - event.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      if (delta > 0) this.nextMonth();
      else this.prevMonth();
    }
  }

  prevMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.loadEvents();
    this.buildCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.loadEvents();
    this.buildCalendar();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  private loadEvents(): void {
    this.store.dispatch(EventsActions.loadEvents({
      month: this.currentDate.getMonth() + 1,
      year: this.currentDate.getFullYear(),
    }));
  }

  private buildCalendar(): void {
    this.calendarDays$ = this.store.select(selectAllEvents).pipe(
      map((events) => {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days: DayCell[] = [];

        for (let i = 0; i < firstDay.getDay(); i++) {
          const date = new Date(year, month, -firstDay.getDay() + i + 1);
          days.push({ date, isCurrentMonth: false, events: [] });
        }

        for (let d = 1; d <= lastDay.getDate(); d++) {
          const date = new Date(year, month, d);
          const dayEvents = events.filter((e) => {
            const eDate = new Date(e.date);
            return eDate.getDate() === d && eDate.getMonth() === month && eDate.getFullYear() === year;
          });
          const recurringEvents = events.filter((e) => {
            if (!e.recurrenceRule) return false;
            const eDate = new Date(e.date);
            return eDate.getDate() === d && eDate.getMonth() === month;
          });
          const seenIds = new Set<string>();
          const allDayEvents = [...dayEvents, ...recurringEvents].filter((e) => {
            if (seenIds.has(e.id)) return false;
            seenIds.add(e.id);
            return true;
          });
          days.push({ date, isCurrentMonth: true, events: allDayEvents });
        }

        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
          const date = new Date(year, month + 1, i);
          days.push({ date, isCurrentMonth: false, events: [] });
        }

        return days;
      }),
    );
  }
}
