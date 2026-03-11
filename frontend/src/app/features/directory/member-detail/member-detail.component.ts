import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { Observable, map } from 'rxjs';
import { MembersActions, FamilyMember } from '../../../core/store/members/members.actions';
import { selectSelectedMember, selectMembersLoading } from '../../../core/store/members/members.selectors';
import { selectCurrentUser } from '../../../core/store/auth/auth.selectors';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatCardModule, MatButtonModule,
    MatChipsModule, MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="detail-container">
      <div *ngIf="loading$ | async" class="loading-center"><mat-spinner></mat-spinner></div>
      <ng-container *ngIf="!(loading$ | async) && (member$ | async) as member">
        <mat-card>
          <div class="member-header">
            <img [src]="member.photoUrl || 'assets/icons/default-avatar.svg'"
                 [alt]="member.firstName" class="profile-photo">
            <div class="member-info">
              <h1>{{ member.firstName }} {{ member.lastName }}</h1>
              <mat-chip-set>
                <mat-chip>{{ member.gender }}</mat-chip>
                <mat-chip [color]="member.isLiving ? 'primary' : 'warn'">
                  {{ member.isLiving ? 'Living' : 'Deceased' }}
                </mat-chip>
              </mat-chip-set>
            </div>
          </div>
          <mat-card-content>
            <div class="info-row" *ngIf="member.dateOfBirth">
              <mat-icon>cake</mat-icon>
              <span>Born: {{ member.dateOfBirth | date:'longDate' }}</span>
            </div>
            <div class="info-row" *ngIf="member.dateOfDeath">
              <mat-icon>sentiment_very_dissatisfied</mat-icon>
              <span>Passed: {{ member.dateOfDeath | date:'longDate' }}</span>
            </div>
            <div class="bio" *ngIf="member.bio">
              <h3>About</h3>
              <p>{{ member.bio }}</p>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button routerLink="/directory">
              <mat-icon>arrow_back</mat-icon> Back
            </button>
            <button mat-raised-button color="primary"
                    [routerLink]="['/admin/members', member.id, 'edit']"
                    *ngIf="canEdit$ | async">
              <mat-icon>edit</mat-icon> Edit
            </button>
          </mat-card-actions>
        </mat-card>
      </ng-container>
    </div>
  `,
  styles: [`
    .detail-container { padding: 16px; max-width: 800px; margin: 0 auto; }
    .loading-center { display: flex; justify-content: center; padding: 32px; }
    .member-header { display: flex; gap: 24px; align-items: flex-start; padding: 16px; }
    .profile-photo { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; }
    .member-info h1 { margin: 0 0 8px; }
    .info-row { display: flex; align-items: center; gap: 8px; margin: 8px 0; }
    .bio { margin-top: 16px; }
  `],
})
export class MemberDetailComponent implements OnInit {
  member$!: Observable<FamilyMember | null>;
  loading$!: Observable<boolean>;
  canEdit$!: Observable<boolean>;

  constructor(private route: ActivatedRoute, private store: Store) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.member$ = this.store.select(selectSelectedMember);
    this.loading$ = this.store.select(selectMembersLoading);
    this.canEdit$ = this.store.select(selectCurrentUser).pipe(
      map((user) =>
        user?.role === 'ADMIN' ||
        user?.permissions?.some((p) => p.permissionKey === 'CAN_EDIT_PROFILE') ||
        false
      ),
    );
    this.store.dispatch(MembersActions.loadMember({ id }));
  }
}
