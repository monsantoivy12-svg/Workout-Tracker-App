import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import AppMessage from '../components/AppMessage';
import Logo from '../components/Logo';
import ScreenBackground from '../components/ScreenBackground';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState(null);
  const { register } = useAuth();
  const router = useRouter();

  const onRegister = () => {
    if (password !== confirm) {
      return setMessage({ type: 'error', text: 'Passwords do not match.' });
    }
    const err = register(name.trim(), email.trim(), password);
    if (err) return setMessage({ type: 'error', text: err });

    setMessage({ type: 'success', text: 'Account created! Going to login...' });
    setTimeout(() => router.replace('/login'), 1200);
  };

  return (
    <ScreenBackground>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoWrap}>
          <Logo />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to start tracking your workouts.</Text>

          <AppMessage message={message} />

          <View style={styles.form}>
            <AppInput
              label="Full name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <AppInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <AppInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <AppInput
              label="Confirm password"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
            />
          </View>

          <View style={styles.actions}>
            <AppButton title="Register" onPress={onRegister} />
            <AppButton
              title="Back to login"
              variant="outline"
              onPress={() => router.replace('/login')}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: 'transparent',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#1E1E20',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3A3A3D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  form: {
    gap: 12,
    marginTop: 8,
  },
  actions: {
    gap: 12,
    marginTop: 20,
  },
});