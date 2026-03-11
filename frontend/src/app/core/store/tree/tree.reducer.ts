import { createReducer, on } from '@ngrx/store';
import { TreeActions, TreeNode, TreeEdge } from './tree.actions';

export interface TreeState {
  nodes: TreeNode[];
  edges: TreeEdge[];
  loading: boolean;
  error: string | null;
}

export const initialState: TreeState = {
  nodes: [],
  edges: [],
  loading: false,
  error: null,
};

export const treeReducer = createReducer(
  initialState,
  on(TreeActions.loadTree, (state) => ({ ...state, loading: true })),
  on(TreeActions.loadTreeSuccess, (state, { nodes, edges }) => ({
    ...state, nodes, edges, loading: false, error: null,
  })),
  on(TreeActions.loadTreeFailure, (state, { error }) => ({ ...state, loading: false, error })),
);
