import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';
import WorkoutForm from '../components/WorkoutForm';
import { colors } from '../constants/theme';
import { editWorkout, selectWorkoutById } from '../store/workoutsSlice';

export default function EditWorkoutScreen() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const dispatch = useDispatch();
  const w = useSelector(selectWorkoutById(id));
  const router = useRouter();

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
            dispatch(editWorkout(id, d));
            router.back();
          }}
        />
      </AppCard>
    </ScrollView>
  );
}