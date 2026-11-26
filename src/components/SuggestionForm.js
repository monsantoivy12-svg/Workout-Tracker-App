import { Feather } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/theme';
import {
  CATEGORIES,
  exSeconds,
  exerciseLibrary,
  getExercises,
  parseExerciseText,
} from '../data/exerciseLibrary';
import AppButton from './AppButton';
import AppInput from './AppInput';

const fmtSec = (s) => {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}:${String(r).padStart(2, '0')}` : `${r}s`;
};

// normalise anything (string / object) into { name, sets, seconds | reps }
const norm = (e) => {
  const x = typeof e === 'string' ? parseExerciseText(e) : e;
  return { name: x.name, sets: x.sets || 1, ...(x.reps && !x.seconds ? { reps: x.reps } : { seconds: x.seconds || 30 }) };
};

function Stepper({ value, onChange, min = 1, max = 999, step = 1, display }) {
  const btn = (icon, onPress, disabled) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.35 : 1,
      }}
    >
      <Feather name={icon} size={16} color={colors.text} />
    </TouchableOpacity>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {btn('minus', () => onChange(Math.max(min, value - step)), value <= min)}
      <Text style={{ color: colors.text, fontWeight: '800', minWidth: 54, textAlign: 'center' }}>
        {display ? display(value) : value}
      </Text>
      {btn('plus', () => onChange(Math.min(max, value + step)), value >= max)}
    </View>
  );
}

export default function WorkoutForm({ initial, submitLabel = 'Save Workout', onSubmit }) {
  const [name, setName] = useState(initial?.name || '');
  const [category, setCategory] = useState(initial?.category || 'Strength');
  const [items, setItems] = useState(() =>
    getExercises(initial)
      .filter((e) => !e.rest)
      .map(norm)
  );
  const [custom, setCustom] = useState('');
  const [rest, setRest] = useState(String(initial?.rest ?? 60));
  const [duration, setDuration] = useState(initial?.duration != null ? String(initial.duration) : '');
  const [calories, setCalories] = useState(initial?.calories != null ? String(initial.calories) : '');
  const [image, setImage] = useState(initial?.image || '');

  // auto-compute duration whenever sets / timers / rest change
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!items.length) return;
    const restSec = Number(rest) || 0;
    const work = items.reduce((a, e) => a + exSeconds(e), 0);
    const totalSets = items.reduce((a, e) => a + (e.sets || 1), 0);
    const total = work + restSec * Math.max(0, totalSets - 1);
    setDuration(String(Math.max(1, Math.round(total / 60))));
  }, [items, rest]);

  const has = (ex) => items.some((e) => e.name === ex.name);

  const toggle = (ex) =>
    setItems((list) => (has(ex) ? list.filter((e) => e.name !== ex.name) : [...list, norm(ex)]));

  const update = (i, patch) => setItems((list) => list.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));

  // switch between Timer and Reps
  const setMode = (i, mode) =>
    setItems((list) =>
      list.map((e, idx) => {
        if (idx !== i) return e;
        const { reps, seconds, ...base } = e;
        return mode === 'timer' ? { ...base, seconds: seconds || 30 } : { ...base, reps: reps || 10 };
      })
    );

  const addCustom = () => {
    const n = custom.trim();
    if (!n) return;
    setItems((list) => [...list, { name: n, sets: 3, seconds: 30 }]);
    setCustom('');
  };

  const submit = () => {
    if (!name.trim()) return Alert.alert('Missing info', 'Workout name is required.');
    if (!items.length) return Alert.alert('No exercises', 'Pick at least 1 exercise.');
    if (!(Number(duration) > 0)) return Alert.alert('Invalid duration', 'Duration must be greater than 0.');

    onSubmit({
      name: name.trim(),
      category,
      exercises: items,
      rest: Number(rest) || 0,
      duration: Number(duration),
      calories: Number(calories) || 0,
      image: image.trim(),
      notes: items
        .map((e) => (e.reps ? `${e.name} ${e.sets}x${e.reps}` : `${e.name} ${e.sets}x${e.seconds}s`))
        .join(', '),
    });
  };

  const label = (t) => (
    <Text style={{ color: colors.muted, fontSize: 13, fontWeight: '600', marginBottom: 6 }}>{t}</Text>
  );

  const pill = (text, active, onPress, key) => (
    <TouchableOpacity
      key={key ?? text}
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: active ? colors.primary : colors.surface,
      }}
    >
      <Text style={{ fontWeight: '800', color: active ? colors.dark : colors.muted }}>{text}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <AppInput
        label="Workout name"
        value={name}
        onChangeText={setName}
        placeholder="e.g. Morning Strength"
        autoCapitalize="sentences"
      />

      {label('Category')}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        {CATEGORIES.map((c) => pill(c, c === category, () => setCategory(c)))}
      </View>

      {label(`${category} exercises (tap to add)`)}
      {(exerciseLibrary[category] || []).map((ex) => {
        const on = has(ex);
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
          </TouchableOpacity>
        );
      })}

      {/* Custom exercise */}
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 4 }}>
        <View style={{ flex: 1 }}>
          <AppInput
            value={custom}
            onChangeText={setCustom}
            placeholder="Add your own exercise name"
            autoCapitalize="sentences"
          />
        </View>
        <TouchableOpacity
          onPress={addCustom}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 12,
            width: 48,
            height: 48,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Feather name="plus" size={22} color={colors.dark} />
        </TouchableOpacity>
      </View>

      {/* Selected exercises with sets + timer/reps */}
      {label(`Your exercises (${items.length})`)}
      {items.length === 0 ? (
        <Text style={{ color: colors.muted, marginBottom: 12 }}>No exercises yet. Tap one above.</Text>
      ) : (
        items.map((e, i) => {
          const timed = !e.reps;
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
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ color: colors.primary, fontWeight: '900', width: 24 }}>{i + 1}</Text>
                <Text style={{ color: colors.text, fontWeight: '800', fontSize: 15, flex: 1 }}>{e.name}</Text>
                <TouchableOpacity onPress={() => setItems((list) => list.filter((_, idx) => idx !== i))}>
                  <Feather name="trash-2" size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>

              {/* Sets */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.muted, fontWeight: '600' }}>Sets</Text>
                <Stepper value={e.sets} min={1} max={20} onChange={(v) => update(i, { sets: v })} />
              </View>

              {/* Timer or Reps */}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                {pill('Timer', timed, () => setMode(i, 'timer'), 't')}
                {pill('Reps', !timed, () => setMode(i, 'reps'), 'r')}
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 10,
                }}
              >
                <Text style={{ color: colors.muted, fontWeight: '600' }}>
                  {timed ? 'Timer per set' : 'Reps per set'}
                </Text>
                {timed ? (
                  <Stepper
                    value={e.seconds}
                    min={5}
                    max={3600}
                    step={5}
                    display={fmtSec}
                    onChange={(v) => update(i, { seconds: v })}
                  />
                ) : (
                  <Stepper value={e.reps} min={1} max={200} onChange={(v) => update(i, { reps: v })} />
                )}
              </View>
            </View>
          );
        })
      )}

      <View style={{ marginTop: 6 }}>
        <AppInput
          label="Rest between sets (seconds)"
          value={rest}
          onChangeText={setRest}
          keyboardType="numeric"
        />
        <AppInput
          label="Duration (minutes) - auto, editable"
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
        />
        <AppInput label="Calories burned" value={calories} onChangeText={setCalories} keyboardType="numeric" />
        <AppInput
          label="Image URL (optional)"
          value={image}
          onChangeText={setImage}
          placeholder="https://..."
          keyboardType="url"
        />
      </View>

      <AppButton title={submitLabel} onPress={submit} />
    </>
  );
}