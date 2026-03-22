import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, debounceTime, distinctUntilChanged } from 'rxjs';
import { MembersActions, FamilyMember } from '../../../core/store/members/members.actions';
import { selectAllMembers, selectMembersLoading, selectMembersTotal } from '../../../core/store/members/members.selectors';
import { selectCurrentUser } from '../../../core/store/auth/auth.selectors';
import { UserProfile } from '../../../core/store/auth/auth.actions';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.scss',
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
