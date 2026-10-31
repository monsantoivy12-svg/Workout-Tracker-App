import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import AppButton from '../components/AppButton';
import Logo from '../components/Logo';
import ScreenBackground from '../components/ScreenBackground';
import { colors } from '../constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ScreenBackground>
      <View style={{ flex: 1, padding: 24 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Logo size={1.3} />
        </View>

        <View style={{ paddingBottom: 32 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 30,
              fontWeight: '900',
              lineHeight: 36,
              marginBottom: 24,
            }}
          >
            Set Goals, Crush Them, Repeat!
          </Text>
          <AppButton title="Sign up" onPress={() => router.push('/register')} />
          <AppButton title="Login" variant="outline" onPress={() => router.push('/login')} />
        </View>
      </View>
    </ScreenBackground>
  );
}