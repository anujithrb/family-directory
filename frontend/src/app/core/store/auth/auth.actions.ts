import { createActionGroup, emptyProps, props } from '@ngrx/store';

export interface UserProfile {
  id: string;
  email: string;
  role: 'ADMIN' | 'USER' | 'READ_ONLY';
  familyMemberId: string;
  permissions: { permissionKey: string }[];
  familyMember?: { firstName: string; lastName: string; photoUrl?: string };
}

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Login': props<{ email: string; password: string }>(),
    'Login Success': props<{ accessToken: string; user: UserProfile }>(),
    'Login Failure': props<{ error: string }>(),
    'Logout': emptyProps(),
    'Logout Success': emptyProps(),
    'Refresh Success': props<{ accessToken: string }>(),
    'Load Profile': emptyProps(),
    'Load Profile Success': props<{ user: UserProfile }>(),
    'Load Profile Failure': props<{ error: string }>(),
  },
});
