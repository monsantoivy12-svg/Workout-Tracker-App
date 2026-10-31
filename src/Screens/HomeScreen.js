import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenBackground from '../components/ScreenBackground';
import SuggestionCard from '../components/SuggestionCard';
import { colors } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useWorkouts } from '../context/WorkoutContext';
import { workoutSuggestions } from '../data/workoutSuggestions';

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const dateOf = (w) => (w.date ? new Date(w.date) : new Date());
const sameDay = (a, b) => a.toDateString() === b.toDateString();
const fmtTime = (m) => `${Math.floor(m / 60)}h ${m % 60}m`;

const card = {
  backgroundColor: colors.card,
  borderRadius: 20,
  padding: 16,
  borderWidth: 1,
  borderColor: colors.border,
};

// ---------- small pieces ----------
function Stat({ icon, value, label }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Feather name={icon} size={20} color={colors.primary} />
      <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16, marginTop: 6 }}>{value}</Text>
      <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

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

// ---------- main screen ----------
export default function HomeScreen() {
  const { user } = useAuth();
  const { workouts, addWorkout } = useWorkouts();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const today = new Date();

  // week (Sunday -> Saturday)
  const weekStart = new Date(today);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const weekWorkouts = workouts.filter((w) => {
    const d = dateOf(w);
    return d >= weekStart && d < weekEnd;
  });

  // minutes per weekday for the chart
  const minsPerDay = [0, 0, 0, 0, 0, 0, 0];
  weekWorkouts.forEach((w) => {
    minsPerDay[dateOf(w).getDay()] += w.duration;
  });
  const maxMins = Math.max(...minsPerDay, 1);

  const totalMins = weekWorkouts.reduce((a, w) => a + w.duration, 0);
  const totalKcal = weekWorkouts.reduce((a, w) => a + w.calories, 0);

  // most active day
  const topIdx = minsPerDay.indexOf(Math.max(...minsPerDay));
  const topMins = minsPerDay[topIdx];

  // streak: consecutive days with workouts (ending today, or yesterday)
  const hasWorkoutOn = (d) => workouts.some((w) => sameDay(dateOf(w), d));
  let streak = 0;
  const cursor = new Date();
  if (!hasWorkoutOn(cursor)) cursor.setDate(cursor.getDate() - 1);
  while (hasWorkoutOn(cursor)) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const focus = workouts[0];
  const monthLabel = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <ScreenBackground>
      <ScrollView
        style={{ backgroundColor: 'transparent' }}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 32, paddingHorizontal: 16 }}
      >
        {/* Header: Hi, name + add button */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 26, fontWeight: '900' }} numberOfLines={1}>
              Hi, {user?.name || 'there'}
            </Text>
            <Text style={{ color: colors.muted, marginTop: 2 }}>Keep pushing forward!</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/(tabs)/workouts', params: { tab: 'add' } })}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Feather name="plus" size={26} color={colors.dark} />
          </TouchableOpacity>
        </View>

        {/* Week calendar */}
        <View style={{ backgroundColor: colors.primary, borderRadius: 24, padding: 16, marginTop: 20 }}>
          <Text style={{ color: colors.dark, fontWeight: '800', fontSize: 15, marginBottom: 14 }}>
            {monthLabel}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {weekDays.map((d, i) => {
              const isToday = sameDay(d, today);
              return (
                <View key={i} style={{ alignItems: 'center', width: 38 }}>
                  <Text style={{ color: colors.dark, opacity: 0.7, fontWeight: '700', fontSize: 12 }}>
                    {DAY_LETTERS[i]}
                  </Text>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      marginTop: 8,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isToday ? '#fff' : 'transparent',
                    }}
                  >
                    <Text style={{ color: colors.dark, fontWeight: '800', fontSize: 15 }}>
                      {d.getDate()}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: 3,
                      marginTop: 6,
                      backgroundColor: hasWorkoutOn(d) ? colors.dark : 'transparent',
                    }}
                  />
                </View>
              );
            })}
          </View>
        </View>

        {/* Activity overview */}
        <View style={[card, { marginTop: 16 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
            <Text style={{ color: colors.text, fontWeight: '800' }}>Activity Overview</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>This Week</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Stat icon="clock" value={fmtTime(totalMins)} label="Total Time" />
            <Stat icon="zap" value={totalKcal} label="Calories" />
            <Stat icon="award" value={weekWorkouts.length} label="Workouts" />
          </View>
        </View>

        {/* Weekly progress chart */}
        <View style={[card, { marginTop: 16 }]}>
          <Text style={{ color: colors.text, fontWeight: '800', marginBottom: 14 }}>Weekly Progress</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120 }}>
            {minsPerDay.map((m, i) => (
              <View key={i} style={{ alignItems: 'center', width: 32 }}>
                <View
                  style={{
                    width: 22,
                    height: Math.max(6, (m / maxMins) * 100),
                    borderRadius: 6,
                    backgroundColor: m > 0 ? colors.primary : colors.surface,
                  }}
                />
                <Text style={{ color: colors.muted, fontSize: 11, marginTop: 6 }}>{DAY_LETTERS[i]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Most active day + streak */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
          <View style={[card, { flex: 1 }]}>
            <Text style={{ color: colors.muted, fontSize: 12 }}>Most Active Day</Text>
            <Text style={{ color: colors.text, fontWeight: '900', fontSize: 18, marginTop: 6 }}>
              {topMins > 0 ? DAY_NAMES[topIdx] : '—'}
            </Text>
            <Text style={{ color: colors.primary, fontWeight: '700', marginTop: 2 }}>
              {topMins > 0 ? fmtTime(topMins) : 'No data'}
            </Text>
          </View>
          <View style={[card, { flex: 1 }]}>
            <Text style={{ color: colors.muted, fontSize: 12 }}>Current Streak</Text>
            <Text style={{ color: colors.text, fontWeight: '900', fontSize: 18, marginTop: 6 }}>
              {streak} {streak === 1 ? 'Day' : 'Days'}
            </Text>
            <Text style={{ color: colors.primary, fontWeight: '700', marginTop: 2 }}>Keep it up!</Text>
          </View>
        </View>

        {/* Today's focus */}
        {focus ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push(`/workout/${focus.id}`)}
            style={[card, { marginTop: 16 }]}
          >
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>Today's Focus</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
              <Text style={{ color: colors.text, fontSize: 20, fontWeight: '900', flex: 1 }} numberOfLines={1}>
                {focus.name}
              </Text>
              <Feather name="chevron-right" size={22} color={colors.text} />
            </View>
            <Text style={{ color: colors.muted, marginTop: 4 }}>
              {focus.duration} min • {focus.calories} kcal
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* Recent activity: 5 clickable items -> /workout/[id] */}
        <View style={[card, { marginTop: 16 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: colors.text, fontSize: 17, fontWeight: '800' }}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/workouts')}>
              <Text style={{ color: colors.muted, fontWeight: '600' }}>View All ›</Text>
            </TouchableOpacity>
          </View>
          {workouts.slice(0, 5).map((w) => (
            <ActivityRow key={w.id} workout={w} onPress={() => router.push(`/workout/${w.id}`)} />
          ))}
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
          category: x.category,
          level: x.level,
        })
      }
    />
  ))}
</ScrollView>
      </ScrollView>
    </ScreenBackground>
  );
}