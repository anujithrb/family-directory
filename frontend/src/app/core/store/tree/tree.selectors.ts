import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TreeState } from './tree.reducer';

export const selectTreeState = createFeatureSelector<TreeState>('tree');
export const selectTreeNodes = createSelector(selectTreeState, (s) => s.nodes);
export const selectTreeEdges = createSelector(selectTreeState, (s) => s.edges);
export const selectTreeLoading = createSelector(selectTreeState, (s) => s.loading);
