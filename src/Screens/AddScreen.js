import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useDispatch } from 'react-redux';
import AppCard from '../components/AppCard';
import ScreenHeader from '../components/ScreenHeader';
import WorkoutForm from '../components/WorkoutForm';
import { createWorkout } from '../store/workoutsSlice';

export default function AddScreen() {
  const dispatch = useDispatch();
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
              dispatch(createWorkout(d));
              router.push('/(tabs)/workouts');
            }}
          />
        </AppCard>
      </ScrollView>
    </View>
  );
}