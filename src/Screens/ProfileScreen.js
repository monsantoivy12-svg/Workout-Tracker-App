import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import AppCard from '../components/AppCard';
import AppButton from '../components/AppButton';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent', padding: 16 }}>
      <AppCard title={user?.name}>
        <Text style={{ color: colors.muted }}>{user?.email}</Text>
      </AppCard>
      <AppButton
        title="Logout"
        variant="danger"
        onPress={() => {
          logout();
          router.replace('/login');
        }}
      />
    </View>
  );
}