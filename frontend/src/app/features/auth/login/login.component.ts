import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AuthActions } from '../../../core/store/auth/auth.actions';
import { selectAuthLoading, selectAuthError } from '../../../core/store/auth/auth.selectors';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Family Directory</mat-card-title>
          <mat-card-subtitle>Sign in to your account</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email">
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" autocomplete="current-password">
            </mat-form-field>
            <div *ngIf="error$ | async as error" class="error-message">{{ error }}</div>
            <button mat-raised-button color="primary" type="submit"
                    class="full-width submit-btn"
                    [disabled]="form.invalid || (loading$ | async)">
              <mat-spinner *ngIf="loading$ | async" diameter="20"></mat-spinner>
              <span *ngIf="!(loading$ | async)">Sign In</span>
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; background: #f5f5f5; padding: 16px;
    }
    .login-card { width: 100%; max-width: 400px; }
    .full-width { width: 100%; }
    .submit-btn { margin-top: 16px; height: 44px; }
    .error-message { color: red; margin-bottom: 8px; }
    mat-card-header { margin-bottom: 16px; }
  `],
})
export class LoginComponent {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  constructor(private fb: FormBuilder, private store: Store) {
    this.loading$ = this.store.select(selectAuthLoading);
    this.error$ = this.store.select(selectAuthError);
  }

  onSubmit(): void {
    if (this.form.valid) {
      const { email, password } = this.form.value;
      this.store.dispatch(AuthActions.login({ email: email!, password: password! }));
    }
  }
}
