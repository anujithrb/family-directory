import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, map } from 'rxjs';
import { MembersActions, FamilyMember } from '../../../core/store/members/members.actions';
import { selectSelectedMember, selectMembersLoading } from '../../../core/store/members/members.selectors';
import { selectCurrentUser } from '../../../core/store/auth/auth.selectors';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './member-detail.component.html',
  styleUrl: './member-detail.component.scss',
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
