import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AppButton from '../components/AppButton';
import AuthHeader from '../components/AuthHeader';
import ScreenBackground from '../components/ScreenBackground';
import { colors } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { selectUser, userPatched } from '../store/authSlice';

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const AMPM = ['AM', 'PM'];

// 0 = Sunday ... 6 = Saturday
const DAYS = [
  { label: 'Mon', v: 1 },
  { label: 'Tue', v: 2 },
  { label: 'Wed', v: 3 },
  { label: 'Thu', v: 4 },
  { label: 'Fri', v: 5 },
  { label: 'Sat', v: 6 },
  { label: 'Sun', v: 0 },
];
const PRESETS = [
  { label: 'Everyday', days: [0, 1, 2, 3, 4, 5, 6] },
  { label: 'Mon - Fri', days: [1, 2, 3, 4, 5] },
  { label: 'Weekends', days: [0, 6] },
];

const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));

function Wheel({ items, index, onChange }) {
  const n = items.length;
  const at = (i) => items[(i + n) % n];
  const arrow = (name, d) => (
    <TouchableOpacity onPress={() => onChange((index + d + n) % n)} style={{ padding: 6 }}>
      <Feather name={name} size={20} color={colors.muted} />
    </TouchableOpacity>
  );
  return (
    <View style={{ alignItems: 'center', width: 80 }}>
      {arrow('chevron-up', -1)}
      <Text style={{ color: colors.muted, fontSize: 18, opacity: 0.5, height: 28 }}>
        {n > 2 || index === 1 ? at(index - 1) : ''}
      </Text>
      <Text style={{ color: colors.primary, fontSize: 36, fontWeight: '900', height: 48 }}>{items[index]}</Text>
      <Text style={{ color: colors.muted, fontSize: 18, opacity: 0.5, height: 28 }}>
        {n > 2 || index === 0 ? at(index + 1) : ''}
      </Text>
      {arrow('chevron-down', 1)}
    </View>
  );
}

export default function ReminderScreen() {
  useTheme();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const router = useRouter();
  const r = user?.reminder;

  const [enabled, setEnabled] = useState(r?.enabled ?? true);
  const [h, setH] = useState(r ? HOURS.indexOf(String(r.hour)) : 7);
  const [m, setM] = useState(r ? r.minute : 0);
  const [ap, setAp] = useState(r ? AMPM.indexOf(r.ampm) : 1);
  const [days, setDays] = useState(r?.days || [0, 1, 2, 3, 4, 5, 6]);

  const toggleDay = (v) => setDays((d) => (d.includes(v) ? d.filter((x) => x !== v) : [...d, v]));

  const chip = (label, active, onPress) => (
    <TouchableOpacity
      key={label}
      onPress={onPress}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 20,
        backgroundColor: active ? colors.primary : colors.surface,
        marginRight: 8,
        marginBottom: 10,
      }}
    >
      <Text style={{ fontWeight: '800', color: active ? colors.dark : colors.muted }}>{label}</Text>
    </TouchableOpacity>
  );

  const onSave = () => {
    dispatch(
      userPatched({
        reminder: { enabled, hour: Number(HOURS[h]), minute: m, ampm: AMPM[ap], days },
      })
    );
    router.back();
  };

  return (
    <ScreenBackground>
      <AuthHeader title="Reminder" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>Workout reminder</Text>
          <Switch
            value={enabled}
            onValueChange={setEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#fff"
          />
        </View>

        <Text style={{ color: colors.muted, marginTop: 20 }}>Please select reminder time</Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 10,
            opacity: enabled ? 1 : 0.4,
          }}
          pointerEvents={enabled ? 'auto' : 'none'}
        >
          <Wheel items={HOURS} index={h} onChange={setH} />
          <Wheel items={MINUTES} index={m} onChange={setM} />
          <Wheel items={AMPM} index={ap} onChange={setAp} />
        </View>

        <Text style={{ color: colors.text, fontWeight: '800', marginTop: 24, marginBottom: 12 }}>
          How often repeat
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {PRESETS.map((p) => chip(p.label, sameSet(days, p.days), () => setDays(p.days)))}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {DAYS.map((d) => chip(d.label, days.includes(d.v), () => toggleDay(d.v)))}
        </View>

        <AppButton title="Save" onPress={onSave} style={{ marginTop: 24 }} />
      </ScrollView>
    </ScreenBackground>
  );
}