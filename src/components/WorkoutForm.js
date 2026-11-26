import { Feather } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/theme';
import { defaultImageFor } from '../data/categoryImages';
import {
  CATEGORIES,
  DEFAULT_REST,
  exDetail,
  exerciseLibrary,
  parseExerciseText,
  workoutMinutes,
} from '../data/exerciseLibrary';
import { defaultVideoFor } from '../data/localVideos';
import AppButton from './AppButton';
import AppInput from './AppInput';
import AppVideoPicker from './AppVideoPicker';

const fmtSec = (s) => {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}:${String(r).padStart(2, '0')}` : `${r}s`;
};

// - [value] + control with solid orange buttons
function Stepper({ value, onMinus, onPlus, display }) {
  const btn = (icon, onPress) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Feather name={icon} size={20} color={colors.dark} />
    </TouchableOpacity>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {btn('minus', onMinus)}
      <Text style={{ color: colors.text, fontWeight: '900', fontSize: 16, minWidth: 60, textAlign: 'center' }}>
        {display ? display(value) : value}
      </Text>
      {btn('plus', onPlus)}
    </View>
  );
}

export default function WorkoutForm({ initial = {}, submitLabel, onSubmit }) {
  const [name, setName] = useState(initial.name || '');
  const [category, setCategory] = useState(initial.category || 'Strength');
  const [exercises, setExercises] = useState(initial.exercises || []);
  const [rest, setRest] = useState(initial.rest != null ? String(initial.rest) : String(DEFAULT_REST));
  const [duration, setDuration] = useState(initial.duration != null ? String(initial.duration) : '');
  const [calories, setCalories] = useState(initial.calories != null ? String(initial.calories) : '');
  const [notes, setNotes] = useState(initial.notes || '');
  const [video, setVideo] = useState(initial.video || '');
  const [custom, setCustom] = useState('');

  // auto-compute duration when exercises/rest change (not on first load)
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!exercises.length) return;
    setDuration(String(workoutMinutes(exercises, Number(rest) || 0)));
  }, [exercises, rest]);

  const has = (n) => exercises.some((e) => e.name === n);
  const toggle = (ex) =>
    setExercises((list) => (has(ex.name) ? list.filter((e) => e.name !== ex.name) : [...list, { ...ex }]));
  const removeAt = (i) => setExercises((list) => list.filter((_, idx) => idx !== i));

  const updateEx = (i, fn) =>
    setExercises((list) => list.map((e, idx) => (idx === i ? fn({ ...e }) : e)));

  const changeSets = (i, d) =>
    updateEx(i, (e) => {
      e.sets = Math.max(1, Math.min(20, (e.sets || 1) + d));
      return e;
    });

  const changeReps = (i, d) =>
    updateEx(i, (e) => {
      e.reps = Math.max(1, Math.min(200, (e.reps || 10) + d));
      return e;
    });

  const changeSeconds = (i, d) =>
    updateEx(i, (e) => {
      e.seconds = Math.max(5, Math.min(3600, (e.seconds || 30) + d));
      return e;
    });

  // switch between reps and timer
  const setMode = (i, mode) =>
    updateEx(i, (e) => {
      if (mode === 'reps') {
        e.reps = e.reps || 10;
        delete e.seconds;
      } else {
        e.seconds = e.seconds || 30;
        delete e.reps;
      }
      return e;
    });

  const pickCategory = (c) => {
    if (c === category) return;
    setCategory(c);
    setExercises([]); // each category has its own exercises
  };

  const addCustom = () => {
    if (!custom.trim()) return;
    const ex = parseExerciseText(custom);
    if (!has(ex.name)) setExercises((list) => [...list, ex]);
    setCustom('');
  };

  const submit = () => {
    if (!name.trim() || !duration.trim())
      return Alert.alert('Missing info', 'Name and duration are required.');
    if (!(Number(duration) > 0))
      return Alert.alert('Invalid duration', 'Duration must be a number greater than 0.');
    if (!exercises.length)
      return Alert.alert('No exercises', 'Pick at least 1 exercise for this workout.');

    const image =
      initial.image && category === initial.category ? initial.image : defaultImageFor(category);

    onSubmit({
      name: name.trim(),
      category,
      exercises,
      rest: Number(rest) || 0,
      duration: Number(duration),
      calories: Number(calories) || 0,
      notes,
      image,
      video: video || defaultVideoFor(category),
    });
  };

  const label = (t) => (
    <Text style={{ color: colors.muted, fontSize: 13, fontWeight: '600', marginBottom: 6 }}>{t}</Text>
  );

  const modeChip = (text, active, onPress) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 18,
        paddingVertical: 9,
        borderRadius: 10,
        backgroundColor: active ? colors.primary : colors.surface,
      }}
    >
      <Text style={{ fontWeight: '800', color: active ? colors.dark : colors.muted }}>{text}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <AppInput label="Workout name" value={name} onChangeText={setName} placeholder="e.g. Push Day" autoCapitalize="sentences" />

      {/* Category */}
      {label('Category')}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        {CATEGORIES.map((c) => {
          const active = c === category;
          return (
            <TouchableOpacity
              key={c}
              onPress={() => pickCategory(c)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 9,
                borderRadius: 10,
                backgroundColor: active ? colors.primary : colors.surface,
              }}
            >
              <Text style={{ fontWeight: '800', color: active ? colors.dark : colors.muted }}>{c}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Exercises for the category */}
      {label(`${category} exercises (tap to add)`)}
      {exerciseLibrary[category].map((ex) => {
        const on = has(ex.name);
        return (
          <TouchableOpacity
            key={ex.name}
            onPress={() => toggle(ex)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 12,
              borderRadius: 12,
              marginBottom: 8,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: on ? colors.primary : colors.border,
            }}
          >
            <Feather name={on ? 'check-circle' : 'circle'} size={18} color={on ? colors.primary : colors.muted} />
            <Text style={{ color: colors.text, fontWeight: '700', marginLeft: 10, flex: 1 }}>{ex.name}</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>{exDetail(ex)}</Text>
          </TouchableOpacity>
        );
      })}

      {/* Custom exercise */}
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 4 }}>
        <View style={{ flex: 1 }}>
          <AppInput value={custom} onChangeText={setCustom} placeholder="Custom: e.g. Lunges 3x12 or just a name" autoCapitalize="sentences" />
        </View>
        <TouchableOpacity
          onPress={addCustom}
          style={{ backgroundColor: colors.primary, borderRadius: 12, width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}
        >
          <Feather name="plus" size={22} color={colors.dark} />
        </TouchableOpacity>
      </View>

      {/* Your exercises: one card each */}
      {label(`Your exercises (${exercises.length})`)}
      {exercises.length === 0 ? (
        <Text style={{ color: colors.muted, marginBottom: 12 }}>No exercises yet. Tap one above.</Text>
      ) : (
        exercises.map((e, i) => {
          const timed = !!e.seconds;
          return (
            <View
              key={`${e.name}-${i}`}
              style={{
                padding: 12,
                borderRadius: 14,
                marginBottom: 10,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              {/* Title + delete */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ color: colors.primary, fontWeight: '900', width: 24 }}>{i + 1}</Text>
                <Text style={{ color: colors.text, fontWeight: '800', fontSize: 15, flex: 1 }}>{e.name}</Text>
                <TouchableOpacity onPress={() => removeAt(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Feather name="trash-2" size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>

              {/* Sets */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.muted, fontWeight: '600' }}>Sets</Text>
                <Stepper value={e.sets || 1} onMinus={() => changeSets(i, -1)} onPlus={() => changeSets(i, 1)} />
              </View>

              {/* Timer / Reps */}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                {modeChip('Timer', timed, () => setMode(i, 'time'))}
                {modeChip('Reps', !timed, () => setMode(i, 'reps'))}
              </View>

              {/* Reps per set / Timer per set */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 12,
                }}
              >
                <Text style={{ color: colors.muted, fontWeight: '600' }}>
                  {timed ? 'Timer per set' : 'Reps per set'}
                </Text>
                {timed ? (
                  <Stepper
                    value={e.seconds}
                    display={fmtSec}
                    onMinus={() => changeSeconds(i, -5)}
                    onPlus={() => changeSeconds(i, 5)}
                  />
                ) : (
                  <Stepper
                    value={e.reps || 10}
                    onMinus={() => changeReps(i, -1)}
                    onPlus={() => changeReps(i, 1)}
                  />
                )}
              </View>
            </View>
          );
        })
      )}

      {/* Rest, duration, etc. */}
      <View style={{ marginTop: 10 }}>
        <AppInput label="Rest between sets (sec)" value={rest} onChangeText={setRest} keyboardType="numeric" />
        <AppInput label="Duration (minutes) - auto from exercises, editable" value={duration} onChangeText={setDuration} keyboardType="numeric" />
        <AppInput label="Calories burned" value={calories} onChangeText={setCalories} keyboardType="numeric" />
        <AppVideoPicker value={video} onChange={setVideo} />
        <AppInput label="Notes" value={notes} onChangeText={setNotes} multiline autoCapitalize="sentences" />
      </View>

      <AppButton title={submitLabel} onPress={submit} />
    </>
  );
}