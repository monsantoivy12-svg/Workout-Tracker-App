import { Redirect } from 'expo-router';
import { useSelector } from 'react-redux';
import HomeScreen from '../../Screens/HomeScreen';
import { selectIsAdmin } from '../../store/authSlice';

export default function Route() {
  const isAdmin = useSelector(selectIsAdmin);
  if (isAdmin) return <Redirect href="/(tabs)/admin" />;
  return <HomeScreen />;
}