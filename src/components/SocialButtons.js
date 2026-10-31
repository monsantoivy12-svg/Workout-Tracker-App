import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

const SocialBtn = ({ icon, label }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={() => Alert.alert('Coming soon', `${label} is not available yet.`)}
    style={{
      backgroundColor: '#fff',
      borderRadius: 10,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    }}
  >
    <Ionicons name={icon} size={18} color="#111" />
    <Text style={{ marginLeft: 8, fontWeight: '700', color: '#111' }}>{label}</Text>
  </TouchableOpacity>
);

export default function SocialButtons() {
  return (
    <View style={{ marginTop: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        <Text style={{ color: colors.muted, marginHorizontal: 12 }}>Or</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      </View>
      <SocialBtn icon="logo-google" label="Continue with Google" />
      <SocialBtn icon="logo-apple" label="Continue with Apple" />
    </View>
  );
}