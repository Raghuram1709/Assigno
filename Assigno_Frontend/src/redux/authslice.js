import { createSlice } from '@reduxjs/toolkit';

// UPDATED: Helper functions for localStorage
const loadAuthFromStorage = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    if (user && token) {
      return { user, token, isAuthenticated: true };
    }
  } catch (err) {
    console.error('Error loading auth from localStorage:', err);
  }
  return { user: null, token: null, isAuthenticated: false };
};

const saveAuthToStorage = (user, token) => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', token);
};

const clearAuthFromStorage = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  message: null,
  ...loadAuthFromStorage(), // UPDATED: Load from localStorage on init
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      // UPDATED: Save to localStorage
      saveAuthToStorage(action.payload.user, action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      // UPDATED: Clear from localStorage
      clearAuthFromStorage();
    },
    setMessage: (state, action) => {
      state.message = action.payload;
    },
    clearMessage: (state) => {
      state.message = null;
    },
  },
});

export const { login, logout, setMessage, clearMessage } = authSlice.actions;
export default authSlice.reducer;