import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenBackground from '../components/ScreenBackground';
import Logo from '../components/Logo';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import AppMessage from '../components/AppMessage';
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
    const err = register(name, email, password);
    if (err) return setMessage({ type: 'error', text: err });

    setMessage({ type: 'success', text: 'Account created! Going to login...' });
    setTimeout(() => router.replace('/login'), 1200);
  };

  return (
    <ScreenBackground overlay="rgba(59,7,100,0.75)">
      <ScrollView
        style={{ backgroundColor: 'transparent' }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <Logo />
        <View style={{ backgroundColor: 'rgba(255,255,255,0.92)', padding: 20, borderRadius: 20 }}>
          <AppMessage message={message} />
          <AppInput label="Full name" value={name} onChangeText={setName} autoCapitalize="words" />
          <AppInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <AppInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />
          <AppInput label="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry />
          <AppButton title="Register" onPress={onRegister} />
          <AppButton title="Back to login" variant="outline" onPress={() => router.replace('/login')} />
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}