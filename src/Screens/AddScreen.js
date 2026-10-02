import { ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import WorkoutForm from '../components/WorkoutForm';
import { useWorkouts } from '../context/WorkoutContext';

export default function AddScreen() {
  const { addWorkout } = useWorkouts();
  const router = useRouter();

  return (
    <ScrollView
      style={{ backgroundColor: 'transparent' }}
      contentContainerStyle={{ padding: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <WorkoutForm
        key={Date.now()}
        submitLabel="Save Workout"
        onSubmit={(d) => {
          addWorkout(d);
          router.push('/(tabs)/workouts');
        }}
      />
    </ScrollView>
  );
}