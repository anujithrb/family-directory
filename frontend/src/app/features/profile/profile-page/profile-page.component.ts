import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AuthActions, UserProfile } from '../../../core/store/auth/auth.actions';
import { selectCurrentUser } from '../../../core/store/auth/auth.selectors';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <div class="profile-container">
      <mat-card *ngIf="user$ | async as user">
        <mat-card-header>
          <img mat-card-avatar
               [src]="user.familyMember?.photoUrl || 'assets/icons/default-avatar.svg'"
               [alt]="user.familyMember?.firstName || 'User'">
          <mat-card-title>{{ user.familyMember?.firstName }} {{ user.familyMember?.lastName }}</mat-card-title>
          <mat-card-subtitle>{{ user.email }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="info-row">
            <mat-icon>badge</mat-icon>
            <mat-chip>{{ user.role }}</mat-chip>
          </div>
          <div class="permissions" *ngIf="user.permissions?.length">
            <h4>Permissions:</h4>
            <mat-chip-set>
              <mat-chip *ngFor="let p of user.permissions" color="primary">{{ p.permissionKey }}</mat-chip>
            </mat-chip-set>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="warn" (click)="logout()">
            <mat-icon>logout</mat-icon> Sign Out
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container { padding: 16px; max-width: 600px; margin: 0 auto; }
    .info-row { display: flex; align-items: center; gap: 8px; margin: 8px 0; }
    .permissions { margin-top: 16px; }
  `],
})
export class ProfilePageComponent implements OnInit {
  user$!: Observable<UserProfile | null>;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.user$ = this.store.select(selectCurrentUser);
    this.store.dispatch(AuthActions.loadProfile());
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
