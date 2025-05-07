import { init, RematchDispatch, RematchRootState } from '@rematch/core';
import { models } from './models';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { RootModel } from './models/types';

// Initialize store
export const store = init({
  models,
});

// Export types
export type RootState = RematchRootState<RootModel>;
export type Dispatch = RematchDispatch<RootModel>;
export type AppDispatch = typeof store.dispatch;

// Export components and hooks
export { Provider, useSelector, useDispatch };

