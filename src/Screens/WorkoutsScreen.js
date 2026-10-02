import { FlatList, Text } from 'react-native';
import { useRouter } from 'expo-router';
import WorkoutItem from '../components/WorkoutItem';
import { useWorkouts } from '../context/WorkoutContext';
import { colors } from '../constants/theme';

export default function WorkoutsScreen() {
  const { workouts } = useWorkouts();
  const router = useRouter();

  return (
    <FlatList
      style={{ backgroundColor: 'transparent' }}
      contentContainerStyle={{ padding: 16 }}
      data={workouts}
      keyExtractor={(w) => w.id}
      ListEmptyComponent={
        <Text style={{ textAlign: 'center', color: colors.muted }}>No workouts yet. Add one!</Text>
      }
      renderItem={({ item }) => (
        <WorkoutItem workout={item} onPress={() => router.push(`/workout/${item.id}`)} />
      )}
    />
  );
}