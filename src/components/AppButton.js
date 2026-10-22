import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors } from '../constants/theme';

// variant: 'primary' (orange) | 'secondary' (dark grey) | 'accent' | 'danger' | 'outline'
export default function AppButton({ title, onPress, variant = 'primary', style }) {
  const bg = {
    primary: colors.primary,
    secondary: colors.surface,
    accent: colors.accent,
    danger: colors.danger,
    outline: 'transparent',
  }[variant] || colors.primary;

  const txt =
    variant === 'outline'
      ? colors.primary
      : variant === 'primary' || variant === 'accent'
      ? colors.dark
      : '#fff';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.btn,
        { backgroundColor: bg, borderColor: colors.primary, borderWidth: variant === 'outline' ? 2 : 0 },
        style,
      ]}
    >
      <Text style={[styles.text, { color: txt }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginVertical: 6,
  },
  text: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});