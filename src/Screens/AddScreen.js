import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import AppCard from '../components/AppCard';
import ScreenHeader from '../components/ScreenHeader';
import WorkoutForm from '../components/WorkoutForm';
import { useWorkouts } from '../context/WorkoutContext';

export default function AddScreen() {
  const { addWorkout } = useWorkouts();
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title="Add Workout" subtitle="Log what you did today" />
      <ScrollView
        style={{ backgroundColor: 'transparent' }}
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <AppCard>
          <WorkoutForm
            key={Date.now()}
            submitLabel="Save Workout"
            onSubmit={(d) => {
              addWorkout(d);
              router.push('/(tabs)/workouts');
            }}
          />
        </AppCard>
      </ScrollView>
    </View>
  );
}