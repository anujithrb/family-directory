import { createActionGroup, props } from '@ngrx/store';

export interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  dateOfDeath?: string;
  gender: string;
  photoUrl?: string;
  bio?: string;
  isLiving: boolean;
}

export const MembersActions = createActionGroup({
  source: 'Members',
  events: {
    'Load Members': props<{ search?: string; isLiving?: boolean; page?: number }>(),
    'Load Members Success': props<{ members: FamilyMember[]; total: number }>(),
    'Load Members Failure': props<{ error: string }>(),
    'Load Member': props<{ id: string }>(),
    'Load Member Success': props<{ member: FamilyMember }>(),
    'Load Member Failure': props<{ error: string }>(),
    'Create Member': props<{ data: Partial<FamilyMember> }>(),
    'Create Member Success': props<{ member: FamilyMember }>(),
    'Create Member Failure': props<{ error: string }>(),
    'Update Member': props<{ id: string; data: Partial<FamilyMember> }>(),
    'Update Member Success': props<{ member: FamilyMember }>(),
    'Update Member Failure': props<{ error: string }>(),
    'Delete Member': props<{ id: string }>(),
    'Delete Member Success': props<{ id: string }>(),
    'Delete Member Failure': props<{ error: string }>(),
  },
});
