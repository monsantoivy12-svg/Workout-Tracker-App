import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppCard from '../components/AppCard';
import ScreenHeader from '../components/ScreenHeader';
import WorkoutForm from '../components/WorkoutForm';
import WorkoutItem from '../components/WorkoutItem';
import { colors } from '../constants/theme';
import { useWorkouts } from '../context/WorkoutContext';

const FILTERS = ['All', 'Short', 'Medium', 'Long'];

const matchFilter = (w, f) =>
  f === 'All' ||
  (f === 'Short' && w.duration <= 30) ||
  (f === 'Medium' && w.duration > 30 && w.duration <= 45) ||
  (f === 'Long' && w.duration > 45);

export default function WorkoutsScreen() {
  const { workouts, addWorkout } = useWorkouts();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [mode, setMode] = useState('list'); // 'list' | 'add'
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [formKey, setFormKey] = useState(0);

  // mo-open sa Add kung gikan sa + button sa Home
  useEffect(() => {
    if (params.tab === 'add') setMode('add');
  }, [params.tab]);

  const data = workouts.filter(
    (w) => matchFilter(w, filter) && w.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  const Segment = ({ id, label, icon }) => {
    const active = mode === id;
    return (
      <TouchableOpacity
        onPress={() => setMode(id)}
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 10,
          borderRadius: 10,
          backgroundColor: active ? colors.primary : 'transparent',
        }}
      >
        <Feather name={icon} size={16} color={active ? colors.dark : colors.muted} />
        <Text style={{ marginLeft: 6, fontWeight: '800', color: active ? colors.dark : colors.muted }}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader
        title="Workout"
        subtitle={mode === 'add' ? 'Log what you did today' : 'What workout do you want to do today?'}
      />

      {/* List | Add Workout */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 4,
          marginHorizontal: 16,
          marginTop: 12,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Segment id="list" label="My Workouts" icon="list" />
        <Segment id="add" label="Add Workout" icon="plus-circle" />
      </View>

      {mode === 'add' ? (
        <ScrollView
          style={{ backgroundColor: 'transparent' }}
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          <AppCard>
            <WorkoutForm
              key={formKey}
              submitLabel="Save Workout"
              onSubmit={(d) => {
                addWorkout(d);
                setFormKey((k) => k + 1); // i-reset ang form
                setMode('list');
                router.setParams({ tab: 'list' });
              }}
            />
          </AppCard>
        </ScrollView>
      ) : (
        <>
          {/* Search */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.card,
              borderRadius: 14,
              paddingHorizontal: 14,
              marginHorizontal: 16,
              marginTop: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Feather name="search" size={18} color={colors.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search workout..."
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              style={{ flex: 1, color: colors.text, padding: 12, fontSize: 15 }}
            />
          </View>

          {/* Filter chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0, marginVertical: 12 }}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          >
            {FILTERS.map((f) => {
              const active = f === filter;
              return (
                <TouchableOpacity
                  key={f}
                  onPress={() => setFilter(f)}
                  style={{
                    paddingHorizontal: 22,
                    paddingVertical: 10,
                    borderRadius: 10,
                    backgroundColor: active ? colors.primary : '#fff',
                  }}
                >
                  <Text style={{ fontWeight: '700', color: active ? colors.dark : colors.muted }}>{f}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* List: tap -> /workout/[id] */}
          <FlatList
            style={{ backgroundColor: 'transparent' }}
            contentContainerStyle={{ padding: 16, paddingTop: 4, paddingBottom: 24 }}
            data={data}
            keyExtractor={(w) => String(w.id)}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', color: colors.muted, marginTop: 24 }}>
                No workouts found.
              </Text>
            }
            renderItem={({ item }) => (
              <WorkoutItem workout={item} onPress={() => router.push(`/workout/${item.id}`)} />
            )}
          />
        </>
      )}
    </View>
  );
}