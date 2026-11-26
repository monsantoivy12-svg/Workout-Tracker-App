import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';
import AppMessage from '../components/AppMessage';
import CalendarModal from '../components/CalendarModal';
import ScreenHeader from '../components/ScreenHeader';
import SettingsMenu from '../components/SettingsMenu';
import { colors } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { loggedOut, selectUser, userPatched } from '../store/authSlice';
import { selectWorkouts } from '../store/workoutsSlice';

const THEME_OPTIONS = [
  { id: 'system', label: 'System', icon: 'smartphone', desc: "Follow your phone's setting" },
  { id: 'light', label: 'Light', icon: 'sun', desc: 'Always use light mode' },
  { id: 'dark', label: 'Dark', icon: 'moon', desc: 'Always use dark mode' },
];

export default function ProfileScreen() {
  const { mode, preference, setPreference } = useTheme();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const workouts = useSelector(selectWorkouts);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [message, setMessage] = useState(null);
  const [calOpen, setCalOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  useEffect(() => {
    setMessage(null);
  }, [user?.email]);

  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';

  const hasWorkoutOn = (d) =>
    workouts.some((w) => (w.date ? new Date(w.date) : new Date()).toDateString() === d.toDateString());

  const rem = user?.reminder;
  const reminderText = rem?.enabled
    ? `${rem.hour}:${String(rem.minute).padStart(2, '0')} ${rem.ampm}`
    : 'Off';

  const currentTheme = THEME_OPTIONS.find((o) => o.id === preference) || THEME_OPTIONS[0];

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      return setMessage({ type: 'error', text: 'Permission to access photos is required.' });
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (res.canceled) return;
    const a = res.assets[0];
    dispatch(userPatched({ avatar: a.base64 ? `data:image/jpeg;base64,${a.base64}` : a.uri }));
    setMessage({ type: 'success', text: 'Profile picture updated!' });
  };

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title="Account" subtitle="Manage your profile" />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        <AppMessage message={message} />

        <AppCard>
          <View style={{ alignItems: 'center', paddingVertical: 8 }}>
            <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
              <View
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {user?.avatar ? (
                  <Image source={{ uri: user.avatar }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <Text style={{ fontSize: 38, fontWeight: '900', color: colors.dark }}>{initial}</Text>
                )}
              </View>
              <View
                style={{
                  position: 'absolute',
                  right: 0,
                  bottom: 0,
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: colors.dark,
                  borderWidth: 2,
                  borderColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Feather name="camera" size={14} color={colors.primary} />
              </View>
            </TouchableOpacity>

            <Text style={{ color: colors.text, fontSize: 22, fontWeight: '900', marginTop: 14, textAlign: 'center' }}>
              {user?.name}
            </Text>
            <Text style={{ color: colors.muted, marginTop: 2, textAlign: 'center' }}>{user?.email}</Text>
          </View>
        </AppCard>

        {/* Appearance: row ra, i-tap aron mo-pili */}
        <AppCard>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setThemeOpen(true)}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                backgroundColor: colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Feather name="moon" size={18} color={colors.primary} />
            </View>
            <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16, marginLeft: 12, flex: 1 }}>
              Appearance
            </Text>
            <Text style={{ color: colors.muted, marginRight: 6 }}>{currentTheme.label}</Text>
            <Feather name="chevron-right" size={20} color={colors.muted} />
          </TouchableOpacity>
        </AppCard>

        <AppCard title="Your Stats">
          <Text style={{ color: colors.muted }}>
            Total workouts: <Text style={{ color: colors.primary, fontWeight: '800' }}>{workouts.length}</Text>
          </Text>
        </AppCard>

        <AppCard title="Settings">
          <SettingsMenu
            items={[
              { icon: 'user', label: 'Edit account', onPress: () => router.push('/edit-account') },
              { icon: 'calendar', label: 'Calendar', onPress: () => setCalOpen(true) },
              { icon: 'bell', label: 'Reminder', value: reminderText, onPress: () => router.push('/reminder') },
              {
                icon: 'star',
                label: 'Rate us on App store',
                onPress: () => Alert.alert('Coming soon', 'Rating is not available yet.'),
              },
              {
                icon: 'file-text',
                label: 'Terms & Conditions',
                onPress: () =>
                  Alert.alert(
                    'Terms & Conditions',
                    'By using 123Go FitTrack you agree to use the app responsibly and consult a professional before starting any new workout program.'
                  ),
              },
            ]}
          />
        </AppCard>

        <AppButton
          title="Logout"
          variant="danger"
          onPress={() => {
            dispatch(loggedOut());
            router.replace('/welcome');
          }}
        />
      </ScrollView>

      {/* Appearance pop-up: System / Light / Dark */}
      <Modal visible={themeOpen} transparent animationType="slide" onRequestClose={() => setThemeOpen(false)}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setThemeOpen(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{
              backgroundColor: colors.card,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 20,
              paddingBottom: insets.bottom + 20,
            }}
          >
            <View
              style={{
                alignSelf: 'center',
                width: 44,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.border,
                marginBottom: 16,
              }}
            />
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '900' }}>Appearance</Text>
            <Text style={{ color: colors.muted, marginTop: 4, marginBottom: 16 }}>
              Choose how 123Go FitTrack looks.
            </Text>

            {THEME_OPTIONS.map((o) => {
              const active = preference === o.id;
              return (
                <TouchableOpacity
                  key={o.id}
                  activeOpacity={0.8}
                  onPress={() => {
                    setPreference(o.id);
                    setThemeOpen(false);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 14,
                    borderRadius: 14,
                    marginBottom: 10,
                    backgroundColor: colors.surface,
                    borderWidth: 1.5,
                    borderColor: active ? colors.primary : colors.border,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: active ? colors.primary : colors.card,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Feather name={o.icon} size={19} color={active ? colors.dark : colors.muted} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>{o.label}</Text>
                    <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
                      {o.id === 'system' ? `${o.desc} (now ${mode})` : o.desc}
                    </Text>
                  </View>
                  {active ? <Feather name="check-circle" size={22} color={colors.primary} /> : null}
                </TouchableOpacity>
              );
            })}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <CalendarModal
        visible={calOpen}
        selected={new Date()}
        hasWorkoutOn={hasWorkoutOn}
        onSelect={() => setCalOpen(false)}
        onClose={() => setCalOpen(false)}
      />
    </View>
  );
}