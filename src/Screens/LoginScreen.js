import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import AppMessage from '../components/AppMessage';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const { login } = useAuth();
  const router = useRouter();

  const onLogin = () => {
    const err = login(email.trim(), password);
    if (err) return setMessage({ type: 'error', text: err });
    router.replace('/(tabs)');
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.logoWrap}>
        <Logo size={1.2} />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Welcome back!</Text>
        <Text style={styles.subtitle}>Please login to your account.</Text>

        <AppMessage message={message} />

        <View style={styles.form}>
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
        </View>

        <View style={styles.actions}>
          <AppButton title="Login" onPress={onLogin} />
          <AppButton
            title="Create an account"
            variant="outline"
            onPress={() => router.push('/register')}
          />
        </View>
      </View>
    </ScrollView>
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
    // shadow (iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    // shadow (Android)
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