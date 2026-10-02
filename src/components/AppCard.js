import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

// "children" lets any content be nested inside the card
export default function AppCard({ title, children, style }) {
  return (
    <View style={[s.card, style]}>
      {title ? <Text style={s.title}>{title}</Text> : null}
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  title: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 8 },
});