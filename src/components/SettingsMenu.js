import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/theme';

// items: [{ icon, label, value?, onPress }]
export default function SettingsMenu({ items }) {
  return (
    <View>
      {items.map((it, i) => (
        <TouchableOpacity
          key={it.label}
          onPress={it.onPress}
          activeOpacity={0.8}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderRadius: 14,
            paddingVertical: 14,
            paddingHorizontal: 14,
            marginTop: i === 0 ? 0 : 10,
          }}
        >
          <Feather name={it.icon} size={18} color={colors.primary} />
          <Text style={{ color: colors.text, fontWeight: '700', marginLeft: 12, flex: 1 }}>{it.label}</Text>
          {it.value ? <Text style={{ color: colors.muted, fontSize: 12, marginRight: 8 }}>{it.value}</Text> : null}
          <Feather name="chevron-right" size={18} color={colors.muted} />
        </TouchableOpacity>
      ))}
    </View>
  );
}