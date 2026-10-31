import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';

export default function AuthHeader({ title, onBack }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: insets.top + 12,
        paddingBottom: 12,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <TouchableOpacity
        onPress={onBack}
        style={{
          position: 'absolute',
          left: 20,
          bottom: 8,
          width: 34,
          height: 34,
          borderRadius: 17,
          borderWidth: 1,
          borderColor: colors.muted,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="chevron-back" size={18} color={colors.text} />
      </TouchableOpacity>
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>{title}</Text>
    </View>
  );
}