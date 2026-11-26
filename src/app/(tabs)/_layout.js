import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { colors } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { selectIsAdmin } from '../../store/authSlice';

const icon = (active, inactive) => ({ focused, color }) => (
  <View
    style={{
      width: 52,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: focused ? colors.primary + '26' : 'transparent',
    }}
  >
    <Ionicons name={focused ? active : inactive} size={22} color={color} />
  </View>
);

const hidden = { href: null };

export default function TabsLayout() {
  useTheme();
  const insets = useSafeAreaInsets();
  const isAdmin = useSelector(selectIsAdmin);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginBottom: 6 },
        tabBarItemStyle: { paddingTop: 6 },
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: insets.bottom + 10,
          height: 68,
          borderRadius: 26,
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderWidth: 1,
          borderColor: colors.border,
          elevation: 14,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35,
          shadowRadius: 14,
        },
      }}
    >
      {/* User tabs (tagoan sa admin) */}
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: icon('home', 'home-outline'), ...(isAdmin ? hidden : {}) }}
      />
      <Tabs.Screen
        name="workouts"
        options={{ title: 'Workouts', tabBarIcon: icon('barbell', 'barbell-outline'), ...(isAdmin ? hidden : {}) }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: icon('stats-chart', 'stats-chart-outline'),
          ...(isAdmin ? hidden : {}),
        }}
      />

      {/* Admin tab (tagoan sa regular users) */}
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          tabBarIcon: icon('shield-checkmark', 'shield-checkmark-outline'),
          ...(isAdmin ? {} : hidden),
        }}
      />

      <Tabs.Screen name="profile" options={{ title: 'Account', tabBarIcon: icon('person', 'person-outline') }} />
    </Tabs>
  );
}