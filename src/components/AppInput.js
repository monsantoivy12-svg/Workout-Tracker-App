import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

export default function AppInput({ label, value, onChangeText, ...rest }) {
  return (
    <View style={{ marginBottom: 12 }}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <TextInput
        style={s.input}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        {...rest}
      />
    </View>
  );
}

const s = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: colors.muted, marginBottom: 4 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 12,
    padding: 12, fontSize: 16, color: colors.text,
  },
});