import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Store } from '@ngrx/store';
import { MembersActions } from '../../../core/store/members/members.actions';
import { selectSelectedMember } from '../../../core/store/members/members.selectors';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-member-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatCheckboxModule, MatDatepickerModule, MatNativeDateModule,
  ],
  template: `
    <div class="form-container">
      <h2>{{ isEdit ? 'Edit' : 'Add' }} Family Member</h2>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>First Name</mat-label>
          <input matInput formControlName="firstName">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Last Name</mat-label>
          <input matInput formControlName="lastName">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Gender</mat-label>
          <mat-select formControlName="gender">
            <mat-option value="MALE">Male</mat-option>
            <mat-option value="FEMALE">Female</mat-option>
            <mat-option value="OTHER">Other</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Date of Birth</mat-label>
          <input matInput [matDatepicker]="dobPicker" formControlName="dateOfBirth">
          <mat-datepicker-toggle matSuffix [for]="dobPicker"></mat-datepicker-toggle>
          <mat-datepicker #dobPicker></mat-datepicker>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Biography</mat-label>
          <textarea matInput rows="4" formControlName="bio"></textarea>
        </mat-form-field>
        <mat-checkbox formControlName="isLiving">Currently Living</mat-checkbox>
        <div class="actions">
          <button mat-button type="button" routerLink="/admin">Cancel</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
            {{ isEdit ? 'Save Changes' : 'Create Member' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container { padding: 24px; max-width: 600px; margin: 0 auto; }
    .full-width { width: 100%; margin-bottom: 16px; }
    .actions { display: flex; gap: 16px; justify-content: flex-end; margin-top: 16px; }
  `],
})
export class MemberFormComponent implements OnInit {
  isEdit = false;
  memberId?: string;

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    gender: ['MALE', Validators.required],
    dateOfBirth: [null as Date | null],
    bio: [''],
    isLiving: [true],
  });

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.memberId = this.route.snapshot.paramMap.get('id') ?? undefined;
    this.isEdit = !!this.memberId;
    if (this.isEdit) {
      this.store.select(selectSelectedMember).pipe(take(1)).subscribe((member) => {
        if (member) {
          this.form.patchValue({
            firstName: member.firstName,
            lastName: member.lastName,
            gender: member.gender,
            isLiving: member.isLiving,
            bio: member.bio ?? '',
          });
        }
      });
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      const raw = this.form.value;
      const dob = raw.dateOfBirth;
      const data = {
        ...raw,
        dateOfBirth: dob != null ? new Date(dob).toISOString() : undefined,
      };
      if (this.isEdit && this.memberId) {
        this.store.dispatch(MembersActions.updateMember({ id: this.memberId, data: data as never }));
      } else {
        this.store.dispatch(MembersActions.createMember({ data: data as never }));
      }
      this.router.navigate(['/admin']);
    }
  }
}
