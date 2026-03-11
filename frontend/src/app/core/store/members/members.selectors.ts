import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MembersState } from './members.reducer';

export const selectMembersState = createFeatureSelector<MembersState>('members');
export const selectAllMembers = createSelector(selectMembersState, (s) => s.members);
export const selectSelectedMember = createSelector(selectMembersState, (s) => s.selectedMember);
export const selectMembersTotal = createSelector(selectMembersState, (s) => s.total);
export const selectMembersLoading = createSelector(selectMembersState, (s) => s.loading);
