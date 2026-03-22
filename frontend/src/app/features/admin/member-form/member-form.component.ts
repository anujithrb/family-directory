import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { MembersActions } from '../../../core/store/members/members.actions';
import { selectSelectedMember } from '../../../core/store/members/members.selectors';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-member-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './member-form.component.html',
  styleUrl: './member-form.component.scss',
})
export class MemberFormComponent implements OnInit {
  isEdit = false;
  memberId?: string;

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    gender:    ['MALE', Validators.required],
    dateOfBirth: [null as Date | null],
    bio:       [''],
    isLiving:  [true],
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
            lastName:  member.lastName,
            gender:    member.gender,
            isLiving:  member.isLiving,
            bio:       member.bio ?? '',
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
