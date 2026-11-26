import { createSlice } from '@reduxjs/toolkit';
import { ensureUserData } from './workoutsSlice';

// Built-in admin account
const ADMIN = {
  name: 'Admin',
  email: 'admin@fittrack.com',
  username: 'admin',
  password: 'admin123',
  role: 'admin',
  createdAt: new Date().toISOString(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState: { users: [ADMIN], user: null },
  reducers: {
    userAdded(state, { payload }) {
      state.users.push(payload);
    },
    loggedIn(state, { payload }) {
      const u = { ...payload, lastLogin: new Date().toISOString() };
      const i = state.users.findIndex((x) => x.email === u.email);
      if (i >= 0) state.users[i] = u;
      state.user = u;
    },
    // i-merge ang fields sa current user (name, username, avatar, password, reminder)
    userPatched(state, { payload }) {
      if (!state.user) return;
      state.user = { ...state.user, ...payload };
      const i = state.users.findIndex((u) => u.email === state.user.email);
      if (i >= 0) state.users[i] = state.user;
    },
    loggedOut(state) {
      state.user = null;
    },
  },
});

export const { userAdded, loggedIn, userPatched, loggedOut } = authSlice.actions;
export default authSlice.reducer;

// ---- thunks: mobalik og error string, o null kung success ----
export const registerUser = (name, email, password) => (dispatch, getState) => {
  const cleanEmail = email.trim().toLowerCase();
  if (!name.trim() || !cleanEmail || password.length < 6)
    return 'Fill all fields (password min 6 characters).';
  if (getState().auth.users.some((u) => u.email === cleanEmail)) return 'Email already registered.';
  dispatch(
    userAdded({
      name: name.trim(),
      email: cleanEmail,
      username: cleanEmail.split('@')[0],
      password,
      role: 'user',
      createdAt: new Date().toISOString(),
    })
  );
  return null;
};

export const loginUser = (email, password) => (dispatch, getState) => {
  const found = getState().auth.users.find(
    (u) => u.email === email.trim().toLowerCase() && u.password === password
  );
  if (!found) return 'Invalid email or password. Register first if you have no account.';
  dispatch(ensureUserData(found.email));
  dispatch(loggedIn(found));
  return null;
};

export const updateUserProfile = ({ name, username }) => (dispatch, getState) => {
  const { user, users } = getState().auth;
  const n = name.trim();
  const u = username.trim().toLowerCase().replace(/\s+/g, '');
  if (!n || !u) return 'Name and username are required.';
  if (users.some((x) => x.email !== user.email && x.username === u)) return 'Username is already taken.';
  dispatch(userPatched({ name: n, username: u }));
  return null;
};

export const changeUserPassword = (oldPw, newPw) => (dispatch, getState) => {
  const { user } = getState().auth;
  if (oldPw !== user.password) return 'Current password is incorrect.';
  if (newPw.length < 6) return 'New password must be at least 6 characters.';
  dispatch(userPatched({ password: newPw }));
  return null;
};

// ---- selectors ----
export const selectUser = (state) => state.auth.user;
export const selectIsAdmin = (state) => state.auth.user?.role === 'admin';