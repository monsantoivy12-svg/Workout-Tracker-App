import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import AnimatedSplash from '../components/AnimatedSplash';
import { colors } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { selectUser } from '../store/authSlice';
import { persistor, store } from '../store/store';

// keep the native splash visible until AnimatedSplash is drawn
SplashScreen.preventAutoHideAsync().catch(() => {});

function AuthGate() {
  const user = useSelector(selectUser);
  const { mode } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const onAuthScreen =
      segments[0] === 'welcome' || segments[0] === 'login' || segments[0] === 'register';
    if (!user && !onAuthScreen) router.replace('/welcome');
    if (user && onAuthScreen) router.replace('/(tabs)');
  }, [user, segments]);

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="workout/[id]" options={{ headerShown: false }} />
        <Stack.Screen
          name="edit/[id]"
          options={{
            headerShown: true,
            title: 'Edit Workout',
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '800' },
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthGate />
        {!splashDone ? (
          <AnimatedSplash
            onReady={() => SplashScreen.hideAsync().catch(() => {})}
            onFinish={() => setSplashDone(true)}
          />
        ) : null}
      </PersistGate>
    </Provider>
  );
}