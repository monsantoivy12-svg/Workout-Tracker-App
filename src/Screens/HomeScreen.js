import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenBackground from '../components/ScreenBackground';
import AppCard from '../components/AppCard';
import WorkoutItem from '../components/WorkoutItem';
import SuggestionCard from '../components/SuggestionCard';
import { workoutSuggestions } from '../data/workoutSuggestions';
import { useAuth } from '../context/AuthContext';
import { useWorkouts } from '../context/WorkoutContext';
import { colors } from '../constants/theme';

const Stat = ({ label, value, color }) => (
  <View style={{ alignItems: 'center', flex: 1 }}>
    <Text style={{ fontSize: 24, fontWeight: '800', color }}>{value}</Text>
    <Text style={{ color: colors.muted }}>{label}</Text>
  </View>
);

export default function HomeScreen() {
  const { user } = useAuth();
  const { workouts, addWorkout } = useWorkouts();
  const router = useRouter();
  const minutes = workouts.reduce((a, w) => a + w.duration, 0);
  const kcal = workouts.reduce((a, w) => a + w.calories, 0);

  return (
    <ScreenBackground>
      <ScrollView style={{ backgroundColor: 'transparent' }} contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', marginBottom: 12, color: colors.text }}>
          Hi, {user?.name} 💪
        </Text>

        <AppCard title="Your Progress" style={{ backgroundColor: 'mintcream' }}>
          <View style={{ flexDirection: 'row',}}>
            <Stat label="Workouts" value={workouts.length} color={colors.primary} />
            <Stat label="Minutes" value={minutes} color={colors.secondary} />
            <Stat label="Kcal" value={kcal} color={colors.accent} />
          </View>
        </AppCard>

        <Text style={{ fontSize: 16, fontWeight: '700', marginVertical: 8, color: colors.text }}>
          Suggested Workouts
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
          {workoutSuggestions.map((s) => (
            <SuggestionCard
              key={s.id}
              item={s}
              onAdd={(x) =>
                addWorkout({
                  name: x.name,
                  duration: x.duration,
                  calories: x.calories,
                  notes: x.exercises.join(', '),
                  image: x.image,
                })
              }
            />
          ))}
        </ScrollView>

        <Text style={{ fontSize: 16, fontWeight: '700', marginVertical: 8, color: colors.text }}>
          Recent Workouts
        </Text>
        {workouts.slice(0, 3).map((w) => (
          <WorkoutItem key={w.id} workout={w} onPress={() => router.push(`/workout/${w.id}`)} />
        ))}
      </ScrollView>
    </ScreenBackground>
  );
}