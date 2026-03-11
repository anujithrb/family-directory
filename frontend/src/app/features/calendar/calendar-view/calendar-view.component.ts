import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="calendar-container">
      <div class="calendar-header">
        <button mat-icon-button (click)="prevMonth()"><mat-icon>chevron_left</mat-icon></button>
        <h2>{{ currentDate | date:'MMMM yyyy' }}</h2>
        <button mat-icon-button (click)="nextMonth()"><mat-icon>chevron_right</mat-icon></button>
      </div>

      <div class="weekday-headers">
        <div *ngFor="let day of weekDays" class="weekday">{{ day }}</div>
      </div>

      <div class="calendar-grid">
        <div *ngFor="let cell of calendarDays$ | async"
             class="day-cell"
             [class.other-month]="!cell.isCurrentMonth"
             [class.today]="isToday(cell.date)">
          <span class="day-number">{{ cell.date | date:'d' }}</span>
          <div class="day-events">
            <div *ngFor="let event of cell.events" class="event-chip"
                 [class.birthday]="event.eventType === 'BIRTHDAY'"
                 [class.anniversary]="event.eventType === 'ANNIVERSARY'"
                 [class.custom]="event.eventType === 'CUSTOM'"
                 [title]="event.title">
              {{ event.title | slice:0:20 }}{{ event.title.length > 20 ? '...' : '' }}
            </div>
          </div>
        </div>
      </div>

      <div class="legend">
        <span class="legend-item">&#127874; Birthday</span>
        <span class="legend-item">&#128145; Anniversary</span>
        <span class="legend-item">&#128197; Event</span>
      </div>
    </div>
  `,
  styles: [`
    .calendar-container { padding: 16px; max-width: 900px; margin: 0 auto; }
    .calendar-header { display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 16px; }
    .calendar-header h2 { margin: 0; min-width: 200px; text-align: center; }
    .weekday-headers { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 2px; }
    .weekday { text-align: center; font-weight: bold; padding: 8px; font-size: 12px; color: rgba(0,0,0,0.6); }
    .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
    .day-cell { min-height: 80px; border: 1px solid rgba(0,0,0,0.08); padding: 4px; background: white; }
    .day-cell.other-month { background: #fafafa; opacity: 0.6; }
    .day-cell.today .day-number { background: #1a73e8; color: white; border-radius: 50%; padding: 2px 6px; }
    .day-number { font-size: 12px; font-weight: 500; }
    .day-events { margin-top: 2px; }
    .event-chip { font-size: 10px; padding: 1px 4px; border-radius: 4px; margin-bottom: 1px; overflow: hidden; white-space: nowrap; cursor: pointer; }
    .birthday { background: #e3f2fd; color: #1565c0; }
    .anniversary { background: #fce4ec; color: #880e4f; }
    .custom { background: #e8f5e9; color: #2e7d32; }
    .legend { display: flex; gap: 16px; justify-content: center; margin-top: 16px; flex-wrap: wrap; }
    .legend-item { font-size: 12px; }
    @media (max-width: 600px) { .day-cell { min-height: 56px; } .event-chip { display: none; } }
  `],
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
