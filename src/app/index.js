import { Redirect } from 'expo-router';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/authSlice';

export default function Index() {
  const user = useSelector(selectUser);
  return <Redirect href={user ? '/(tabs)' : '/welcome'} />;
}