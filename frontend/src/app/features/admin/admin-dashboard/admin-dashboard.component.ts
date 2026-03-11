import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Store } from '@ngrx/store';
import { MembersActions, FamilyMember } from '../../../core/store/members/members.actions';
import { selectAllMembers, selectMembersLoading } from '../../../core/store/members/members.selectors';
import { Observable } from 'rxjs';

interface User {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  familyMember?: { firstName: string; lastName: string };
  permissions: { permissionKey: string }[];
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatTableModule, MatButtonModule,
    MatIconModule, MatTabsModule, MatChipsModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="admin-container">
      <h1>Admin Dashboard</h1>
      <mat-tab-group>
        <mat-tab label="Family Members">
          <div class="tab-content">
            <button mat-raised-button color="primary" routerLink="/admin/members/new" class="add-btn">
              <mat-icon>add</mat-icon> Add Member
            </button>
            <div *ngIf="loading$ | async"><mat-spinner diameter="32"></mat-spinner></div>
            <table mat-table [dataSource]="(members$ | async) ?? []" class="full-width">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let m">{{ m.firstName }} {{ m.lastName }}</td>
              </ng-container>
              <ng-container matColumnDef="gender">
                <th mat-header-cell *matHeaderCellDef>Gender</th>
                <td mat-cell *matCellDef="let m">{{ m.gender }}</td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let m">
                  <mat-chip [color]="m.isLiving ? 'primary' : 'warn'">
                    {{ m.isLiving ? 'Living' : 'Deceased' }}
                  </mat-chip>
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let m">
                  <button mat-icon-button [routerLink]="['/admin/members', m.id, 'edit']">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteMember(m.id)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="memberCols"></tr>
              <tr mat-row *matRowDef="let row; columns: memberCols;"></tr>
            </table>
          </div>
        </mat-tab>
        <mat-tab label="Users">
          <div class="tab-content">
            <div *ngIf="usersLoading"><mat-spinner diameter="32"></mat-spinner></div>
            <table mat-table [dataSource]="users" class="full-width">
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let u">{{ u.email }}</td>
              </ng-container>
              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef>Role</th>
                <td mat-cell *matCellDef="let u"><mat-chip>{{ u.role }}</mat-chip></td>
              </ng-container>
              <ng-container matColumnDef="active">
                <th mat-header-cell *matHeaderCellDef>Active</th>
                <td mat-cell *matCellDef="let u">
                  <mat-icon>{{ u.isActive ? 'check_circle' : 'cancel' }}</mat-icon>
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let u">
                  <button mat-button (click)="grantPermission(u.id)">Grant Permission</button>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="userCols"></tr>
              <tr mat-row *matRowDef="let row; columns: userCols;"></tr>
            </table>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .admin-container { padding: 16px; max-width: 1200px; margin: 0 auto; }
    .tab-content { padding: 16px 0; }
    .add-btn { margin-bottom: 16px; }
    .full-width { width: 100%; }
  `],
})
export class AdminDashboardComponent implements OnInit {
  members$!: Observable<FamilyMember[]>;
  loading$!: Observable<boolean>;
  users: User[] = [];
  usersLoading = false;
  memberCols = ['name', 'gender', 'status', 'actions'];
  userCols = ['email', 'role', 'active', 'actions'];

  constructor(private store: Store, private http: HttpClient) {}

  ngOnInit(): void {
    this.members$ = this.store.select(selectAllMembers);
    this.loading$ = this.store.select(selectMembersLoading);
    this.store.dispatch(MembersActions.loadMembers({}));
    this.loadUsers();
  }

  loadUsers(): void {
    this.usersLoading = true;
    this.http.get<{ data: { users: User[] } }>(`${environment.apiBaseUrl}/users`).subscribe({
      next: ({ data }) => { this.users = data.users; this.usersLoading = false; },
      error: () => { this.usersLoading = false; },
    });
  }

  deleteMember(id: string): void {
    if (confirm('Delete this member?')) {
      this.store.dispatch(MembersActions.deleteMember({ id }));
    }
  }

  grantPermission(userId: string): void {
    this.http.post(
      `${environment.apiBaseUrl}/users/${userId}/permissions`,
      { permissionKey: 'CAN_ADD_RELATIVES' }
    ).subscribe({ next: () => this.loadUsers() });
  }
}
