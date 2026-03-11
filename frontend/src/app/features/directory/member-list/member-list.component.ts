import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { Observable, debounceTime, distinctUntilChanged } from 'rxjs';
import { MembersActions, FamilyMember } from '../../../core/store/members/members.actions';
import { selectAllMembers, selectMembersLoading, selectMembersTotal } from '../../../core/store/members/members.selectors';
import { selectCurrentUser } from '../../../core/store/auth/auth.selectors';
import { UserProfile } from '../../../core/store/auth/auth.actions';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatListModule, MatInputModule, MatButtonModule,
    MatChipsModule, MatProgressSpinnerModule, MatIconModule,
  ],
  template: `
    <div class="directory-container">
      <div class="search-bar">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Search members</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [formControl]="searchControl" placeholder="First or last name...">
        </mat-form-field>
        <button mat-raised-button color="primary" routerLink="/admin/members/new"
                *ngIf="(currentUser$ | async)?.role === 'ADMIN'">
          <mat-icon>add</mat-icon> Add Member
        </button>
      </div>

      <div *ngIf="loading$ | async" class="loading-center">
        <mat-spinner></mat-spinner>
      </div>

      <mat-list *ngIf="!(loading$ | async)">
        <mat-list-item *ngFor="let member of members$ | async"
                       [routerLink]="['/directory', member.id]"
                       class="member-item">
          <img matListItemAvatar
               [src]="member.photoUrl || 'assets/icons/default-avatar.svg'"
               [alt]="member.firstName + ' ' + member.lastName"
               class="avatar">
          <div matListItemTitle>{{ member.firstName }} {{ member.lastName }}</div>
          <div matListItemLine>
            <span *ngIf="member.dateOfBirth">Born: {{ member.dateOfBirth | date:'mediumDate' }}</span>
            <mat-chip *ngIf="!member.isLiving" color="warn">Deceased</mat-chip>
          </div>
          <mat-icon matListItemMeta>chevron_right</mat-icon>
        </mat-list-item>
      </mat-list>

      <div class="total-count" *ngIf="total$ | async as total">
        {{ total }} member(s) found
      </div>
    </div>
  `,
  styles: [`
    .directory-container { padding: 16px; max-width: 800px; margin: 0 auto; }
    .search-bar { display: flex; gap: 16px; align-items: flex-start; }
    .full-width { flex: 1; }
    .loading-center { display: flex; justify-content: center; padding: 32px; }
    .member-item { cursor: pointer; border-bottom: 1px solid rgba(0,0,0,0.08); min-height: 72px; }
    .member-item:hover { background: rgba(0,0,0,0.04); }
    .avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; }
    .total-count { text-align: center; color: rgba(0,0,0,0.54); padding: 16px; font-size: 14px; }
  `],
})
export class MemberListComponent implements OnInit {
  searchControl = new FormControl('');
  members$!: Observable<FamilyMember[]>;
  loading$!: Observable<boolean>;
  total$!: Observable<number>;
  currentUser$!: Observable<UserProfile | null>;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.members$ = this.store.select(selectAllMembers);
    this.loading$ = this.store.select(selectMembersLoading);
    this.total$ = this.store.select(selectMembersTotal);
    this.currentUser$ = this.store.select(selectCurrentUser);

    this.store.dispatch(MembersActions.loadMembers({}));

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe((search) => {
      this.store.dispatch(MembersActions.loadMembers({ search: search ?? undefined }));
    });
  }
}
