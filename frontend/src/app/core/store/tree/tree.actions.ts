import { createActionGroup, emptyProps, props } from '@ngrx/store';

export interface TreeNode {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  gender: string;
  isLiving: boolean;
}

export interface TreeEdge {
  id: string;
  fromMemberId: string;
  toMemberId: string;
  type: string;
}

export const TreeActions = createActionGroup({
  source: 'Tree',
  events: {
    'Load Tree': emptyProps(),
    'Load Tree Success': props<{ nodes: TreeNode[]; edges: TreeEdge[] }>(),
    'Load Tree Failure': props<{ error: string }>(),
  },
});
