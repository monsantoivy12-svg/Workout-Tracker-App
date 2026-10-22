import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';
import WorkoutForm from '../components/WorkoutForm';
import { colors } from '../constants/theme';
import { useWorkouts } from '../context/WorkoutContext';

export default function EditWorkoutScreen() {
  const { id } = useLocalSearchParams();
  const { getWorkout, updateWorkout } = useWorkouts();
  const router = useRouter();
  const w = getWorkout(id);

  if (!w)
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ marginBottom: 12, color: colors.text }}>Workout not found.</Text>
        <AppButton title="Go to Home" onPress={() => router.replace('/(tabs)')} />
      </View>
    );

  return (
    <ScrollView style={{ backgroundColor: 'transparent' }} contentContainerStyle={{ padding: 16 }}>
      <AppCard>
        <WorkoutForm
          initial={w}
          submitLabel="Update Workout"
          onSubmit={(d) => {
            updateWorkout(id, d);
            router.back();
          }}
        />
      </AppCard>
    </ScrollView>
  );
}