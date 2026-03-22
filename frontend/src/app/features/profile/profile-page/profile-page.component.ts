import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AuthActions, UserProfile } from '../../../core/store/auth/auth.actions';
import { selectCurrentUser } from '../../../core/store/auth/auth.selectors';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
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
