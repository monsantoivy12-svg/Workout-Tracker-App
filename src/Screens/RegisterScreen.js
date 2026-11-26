import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import AppMessage from '../components/AppMessage';
import AuthHeader from '../components/AuthHeader';
import ScreenBackground from '../components/ScreenBackground';
import SocialButtons from '../components/SocialButtons';
import { colors } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { registerUser } from '../store/authSlice';

const makeStyles = () =>
  StyleSheet.create({
    content: { padding: 24, paddingBottom: 40 },
    title: { color: colors.text, fontSize: 22, fontWeight: '800', textAlign: 'center', marginTop: 12 },
    subtitle: { color: colors.muted, fontSize: 13, textAlign: 'center', marginTop: 4, marginBottom: 24 },
    small: { color: colors.muted, fontSize: 12 },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  });

export default function RegisterScreen() {
  useTheme();
  const styles = makeStyles();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState(null);
  const dispatch = useDispatch();
  const router = useRouter();

  const onRegister = () => {
    if (password !== confirm) {
      return setMessage({ type: 'error', text: 'Passwords do not match.' });
    }
    const err = dispatch(registerUser(name.trim(), email.trim(), password));
    if (err) return setMessage({ type: 'error', text: err });

    setMessage({ type: 'success', text: 'Account created! Going to login...' });
    setTimeout(() => router.replace('/login'), 1200);
  };

  return (
    <ScreenBackground>
      <AuthHeader title="Sign Up" onBack={() => router.replace('/welcome')} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to start tracking your workouts</Text>

        <AppMessage message={message} />

        <AppInput placeholder="Full name" value={name} onChangeText={setName} autoCapitalize="words" />
        <AppInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <AppInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <AppInput
          placeholder="Confirm password"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
        />

        <AppButton title="Register" onPress={onRegister} style={{ marginTop: 12 }} />

        <SocialButtons />

        <View style={styles.footer}>
          <Text style={styles.small}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/login')}>
            <Text style={[styles.small, { color: colors.primary, fontWeight: '800' }]}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}