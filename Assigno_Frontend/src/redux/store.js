import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authslice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});