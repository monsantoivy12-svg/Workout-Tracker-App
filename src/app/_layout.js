import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { colors } from '../constants/theme';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { WorkoutProvider } from '../context/WorkoutContext';

// Auth guard: if not logged in, always go to Login
function AuthGate() {
  const { user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const onAuthScreen = segments[0] === 'login' || segments[0] === 'register';
    if (!user && !onAuthScreen) router.replace('/login');
    if (user && onAuthScreen) router.replace('/(tabs)');
  }, [user, segments]);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.dark },
        }}
      >
        {/* Details screen draws its own top bar + Back button */}
        <Stack.Screen name="workout/[id]" options={{ headerShown: false }} />
        <Stack.Screen
          name="edit/[id]"
          options={{
            headerShown: true,
            title: 'Edit Workout',
            headerStyle: { backgroundColor: colors.dark },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '800' },
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <WorkoutProvider>
        <AuthGate />
      </WorkoutProvider>
    </AuthProvider>
  );
}