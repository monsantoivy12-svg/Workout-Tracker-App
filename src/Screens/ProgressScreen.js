import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import ScreenHeader from '../components/ScreenHeader';
import { colors } from '../constants/theme';
import { useWorkouts } from '../context/WorkoutContext';

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
  marginTop: 16,
};

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
  const { workouts } = useWorkouts();
  const [range, setRange] = useState('week'); // 'week' | 'month'

  const today = new Date();

  // ---- filter by range ----
  const weekStart = new Date(today);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const inRange = (w) => {
    const d = dateOf(w);
    if (range === 'week') return d >= weekStart && d < weekEnd;
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  };
  const list = workouts.filter(inRange);

  // ---- chart buckets ----
  let labels;
  let buckets;
  if (range === 'week') {
    labels = DAY_LETTERS;
    buckets = [0, 0, 0, 0, 0, 0, 0];
    list.forEach((w) => (buckets[dateOf(w).getDay()] += w.duration));
  } else {
    labels = ['W1', 'W2', 'W3', 'W4', 'W5'];
    buckets = [0, 0, 0, 0, 0];
    list.forEach((w) => (buckets[Math.min(4, Math.floor((dateOf(w).getDate() - 1) / 7))] += w.duration));
  }
  const maxVal = Math.max(...buckets, 1);

  // ---- totals ----
  const totalMins = list.reduce((a, w) => a + w.duration, 0);
  const totalKcal = list.reduce((a, w) => a + w.calories, 0);
  const avgMins = list.length ? Math.round(totalMins / list.length) : 0;

  // ---- best day ----
  const perDay = [0, 0, 0, 0, 0, 0, 0];
  list.forEach((w) => (perDay[dateOf(w).getDay()] += w.duration));
  const bestIdx = perDay.indexOf(Math.max(...perDay));
  const bestMins = perDay[bestIdx];

  // ---- streak (all workouts) ----
  const hasWorkoutOn = (d) => workouts.some((w) => sameDay(dateOf(w), d));
  let streak = 0;
  const cursor = new Date();
  if (!hasWorkoutOn(cursor)) cursor.setDate(cursor.getDate() - 1);
  while (hasWorkoutOn(cursor)) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  // ---- top workouts by total minutes ----
  const byName = {};
  list.forEach((w) => {
    byName[w.name] = (byName[w.name] || 0) + w.duration;
  });
  const top = Object.entries(byName)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const topMax = top.length ? top[0][1] : 1;

  // goals (monthly = weekly x 4)
  const minGoal = range === 'week' ? 300 : 1200;
  const kcalGoal = range === 'week' ? 2000 : 8000;

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

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 4, paddingBottom: 32 }}>
        {/* This Week | This Month */}
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
          <Seg id="week" label="This Week" />
          <Seg id="month" label="This Month" />
        </View>

        {/* Totals */}
        <View style={card}>
          <View style={{ flexDirection: 'row' }}>
            <Stat icon="award" value={list.length} label="Workouts" />
            <Stat icon="clock" value={fmtTime(totalMins)} label="Total Time" />
            <Stat icon="zap" value={totalKcal} label="Calories" />
          </View>
          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 14 }} />
          <Text style={{ color: colors.muted, textAlign: 'center' }}>
            Average per workout:{' '}
            <Text style={{ color: colors.primary, fontWeight: '800' }}>{avgMins} min</Text>
          </Text>
        </View>

        {/* Chart */}
        <View style={card}>
          <Text style={{ color: colors.text, fontWeight: '800', marginBottom: 14 }}>
            Minutes per {range === 'week' ? 'day' : 'week'}
          </Text>
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
                <Text style={{ color: colors.muted, fontSize: 11, marginTop: 6 }}>{labels[i]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Goals */}
        <View style={card}>
          <Text style={{ color: colors.text, fontWeight: '800' }}>Goals</Text>
          <GoalBar label="Active minutes" value={totalMins} goal={minGoal} unit="min" />
          <GoalBar label="Calories burned" value={totalKcal} goal={kcalGoal} unit="kcal" />
        </View>

        {/* Best day + streak */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={[card, { flex: 1 }]}>
            <Text style={{ color: colors.muted, fontSize: 12 }}>Best Day</Text>
            <Text style={{ color: colors.text, fontWeight: '900', fontSize: 18, marginTop: 6 }}>
              {bestMins > 0 ? DAY_NAMES[bestIdx] : '—'}
            </Text>
            <Text style={{ color: colors.primary, fontWeight: '700', marginTop: 2 }}>
              {bestMins > 0 ? fmtTime(bestMins) : 'No data'}
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

        {/* Top workouts */}
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