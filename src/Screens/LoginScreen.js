import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Logo from '../components/Logo';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import AppMessage from '../components/AppMessage';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const { login } = useAuth();
  const router = useRouter();

  const onLogin = () => {
    const err = login(email, password);
    if (err) return setMessage({ type: 'error', text: err });
    router.replace('/(tabs)');
  };

  return (
    <ScrollView
      style={{ backgroundColor: 'transparent' }}
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <Logo size={1.2} />
      <View style={{ backgroundColor: 'rgba(255,255,255,0.92)', padding: 20, borderRadius: 20 }}>
        <AppMessage message={message} />
        <AppInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <AppInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <AppButton title="Login" onPress={onLogin} />
        <AppButton title="Create an account" variant="outline" onPress={() => router.push('/register')} />
      </View>
    </ScrollView>
  );
}