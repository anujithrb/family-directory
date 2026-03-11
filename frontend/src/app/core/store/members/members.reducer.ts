import { createReducer, on } from '@ngrx/store';
import { MembersActions, FamilyMember } from './members.actions';

export interface MembersState {
  members: FamilyMember[];
  selectedMember: FamilyMember | null;
  total: number;
  loading: boolean;
  error: string | null;
}

export const initialState: MembersState = {
  members: [],
  selectedMember: null,
  total: 0,
  loading: false,
  error: null,
};

export const membersReducer = createReducer(
  initialState,
  on(MembersActions.loadMembers, (state) => ({ ...state, loading: true })),
  on(MembersActions.loadMembersSuccess, (state, { members, total }) => ({
    ...state, members, total, loading: false, error: null,
  })),
  on(MembersActions.loadMembersFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(MembersActions.loadMemberSuccess, (state, { member }) => ({
    ...state, selectedMember: member, loading: false,
  })),
  on(MembersActions.createMemberSuccess, (state, { member }) => ({
    ...state, members: [...state.members, member], total: state.total + 1,
  })),
  on(MembersActions.updateMemberSuccess, (state, { member }) => ({
    ...state,
    members: state.members.map((m) => m.id === member.id ? member : m),
    selectedMember: state.selectedMember?.id === member.id ? member : state.selectedMember,
  })),
  on(MembersActions.deleteMemberSuccess, (state, { id }) => ({
    ...state, members: state.members.filter((m) => m.id !== id), total: state.total - 1,
  })),
);
