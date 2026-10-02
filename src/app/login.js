import ScreenBackground from '../components/ScreenBackground';
import LoginScreen from '../Screens/LoginScreen';

export default function Route() {
  return (
    <ScreenBackground overlay="rgba(59,7,100,0.75)">
      <LoginScreen />
    </ScreenBackground>
  );
}