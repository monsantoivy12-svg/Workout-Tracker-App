import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import CalendarModal from '../components/CalendarModal';
import ScreenBackground from '../components/ScreenBackground';
import SuggestionCarousel from '../components/SuggestionCarousel';
import { colors } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { defaultImageFor } from '../data/categoryImages';
import { buildSuggestedWorkout } from '../data/exerciseLibrary';
import { selectUser } from '../store/authSlice';
import { createWorkout, selectWorkouts } from '../store/workoutsSlice';
import { fixImageUrl, youTubeThumb } from '../utils/video';

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const dateOf = (w) => (w.date ? new Date(w.date) : new Date());
const sameDay = (a, b) => a.toDateString() === b.toDateString();
const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const startOfWeek = (d) => addDays(startOfDay(d), -d.getDay());
const fmtTime = (m) => `${Math.floor(m / 60)}h ${m % 60}m`;

const getCard = () => ({
  backgroundColor: colors.card,
  borderRadius: 20,
  padding: 16,
  borderWidth: 1,
  borderColor: colors.border,
});

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
  const uri =
    fixImageUrl(workout.image) || youTubeThumb(workout.video) || defaultImageFor(workout.category);
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
      {uri && !failed ? (
        <Image
          source={{ uri }}
          style={{ width: 48, height: 48, borderRadius: 10 }}
          resizeMode="cover"
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
          <Feather name="activity" size={20} color={colors.muted} />
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

export default function HomeScreen() {
  useTheme();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const workouts = useSelector(selectWorkouts);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const card = getCard();

  const today = new Date();
  const [selected, setSelected] = useState(startOfDay(today));
  const [calOpen, setCalOpen] = useState(false);

  // week of the selected day (Sunday -> Saturday)
  const weekStart = startOfWeek(selected);
  const weekEnd = addDays(weekStart, 7);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const isCurrentWeek = sameDay(weekStart, startOfWeek(today));
  const monthLabel = weekDays[3].toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const hasWorkoutOn = (d) => workouts.some((w) => sameDay(dateOf(w), d));
  const dayWorkouts = workouts.filter((w) => sameDay(dateOf(w), selected));

  const weekWorkouts = workouts.filter((w) => {
    const d = dateOf(w);
    return d >= weekStart && d < weekEnd;
  });
  const minsPerDay = [0, 0, 0, 0, 0, 0, 0];
  weekWorkouts.forEach((w) => {
    minsPerDay[dateOf(w).getDay()] += w.duration;
  });
  const maxMins = Math.max(...minsPerDay, 1);
  const totalMins = weekWorkouts.reduce((a, w) => a + w.duration, 0);
  const totalKcal = weekWorkouts.reduce((a, w) => a + w.calories, 0);
  const topIdx = minsPerDay.indexOf(Math.max(...minsPerDay));
  const topMins = minsPerDay[topIdx];

  let streak = 0;
  const cursor = new Date();
  if (!hasWorkoutOn(cursor)) cursor.setDate(cursor.getDate() - 1);
  while (hasWorkoutOn(cursor)) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const selectedLabel = sameDay(selected, today)
    ? 'Today'
    : selected.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  const arrow = (dir) => (
    <TouchableOpacity
      onPress={() => setSelected(addDays(selected, dir * 7))}
      style={{ width: 34, height: 34, alignItems: 'center', justifyContent: 'center' }}
    >
      <Feather name={dir < 0 ? 'chevron-left' : 'chevron-right'} size={22} color={colors.dark} />
    </TouchableOpacity>
  );

  return (
    <ScreenBackground>
      <ScrollView
        style={{ backgroundColor: 'transparent' }}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 120, paddingHorizontal: 16 }}
      >
        {/* Header */}
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

        {/* Calendar */}
        <View style={{ backgroundColor: colors.primary, borderRadius: 24, padding: 16, marginTop: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <TouchableOpacity onPress={() => setCalOpen(true)} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: colors.dark, fontWeight: '800', fontSize: 15 }}>{monthLabel}</Text>
              <Feather name="chevron-down" size={18} color={colors.dark} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {!sameDay(selected, today) ? (
                <TouchableOpacity
                  onPress={() => setSelected(startOfDay(today))}
                  style={{
                    backgroundColor: colors.dark,
                    borderRadius: 10,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    marginRight: 6,
                  }}
                >
                  <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 12 }}>Today</Text>
                </TouchableOpacity>
              ) : null}
              {arrow(-1)}
              {arrow(1)}
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {weekDays.map((d, i) => {
              const isSel = sameDay(d, selected);
              const isToday = sameDay(d, today);
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSelected(startOfDay(d))}
                  style={{ alignItems: 'center', width: 38 }}
                >
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
                      backgroundColor: isSel ? '#fff' : 'transparent',
                      borderWidth: isToday && !isSel ? 2 : 0,
                      borderColor: colors.dark,
                    }}
                  >
                    <Text style={{ color: colors.dark, fontWeight: '800', fontSize: 15 }}>{d.getDate()}</Text>
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
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Workouts on the selected day */}
        <View style={[card, { marginTop: 16 }]}>
          <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>{selectedLabel}</Text>
          {dayWorkouts.length === 0 ? (
            <>
              <Text style={{ color: colors.muted, marginTop: 8 }}>No workouts on this day.</Text>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/(tabs)/workouts', params: { tab: 'add' } })}
                style={{ marginTop: 10 }}
              >
                <Text style={{ color: colors.primary, fontWeight: '800' }}>+ Add a workout</Text>
              </TouchableOpacity>
            </>
          ) : (
            dayWorkouts.map((w) => (
              <ActivityRow key={w.id} workout={w} onPress={() => router.push(`/workout/${w.id}`)} />
            ))
          )}
        </View>

        {/* Activity overview */}
        <View style={[card, { marginTop: 16 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
            <Text style={{ color: colors.text, fontWeight: '800' }}>Activity Overview</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>{isCurrentWeek ? 'This Week' : 'Selected Week'}</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Stat icon="clock" value={fmtTime(totalMins)} label="Total Time" />
            <Stat icon="zap" value={totalKcal} label="Calories" />
            <Stat icon="award" value={weekWorkouts.length} label="Workouts" />
          </View>
        </View>

        {/* Weekly chart */}
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

        {/* Most active + streak */}
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

        {/* Recent activity */}
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

        <View style={{ marginHorizontal: -16 }}>
          <SuggestionCarousel onAdd={(item) => dispatch(createWorkout(buildSuggestedWorkout(item)))} />
        </View>
      </ScrollView>

      <CalendarModal
        visible={calOpen}
        selected={selected}
        hasWorkoutOn={hasWorkoutOn}
        onSelect={(d) => {
          setSelected(startOfDay(d));
          setCalOpen(false);
        }}
        onClose={() => setCalOpen(false)}
      />
    </ScreenBackground>
  );
}