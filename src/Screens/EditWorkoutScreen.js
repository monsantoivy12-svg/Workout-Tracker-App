import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import WorkoutForm from '../components/WorkoutForm';
import AppButton from '../components/AppButton';
import { useWorkouts } from '../context/WorkoutContext';

export default function EditWorkoutScreen() {
  const { id } = useLocalSearchParams();
  const { getWorkout, updateWorkout } = useWorkouts();
  const router = useRouter();
  const w = getWorkout(id);

  if (!w)
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ marginBottom: 12 }}>Workout not found.</Text>
        <AppButton title="Go to Home" onPress={() => router.replace('/(tabs)')} />
      </View>
    );

  return (
    <ScrollView style={{ backgroundColor: 'transparent' }} contentContainerStyle={{ padding: 16 }}>
      <WorkoutForm
        initial={w}
        submitLabel="Update Workout"
        onSubmit={(d) => {
          updateWorkout(id, d);
          router.back();
        }}
      />
    </ScrollView>
  );
}