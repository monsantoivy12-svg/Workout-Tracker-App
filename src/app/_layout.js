import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
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
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="workout/[id]" options={{ headerShown: true, title: 'Workout Details' }} />
      <Stack.Screen name="edit/[id]" options={{ headerShown: true, title: 'Edit Workout' }} />
    </Stack>
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