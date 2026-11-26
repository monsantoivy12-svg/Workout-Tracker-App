import { createSlice } from '@reduxjs/toolkit';

// preference: 'system' | 'light' | 'dark'
const themeSlice = createSlice({
  name: 'theme',
  initialState: { preference: 'system' },
  reducers: {
    setPreference(state, { payload }) {
      state.preference = payload;
    },
  },
});

export const { setPreference } = themeSlice.actions;
export default themeSlice.reducer;

export const selectPreference = (state) => state.theme.preference;