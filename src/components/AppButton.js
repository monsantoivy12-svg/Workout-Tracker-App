import { Text, TouchableOpacity } from 'react-native';
import { colors } from '../constants/theme';

// variant: 'primary' | 'secondary' | 'accent' | 'danger' | 'outline'
export default function AppButton({ title, onPress, variant = 'primary', style }) {
  const bg =
    {
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
      : variant === 'secondary'
      ? colors.text
      : '#fff';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        {
          paddingVertical: 14,
          borderRadius: 14,
          alignItems: 'center',
          marginVertical: 6,
          backgroundColor: bg,
          borderColor: colors.primary,
          borderWidth: variant === 'outline' ? 2 : 0,
        },
        style,
      ]}
    >
      <Text style={{ fontSize: 16, fontWeight: '800', letterSpacing: 0.5, color: txt }}>{title}</Text>
    </TouchableOpacity>
  );
}