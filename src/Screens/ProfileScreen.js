import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';
import ScreenHeader from '../components/ScreenHeader';
import { colors } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useWorkouts } from '../context/WorkoutContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { workouts } = useWorkouts();
  const router = useRouter();
  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title="Account" subtitle="Manage your profile" />

      <View style={{ padding: 16 }}>
        <AppCard>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 26, fontWeight: '900', color: colors.dark }}>{initial}</Text>
            </View>
            <View style={{ marginLeft: 14, flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>{user?.name}</Text>
              <Text style={{ color: colors.muted, marginTop: 2 }}>{user?.email}</Text>
            </View>
          </View>
        </AppCard>

        <AppCard title="Your Stats">
          <Text style={{ color: colors.muted }}>
            Total workouts:{' '}
            <Text style={{ color: colors.primary, fontWeight: '800' }}>{workouts.length}</Text>
          </Text>
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
    </View>
  );
}