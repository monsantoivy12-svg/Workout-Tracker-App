import { Text, View } from 'react-native';
import { colors } from '../constants/theme';

export default function AppCard({ title, children, style }) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: 20,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.border,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
        },
        style,
      ]}
    >
      {title ? (
        <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 8 }}>{title}</Text>
      ) : null}
      {children}
    </View>
  );
}