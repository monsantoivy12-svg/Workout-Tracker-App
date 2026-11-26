import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/theme';
import { localVideos } from '../data/localVideos';

export default function AppVideoPicker({ value, onChange }) {
  const entries = Object.entries(localVideos);
  if (!entries.length) return null;
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: colors.muted, fontSize: 13, fontWeight: '600', marginBottom: 6 }}>
        Workout video (optional, auto-picked if empty)
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {entries.map(([key, v]) => {
          const active = value === `asset:${key}`;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => onChange(active ? '' : `asset:${key}`)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 14,
                paddingVertical: 9,
                borderRadius: 10,
                backgroundColor: active ? colors.primary : colors.surface,
              }}
            >
              <Feather name="film" size={14} color={active ? colors.dark : colors.muted} />
              <Text style={{ marginLeft: 6, fontWeight: '800', color: active ? colors.dark : colors.muted }}>
                {v.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}