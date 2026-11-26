import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import ScreenHeader from '../components/ScreenHeader';
import { colors } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { selectWorkouts } from '../store/workoutsSlice';

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_LABELS = ['Morning', 'Afternoon', 'Evening', 'Night'];

const dateOf = (w) => (w.date ? new Date(w.date) : new Date());
const sameDay = (a, b) => a.toDateString() === b.toDateString();
const fmtTime = (m) => `${Math.floor(m / 60)}h ${m % 60}m`;
const slotOf = (d) => {
  const h = d.getHours();
  if (h >= 5 && h < 12) return 0;
  if (h >= 12 && h < 17) return 1;
  if (h >= 17 && h < 21) return 2;
  return 3;
};

const getCard = () => ({
  backgroundColor: colors.card,
  borderRadius: 20,
  padding: 16,
  borderWidth: 1,
  borderColor: colors.border,
  marginTop: 16,
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

function GoalBar({ label, value, goal, unit }) {
  const pct = Math.min(100, Math.round((value / goal) * 100));
  return (
    <View style={{ marginTop: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>{label}</Text>
        <Text style={{ color: colors.muted, fontSize: 12 }}>
          {value} / {goal} {unit}
        </Text>
      </View>
      <View style={{ height: 8, backgroundColor: colors.surface, borderRadius: 4, marginTop: 8 }}>
        <View style={{ width: `${pct}%`, height: 8, backgroundColor: colors.primary, borderRadius: 4 }} />
      </View>
      <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700', marginTop: 4 }}>{pct}%</Text>
    </View>
  );
}

export default function ProgressScreen() {
  useTheme();
  const workouts = useSelector(selectWorkouts);
  const [range, setRange] = useState('day'); // 'day' | 'week' | 'month'
  const card = getCard();

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const inRange = (w) => {
    const d = dateOf(w);
    if (range === 'day') return sameDay(d, today);
    if (range === 'week') return d >= weekStart && d < weekEnd;
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  };
  const list = workouts.filter(inRange);

  let labels;
  let buckets;
  if (range === 'day') {
    labels = TIME_LABELS;
    buckets = [0, 0, 0, 0];
    list.forEach((w) => (buckets[slotOf(dateOf(w))] += w.duration));
  } else if (range === 'week') {
    labels = DAY_LETTERS;
    buckets = [0, 0, 0, 0, 0, 0, 0];
    list.forEach((w) => (buckets[dateOf(w).getDay()] += w.duration));
  } else {
    labels = ['W1', 'W2', 'W3', 'W4', 'W5'];
    buckets = [0, 0, 0, 0, 0];
    list.forEach((w) => (buckets[Math.min(4, Math.floor((dateOf(w).getDate() - 1) / 7))] += w.duration));
  }
  const maxVal = Math.max(...buckets, 1);

  const totalMins = list.reduce((a, w) => a + w.duration, 0);
  const totalKcal = list.reduce((a, w) => a + w.calories, 0);
  const avgMins = list.length ? Math.round(totalMins / list.length) : 0;

  const perDay = [0, 0, 0, 0, 0, 0, 0];
  list.forEach((w) => (perDay[dateOf(w).getDay()] += w.duration));
  const bestIdx = perDay.indexOf(Math.max(...perDay));
  const bestMins = perDay[bestIdx];

  const longest = list.reduce((a, w) => (!a || w.duration > a.duration ? w : a), null);

  const hasWorkoutOn = (d) => workouts.some((w) => sameDay(dateOf(w), d));
  let streak = 0;
  const cursor = new Date();
  if (!hasWorkoutOn(cursor)) cursor.setDate(cursor.getDate() - 1);
  while (hasWorkoutOn(cursor)) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const byName = {};
  list.forEach((w) => {
    byName[w.name] = (byName[w.name] || 0) + w.duration;
  });
  const top = Object.entries(byName).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const topMax = top.length ? top[0][1] : 1;

  const minGoal = range === 'day' ? 60 : range === 'week' ? 300 : 1200;
  const kcalGoal = range === 'day' ? 500 : range === 'week' ? 2000 : 8000;
  const unitLabel = range === 'day' ? 'time of day' : range === 'week' ? 'day' : 'week';

  const Seg = ({ id, label }) => {
    const active = range === id;
    return (
      <TouchableOpacity
        onPress={() => setRange(id)}
        style={{
          flex: 1,
          paddingVertical: 10,
          borderRadius: 10,
          alignItems: 'center',
          backgroundColor: active ? colors.primary : 'transparent',
        }}
      >
        <Text style={{ fontWeight: '800', color: active ? colors.dark : colors.muted }}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title="Progress" subtitle="Track how far you've come" />

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 4, paddingBottom: 120 }}>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 4,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Seg id="day" label="Today" />
          <Seg id="week" label="This Week" />
          <Seg id="month" label="This Month" />
        </View>

        <View style={card}>
          <View style={{ flexDirection: 'row' }}>
            <Stat icon="award" value={list.length} label="Workouts" />
            <Stat icon="clock" value={fmtTime(totalMins)} label="Total Time" />
            <Stat icon="zap" value={totalKcal} label="Calories" />
          </View>
          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 14 }} />
          <Text style={{ color: colors.muted, textAlign: 'center' }}>
            Average per workout: <Text style={{ color: colors.primary, fontWeight: '800' }}>{avgMins} min</Text>
          </Text>
        </View>

        {range === 'day' ? (
          <View style={card}>
            <Text style={{ color: colors.text, fontWeight: '800' }}>
              Today, {today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </Text>
            {list.length === 0 ? (
              <Text style={{ color: colors.muted, marginTop: 10 }}>No workouts today yet. Let's get moving!</Text>
            ) : (
              list.map((w) => (
                <View
                  key={w.id}
                  style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontWeight: '700' }}>{w.name}</Text>
                    <Text style={{ color: colors.muted, fontSize: 12 }}>
                      {dateOf(w).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </Text>
                  </View>
                  <Text style={{ color: colors.primary, fontWeight: '800' }}>
                    {w.duration} min • {w.calories} kcal
                  </Text>
                </View>
              ))
            )}
          </View>
        ) : null}

        <View style={card}>
          <Text style={{ color: colors.text, fontWeight: '800', marginBottom: 14 }}>Minutes per {unitLabel}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 140 }}>
            {buckets.map((m, i) => (
              <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: colors.muted, fontSize: 10, marginBottom: 4 }}>{m > 0 ? m : ''}</Text>
                <View
                  style={{
                    width: 22,
                    height: Math.max(6, (m / maxVal) * 100),
                    borderRadius: 6,
                    backgroundColor: m > 0 ? colors.primary : colors.surface,
                  }}
                />
                <Text style={{ color: colors.muted, fontSize: 10, marginTop: 6 }}>{labels[i]}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={card}>
          <Text style={{ color: colors.text, fontWeight: '800' }}>
            {range === 'day' ? 'Daily Goals' : range === 'week' ? 'Weekly Goals' : 'Monthly Goals'}
          </Text>
          <GoalBar label="Active minutes" value={totalMins} goal={minGoal} unit="min" />
          <GoalBar label="Calories burned" value={totalKcal} goal={kcalGoal} unit="kcal" />
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={[card, { flex: 1 }]}>
            <Text style={{ color: colors.muted, fontSize: 12 }}>{range === 'day' ? 'Longest Session' : 'Best Day'}</Text>
            <Text style={{ color: colors.text, fontWeight: '900', fontSize: 18, marginTop: 6 }} numberOfLines={1}>
              {range === 'day' ? (longest ? longest.name : '—') : bestMins > 0 ? DAY_NAMES[bestIdx] : '—'}
            </Text>
            <Text style={{ color: colors.primary, fontWeight: '700', marginTop: 2 }}>
              {range === 'day'
                ? longest
                  ? `${longest.duration} min`
                  : 'No data'
                : bestMins > 0
                ? fmtTime(bestMins)
                : 'No data'}
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

        <View style={card}>
          <Text style={{ color: colors.text, fontWeight: '800' }}>Top Workouts</Text>
          {top.length === 0 ? (
            <Text style={{ color: colors.muted, marginTop: 10 }}>No workouts in this period yet.</Text>
          ) : (
            top.map(([name, mins], i) => (
              <View key={name} style={{ marginTop: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.text, fontWeight: '700' }}>
                    {i + 1}. {name}
                  </Text>
                  <Text style={{ color: colors.muted }}>{mins} min</Text>
                </View>
                <View style={{ height: 6, backgroundColor: colors.surface, borderRadius: 3, marginTop: 6 }}>
                  <View
                    style={{
                      width: `${Math.round((mins / topMax) * 100)}%`,
                      height: 6,
                      backgroundColor: colors.primary,
                      borderRadius: 3,
                    }}
                  />
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}