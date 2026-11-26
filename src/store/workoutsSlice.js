import { createSlice } from '@reduxjs/toolkit';

const same = (a, b) => String(a) === String(b);

// pinakagamay nga ID nga wala pa magamit (mobalik ang na-delete)
const getNextId = (list) => {
  const used = new Set(list.map((w) => String(w.id)));
  let n = 1;
  while (used.has(String(n))) n++;
  return String(n);
};

const workoutsSlice = createSlice({
  name: 'workouts',
  initialState: { byUser: {} }, // { [email]: workouts[] }
  reducers: {
    ensureUserData(state, { payload: email }) {
      if (!state.byUser[email]) state.byUser[email] = [];
    },
    addWorkout(state, { payload: { email, workout } }) {
      if (!state.byUser[email]) state.byUser[email] = [];
      const list = state.byUser[email];
      list.unshift({ date: new Date().toISOString(), ...workout, id: getNextId(list) });
    },
    updateWorkout(state, { payload: { email, id, data } }) {
      const w = (state.byUser[email] || []).find((x) => same(x.id, id));
      if (w) Object.assign(w, data);
    },
    deleteWorkout(state, { payload: { email, id } }) {
      state.byUser[email] = (state.byUser[email] || []).filter((x) => !same(x.id, id));
    },
  },
});

export const { ensureUserData, addWorkout, updateWorkout, deleteWorkout } = workoutsSlice.actions;
export default workoutsSlice.reducer;

// ---- thunks: kuhaon ang email sa current user ----
export const createWorkout = (workout) => (dispatch, getState) =>
  dispatch(addWorkout({ email: getState().auth.user.email, workout }));

export const editWorkout = (id, data) => (dispatch, getState) =>
  dispatch(updateWorkout({ email: getState().auth.user.email, id, data }));

export const removeWorkout = (id) => (dispatch, getState) =>
  dispatch(deleteWorkout({ email: getState().auth.user.email, id }));

// ---- selectors ----
const EMPTY = [];
export const selectWorkouts = (state) =>
  state.workouts.byUser[state.auth.user?.email || 'guest'] ?? EMPTY;

export const selectWorkoutById = (id) => (state) =>
  selectWorkouts(state).find((w) => same(w.id, id));
