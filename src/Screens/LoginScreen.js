import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import AppMessage from '../components/AppMessage';
import AuthHeader from '../components/AuthHeader';
import ScreenBackground from '../components/ScreenBackground';
import SocialButtons from '../components/SocialButtons';
import { colors } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState(null);
  const { login } = useAuth();
  const router = useRouter();

  const onLogin = () => {
    const err = login(email.trim(), password);
    if (err) return setMessage({ type: 'error', text: err });
    router.replace('/(tabs)');
  };

  return (
    <ScreenBackground>
      <AuthHeader title="Login" onBack={() => router.replace('/welcome')} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Welcome back!</Text>
        <Text style={styles.subtitle}>Please log in with your details</Text>

        <AppMessage message={message} />

        <AppInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <AppInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <View style={styles.row}>
          <TouchableOpacity style={styles.remember} onPress={() => setRemember(!remember)}>
            <Ionicons
              name={remember ? 'checkbox' : 'square-outline'}
              size={18}
              color={remember ? colors.primary : colors.muted}
            />
            <Text style={styles.small}>Remember me</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Alert.alert('Forgot password', 'This feature is not available yet.')}
          >
            <Text style={styles.small}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        <AppButton title="Login" onPress={onLogin} style={{ marginTop: 20 }} />

        <SocialButtons />

        <View style={styles.footer}>
          <Text style={styles.small}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={[styles.small, { color: colors.primary, fontWeight: '800' }]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingBottom: 40 },
  title: { color: colors.text, fontSize: 22, fontWeight: '800', textAlign: 'center', marginTop: 12 },
  subtitle: { color: colors.muted, fontSize: 13, textAlign: 'center', marginTop: 4, marginBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  remember: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  small: { color: colors.muted, fontSize: 12 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
});