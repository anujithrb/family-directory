import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MembersActions, FamilyMember } from '../../../core/store/members/members.actions';
import { selectAllMembers, selectMembersLoading } from '../../../core/store/members/members.selectors';
import { environment } from '../../../../environments/environment';

export interface AdminUser {
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
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  activeTab: 'members' | 'users' = 'members';

  members$!: Observable<FamilyMember[]>;
  loading$!: Observable<boolean>;

  users: AdminUser[] = [];
  usersLoading = false;

  constructor(private store: Store, private http: HttpClient) {}

  ngOnInit(): void {
    this.members$ = this.store.select(selectAllMembers);
    this.loading$ = this.store.select(selectMembersLoading);
    this.store.dispatch(MembersActions.loadMembers({}));
    this.loadUsers();
  }

  loadUsers(): void {
    this.usersLoading = true;
    this.http.get<{ data: { users: AdminUser[] } }>(`${environment.apiBaseUrl}/users`).subscribe({
      next: ({ data }) => { this.users = data.users; this.usersLoading = false; },
      error: () => { this.usersLoading = false; },
    });
  }

  deleteMember(id: string): void {
    if (confirm('Delete this member? This cannot be undone.')) {
      this.store.dispatch(MembersActions.deleteMember({ id }));
    }
  }

  grantPermission(userId: string): void {
    const key = prompt('Enter permission key:');
    if (key) {
      this.http.post(`${environment.apiBaseUrl}/users/${userId}/permissions`, { permissionKey: key })
        .subscribe({
          next: () => this.loadUsers(),
          error: () => alert('Failed to grant permission. Please try again.'),
        });
    }
  }
}
