import { View, Text } from 'react-native';
import { colors } from '../constants/theme';

// Simple dumbbell logo built from Views (matches assets/logo.svg)
export default function Logo({ size = 1 }) {
  const bar = (w, h) => ({ width: w * size, height: h * size, borderRadius: 6 * size });
  return (
    <View style={{ alignItems: 'center', marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={[bar(12, 36), { backgroundColor: '#fff' }]} />
        <View style={[bar(16, 56), { backgroundColor: colors.accent, marginHorizontal: 2 }]} />
        <View style={[bar(60, 12), { backgroundColor: '#fff' }]} />
        <View style={[bar(16, 56), { backgroundColor: colors.accent, marginHorizontal: 2 }]} />
        <View style={[bar(12, 36), { backgroundColor: '#fff' }]} />
      </View>
      <Text style={{ color: '#fff', fontSize: 28 * size, fontWeight: '900', marginTop: 8 }}>
        123Go <Text style={{ color: colors.accent }}>FitTrack</Text>
      </Text>
    </View>
  );
}