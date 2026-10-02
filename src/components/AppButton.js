import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

// variant: 'primary' (purple) | 'secondary' (blue) | 'accent' (orange) | 'danger' | 'outline'
export default function AppButton({ title, onPress, variant = 'primary', style }) {
  const bg = {
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
    danger: colors.danger,
    outline: 'transparent',
  }[variant] || colors.primary;
  const txt = variant === 'outline' ? colors.primary : '#fff';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[s.btn, { backgroundColor: bg, borderColor: colors.primary, borderWidth: variant === 'outline' ? 2 : 0 }, style]}
    >
      <Text style={[s.text, { color: txt }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  btn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginVertical: 6 },
  text: { fontSize: 16, fontWeight: '700' },
});