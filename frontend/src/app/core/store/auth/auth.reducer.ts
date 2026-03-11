import { createReducer, on } from '@ngrx/store';
import { AuthActions, UserProfile } from './auth.actions';

export interface AuthState {
  accessToken: string | null;
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export const initialState: AuthState = {
  accessToken: localStorage.getItem('accessToken'),
  user: null,
  loading: false,
  error: null,
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.login, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.loginSuccess, (state, { accessToken, user }) => {
    localStorage.setItem('accessToken', accessToken);
    return { ...state, accessToken, user, loading: false, error: null };
  }),
  on(AuthActions.loginFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(AuthActions.logout, (state) => {
    localStorage.removeItem('accessToken');
    return { ...state, accessToken: null, user: null };
  }),
  on(AuthActions.logoutSuccess, (state) => ({ ...state })),
  on(AuthActions.refreshSuccess, (state, { accessToken }) => {
    localStorage.setItem('accessToken', accessToken);
    return { ...state, accessToken };
  }),
  on(AuthActions.loadProfileSuccess, (state, { user }) => ({ ...state, user })),
  on(AuthActions.loadProfileFailure, (state, { error }) => ({ ...state, error })),
);
