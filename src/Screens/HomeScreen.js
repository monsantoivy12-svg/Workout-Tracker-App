import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import ScreenBackground from '../components/ScreenBackground';
import ScreenHeader from '../components/ScreenHeader';
import SuggestionCard from '../components/SuggestionCard';
import { colors } from '../constants/theme';
import { useWorkouts } from '../context/WorkoutContext';
import { workoutSuggestions } from '../data/workoutSuggestions';

// Compact row inside the "Recent Activity" card
function ActivityRow({ workout, onPress }) {
  const [failed, setFailed] = useState(false);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 14,
        padding: 10,
        marginTop: 10,
      }}
    >
      {workout.image && !failed ? (
        <Image
          source={{ uri: workout.image }}
          style={{ width: 48, height: 48, borderRadius: 10 }}
          onError={() => setFailed(true)}
        />
      ) : (
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            backgroundColor: colors.card,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 22 }}>🏋️</Text>
        </View>
      )}
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text numberOfLines={1} style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>
          {workout.name}
        </Text>
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{workout.calories} kcal</Text>
      </View>
      <Feather name="clock" size={14} color={colors.primary} />
      <Text style={{ color: colors.text, fontWeight: '600', marginLeft: 6 }}>{workout.duration} min</Text>
    </TouchableOpacity>
  );
}

// White goal card (like "Steps" / "Activity")
function GoalCard({ label, value, goal, unit, icon }) {
  const pct = Math.min(100, Math.round((value / goal) * 100));
  return (
    <View style={{ flex: 1, backgroundColor: colors.light, borderRadius: 20, padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: '#6B7280', fontWeight: '700' }}>{label}</Text>
        <Feather name={icon} size={18} color={colors.primary} />
      </View>
      <View style={{ height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, marginVertical: 12 }}>
        <View style={{ width: `${pct}%`, height: 4, backgroundColor: colors.primary, borderRadius: 2 }} />
      </View>
      <Text style={{ fontSize: 30, fontWeight: '900', color: '#111' }}>{value}</Text>
      <Text style={{ fontSize: 11, fontWeight: '700', color: '#9CA3AF', marginTop: 2 }}>
        OF {goal} {unit}
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const { workouts, addWorkout } = useWorkouts();
  const router = useRouter();
  const minutes = workouts.reduce((a, w) => a + w.duration, 0);
  const kcal = workouts.reduce((a, w) => a + w.calories, 0);
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <ScreenBackground>
      <ScrollView style={{ backgroundColor: 'transparent' }} contentContainerStyle={{ paddingBottom: 24 }}>
        <ScreenHeader
          title="Overview"
          subtitle={`📅  ${today}`}
          right={
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                backgroundColor: colors.card,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Feather name="bell" size={20} color={colors.primary} />
            </View>
          }
        />

        <View style={{ padding: 16 }}>
          {/* Recent Activity: shows 5 clickable items -> /workout/[id] */}
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 20,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: colors.text, fontSize: 17, fontWeight: '800' }}>Recent Activity</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/workouts')}>
                <Text style={{ color: colors.muted, fontWeight: '600' }}>View All ›</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ color: colors.primary, fontWeight: '700', marginTop: 6 }}>🔥 {kcal} kcal</Text>

            {workouts.slice(0, 5).map((w) => (
              <ActivityRow key={w.id} workout={w} onPress={() => router.push(`/workout/${w.id}`)} />
            ))}
          </View>

          {/* Goals */}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
            <GoalCard label="Minutes" value={minutes} goal={300} unit="MIN" icon="clock" />
            <GoalCard label="Activity" value={kcal} goal={2000} unit="KCAL" icon="activity" />
          </View>

          {/* Suggestions */}
          <Text
            style={{
              fontSize: 18,
              fontWeight: '900',
              marginTop: 24,
              marginBottom: 12,
              color: colors.text,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Suggested Workouts
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}