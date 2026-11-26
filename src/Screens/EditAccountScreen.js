import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import AppMessage from '../components/AppMessage';
import AuthHeader from '../components/AuthHeader';
import ScreenBackground from '../components/ScreenBackground';
import { colors } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { changeUserPassword, selectUser, updateUserProfile, userPatched } from '../store/authSlice';

export default function EditAccountScreen() {
  useTheme();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const router = useRouter();

  const [name, setName] = useState(user?.name || '');
  const [showPw, setShowPw] = useState(false);
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [message, setMessage] = useState(null);

  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return setMessage({ type: 'error', text: 'Permission to access photos is required.' });
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
  };

  const onSave = () => {
    const err = dispatch(updateUserProfile({ name, username: user.username }));
    if (err) return setMessage({ type: 'error', text: err });

    if (showPw && (oldPw || newPw || confirmPw)) {
      if (newPw !== confirmPw) return setMessage({ type: 'error', text: 'New passwords do not match.' });
      const pwErr = dispatch(changeUserPassword(oldPw, newPw));
      if (pwErr) return setMessage({ type: 'error', text: pwErr });
    }
    router.back();
  };

  return (
    <ScreenBackground>
      <AuthHeader title="Edit account" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <AppMessage message={message} />

        <View style={{ alignItems: 'center', marginBottom: 20 }}>
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
                <Text style={{ fontSize: 36, fontWeight: '900', color: colors.dark }}>{initial}</Text>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={pickImage} style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center' }}>
            <Feather name="camera" size={14} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '800', marginLeft: 6 }}>Edit photo</Text>
          </TouchableOpacity>
        </View>

        <AppInput label="Full name" value={name} onChangeText={setName} autoCapitalize="words" />
        <AppInput label="Email" value={user?.email} editable={false} style={{ opacity: 0.6 }} />

        <TouchableOpacity
          onPress={() => setShowPw((s) => !s)}
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
        >
          <Text style={{ color: colors.primary, fontWeight: '800' }}>Change password</Text>
          <Feather
            name={showPw ? 'chevron-up' : 'chevron-right'}
            size={16}
            color={colors.primary}
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>

        {showPw ? (
          <>
            <AppInput placeholder="Current password" value={oldPw} onChangeText={setOldPw} secureTextEntry />
            <AppInput placeholder="New password (min 6)" value={newPw} onChangeText={setNewPw} secureTextEntry />
            <AppInput placeholder="Confirm new password" value={confirmPw} onChangeText={setConfirmPw} secureTextEntry />
          </>
        ) : null}

        <AppButton title="Save" onPress={onSave} style={{ marginTop: 12 }} />
      </ScrollView>
    </ScreenBackground>
  );
}