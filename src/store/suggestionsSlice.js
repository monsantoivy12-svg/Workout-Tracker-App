import { createSlice } from '@reduxjs/toolkit';
import { workoutSuggestions } from '../data/workoutSuggestions';

const suggestionsSlice = createSlice({
  name: 'suggestions',
  initialState: { items: workoutSuggestions.map((x) => ({ ...x })) },
  reducers: {
    addSuggestion(state, { payload }) {
      state.items.unshift({ ...payload, id: `s${Date.now()}` });
    },
    updateSuggestion(state, { payload: { id, data } }) {
      const i = state.items.findIndex((x) => x.id === id);
      if (i >= 0) state.items[i] = { ...state.items[i], ...data };
    },
    removeSuggestion(state, { payload: id }) {
      state.items = state.items.filter((x) => x.id !== id);
    },
  },
});

export const { addSuggestion, updateSuggestion, removeSuggestion } = suggestionsSlice.actions;
export default suggestionsSlice.reducer;

export const selectSuggestions = (state) => state.suggestions.items;