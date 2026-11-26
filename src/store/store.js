import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist';
import authReducer from './authSlice';
import suggestionsReducer from './suggestionsSlice';
import themeReducer from './themeSlice';
import workoutsReducer from './workoutsSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  workouts: workoutsReducer,
  theme: themeReducer,
  suggestions: suggestionsReducer,
});

// root-v3: resets old saved data (suggestions with the wrong video path)
const persisted = persistReducer({ key: 'root-v3', storage: AsyncStorage }, rootReducer);

export const store = configureStore({
  reducer: persisted,
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);