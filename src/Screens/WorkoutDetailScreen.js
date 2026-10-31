import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';
import ScreenBackground from '../components/ScreenBackground';
import { colors } from '../constants/theme';
import { useWorkouts } from '../context/WorkoutContext';

// "Squats 4x10" -> { name: 'Squats', detail: '4 sets • 10 reps' }
const parseExercise = (text, i) => {
  const t = text.trim();
  const m = t.match(/^(.+?)\s+(\d+)x(\S+)/i);
  if (m) {
    const reps = m[3].toLowerCase().endsWith('s')
      ? `${m[3].slice(0, -1)} sec`
      : `${m[3]} reps`;
    return { name: m[1], detail: `${m[2]} sets • ${reps}` };
  }
  return { name: t, detail: `Exercise ${i + 1}` };
};

const levelOf = (w) => {
  if (w.level) return w.level;
  if (w.duration <= 20) return 'Easy';
  if (w.duration <= 45) return 'Moderate';
  return 'Hard';
};

const Chip = ({ icon, label }) => (
  <View
    style={{
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.border,
    }}
  >
    <Feather name={icon} size={15} color={colors.primary} />
    <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700', marginLeft: 6 }}>{label}</Text>
  </View>
);

function ExerciseRow({ index, item, image, done, onPress }) {
  const [failed, setFailed] = useState(false);
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: done ? colors.primary : colors.border,
      }}
    >
      <Text style={{ color: colors.text, fontWeight: '800', width: 24, textAlign: 'center' }}>{index + 1}</Text>
      {image && !failed ? (
        <Image
          source={{ uri: image }}
          style={{ width: 52, height: 52, borderRadius: 10, marginHorizontal: 10 }}
          onError={() => setFailed(true)}
        />
      ) : (
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 10,
            marginHorizontal: 10,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 22 }}>🏋️</Text>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{
            color: done ? colors.muted : colors.text,
            fontWeight: '800',
            fontSize: 15,
            textDecorationLine: done ? 'line-through' : 'none',
          }}
        >
          {item.name}
        </Text>
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{item.detail}</Text>
      </View>
      {done ? (
        <Feather name="check-circle" size={20} color={colors.primary} />
      ) : (
        <Feather name="chevron-right" size={20} color={colors.muted} />
      )}
    </TouchableOpacity>
  );
}

export default function WorkoutDetailScreen() {
  const params = useLocalSearchParams(); // dynamic route param from /workout/[id]
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { getWorkout, deleteWorkout } = useWorkouts();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // ---- ALL hooks must be above any early return ----
  const [imgFailed, setImgFailed] = useState(false);
  const [selected, setSelected] = useState(null); // index sa gi-tap nga exercise
  const [doneList, setDoneList] = useState([]); // mga index nga human na

  const w = getWorkout(id);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  const toggleDone = (i) =>
    setDoneList((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]));

  if (!w)
    return (
      <ScreenBackground>
        <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 16 }}>
          <Text style={{ marginVertical: 20, color: colors.text, fontSize: 16 }}>
            Workout not found (ID: {String(id)}).
          </Text>
          <AppButton title="← Back" onPress={goBack} />
        </View>
      </ScreenBackground>
    );

  const onDelete = () =>
    Alert.alert('Delete', `Delete "${w.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteWorkout(id);
          goBack();
        },
      },
    ]);

  const level = levelOf(w);
  const exercises = (w.notes || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map(parseExercise);

  const about =
    `A ${level.toLowerCase()} ${w.duration}-minute routine designed to burn around ` +
    `${w.calories} kcal. Stay consistent, keep good form and finish every set.`;

  return (
    <ScreenBackground>
      <ScrollView style={{ backgroundColor: 'transparent' }} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Top bar */}
        <View
          style={{
            paddingTop: insets.top + 8,
            paddingHorizontal: 16,
            paddingBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <TouchableOpacity onPress={goBack} style={{ width: 40, height: 40, justifyContent: 'center' }}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>Workout</Text>
          <TouchableOpacity
            onPress={() => router.push(`/edit/${w.id}`)}
            style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' }}
          >
            <Feather name="edit-2" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Hero image inside an elevated AppCard */}
        <AppCard
          style={{
            marginHorizontal: 16,
            marginBottom: 0,
            padding: 0,
            overflow: 'hidden',
            height: 240,
          }}
        >
          {w.image && !imgFailed ? (
            <Image
              source={{ uri: w.image }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }}>
              <Text style={{ fontSize: 64 }}>🏋️</Text>
            </View>
          )}
        </AppCard>

        <View style={{ paddingHorizontal: 20 }}>
          {/* Category + title + meta */}
          <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 12, marginTop: 16, letterSpacing: 0.5 }}>
            {(w.category || 'Workout').toUpperCase()}
          </Text>
          <Text style={{ color: colors.text, fontSize: 28, fontWeight: '900', marginTop: 4 }}>{w.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <Feather name="clock" size={15} color={colors.muted} />
            <Text style={{ color: colors.muted, marginLeft: 6 }}>{w.duration} min</Text>
            <Text style={{ color: colors.muted, marginHorizontal: 8 }}>•</Text>
            <Feather name="bar-chart-2" size={15} color={colors.muted} />
            <Text style={{ color: colors.muted, marginLeft: 6 }}>{level}</Text>
          </View>

          {/* Start workout */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => Alert.alert('Workout started', `Let's go! ${w.name} 💪`)}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 30,
              paddingVertical: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 20,
            }}
          >
            <Feather name="play" size={18} color={colors.dark} />
            <Text style={{ color: colors.dark, fontWeight: '900', fontSize: 16, marginLeft: 8 }}>
              Start Workout
            </Text>
          </TouchableOpacity>

          {/* About this workout */}
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: '800', marginTop: 24 }}>
            About This Workout
          </Text>
          <Text style={{ color: colors.muted, lineHeight: 21, marginTop: 8 }}>{about}</Text>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            <Chip icon="hash" label={`ID: ${w.id}`} />
            <Chip icon="zap" label={`${w.calories} kcal`} />
            <Chip icon="clock" label={`${w.duration} min`} />
          </View>

          {/* Workout plan */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 28,
              marginBottom: 12,
            }}
          >
            <Text style={{ color: colors.text, fontSize: 17, fontWeight: '800' }}>Workout Plan</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>
              {exercises.length} {exercises.length === 1 ? 'Exercise' : 'Exercises'}
            </Text>
          </View>

          {exercises.length === 0 ? (
            <Text style={{ color: colors.muted }}>No exercises listed. Edit this workout to add notes.</Text>
          ) : (
            exercises.map((ex, i) => (
              <ExerciseRow
                key={i}
                index={i}
                item={ex}
                image={w.image}
                done={doneList.includes(i)}
                onPress={() => setSelected(i)}
              />
            ))
          )}

          {/* Actions */}
          <AppButton title="Edit" variant="secondary" onPress={() => router.push(`/edit/${w.id}`)} style={{ marginTop: 12 }} />
          <AppButton title="Delete" variant="danger" onPress={onDelete} />
          <AppButton title="← Back" variant="outline" onPress={goBack} />
        </View>
      </ScrollView>

      {/* Exercise pop-up */}
      <Modal
        visible={selected !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setSelected(null)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
        >
          {selected !== null && exercises[selected] ? (
            <TouchableOpacity
              activeOpacity={1}
              style={{
                backgroundColor: colors.card,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                padding: 20,
                paddingBottom: insets.bottom + 20,
              }}
            >
              <View
                style={{
                  alignSelf: 'center',
                  width: 44,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: colors.border,
                  marginBottom: 16,
                }}
              />

              {w.image && !imgFailed ? (
                <Image
                  source={{ uri: w.image }}
                  style={{ width: '100%', height: 160, borderRadius: 16, marginBottom: 14 }}
                  resizeMode="cover"
                />
              ) : null}

              <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 12 }}>
                EXERCISE {selected + 1} OF {exercises.length}
              </Text>
              <Text style={{ color: colors.text, fontSize: 24, fontWeight: '900', marginTop: 4 }}>
                {exercises[selected].name}
              </Text>
              <Text style={{ color: colors.muted, marginTop: 4 }}>{exercises[selected].detail}</Text>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                <Chip icon="clock" label={`${w.duration} min`} />
                <Chip icon="zap" label={`${w.calories} kcal`} />
              </View>

              <AppButton
                title={doneList.includes(selected) ? 'Mark as not done' : '✓ Mark as done'}
                onPress={() => toggleDone(selected)}
                style={{ marginTop: 16 }}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <AppButton
                  title="← Previous"
                  variant="outline"
                  style={{ flex: 1, opacity: selected === 0 ? 0.4 : 1 }}
                  onPress={() => selected > 0 && setSelected(selected - 1)}
                />
                <AppButton
                  title="Next →"
                  variant="outline"
                  style={{ flex: 1, opacity: selected === exercises.length - 1 ? 0.4 : 1 }}
                  onPress={() => selected < exercises.length - 1 && setSelected(selected + 1)}
                />
              </View>

              <AppButton title="Close" variant="secondary" onPress={() => setSelected(null)} />
            </TouchableOpacity>
          ) : null}
        </TouchableOpacity>
      </Modal>
    </ScreenBackground>
  );
}