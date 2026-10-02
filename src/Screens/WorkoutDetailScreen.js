import { useState } from 'react';
import { ScrollView, Text, Alert, Image, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ScreenBackground from '../components/ScreenBackground';
import AppCard from '../components/AppCard';
import AppButton from '../components/AppButton';
import { useWorkouts } from '../context/WorkoutContext';
import { colors } from '../constants/theme';

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams(); // dynamic route param
  const { getWorkout, deleteWorkout } = useWorkouts();
  const router = useRouter();
  const [imgFailed, setImgFailed] = useState(false);
  const w = getWorkout(id);

  if (!w)
    return (
      <ScreenBackground>
        <View style={{ padding: 20 }}>
          <Text style={{ marginBottom: 12 }}>Workout not found.</Text>
          <AppButton title="Go to Home" onPress={() => router.replace('/(tabs)')} />
        </View>
      </ScreenBackground>
    );

  const onDelete = () =>
    Alert.alert('Delete', `Delete "${w.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteWorkout(id); router.back(); } },
    ]);

  return (
    <ScreenBackground>
      <ScrollView style={{ backgroundColor: 'transparent' }} contentContainerStyle={{ padding: 16 }}>
        {w.image && !imgFailed ? (
          <Image
            source={{ uri: w.image }}
            style={{ width: '100%', height: 200, borderRadius: 16, marginBottom: 12 }}
            resizeMode="cover"
            onError={() => setImgFailed(true)}
          />
        ) : null}

        <AppCard title={w.name}>
          <Text>⏱ Duration: {w.duration} min</Text>
          <Text>🔥 Calories: {w.calories} kcal</Text>
          <Text style={{ marginTop: 8, color: colors.muted }}>{w.notes || 'No notes.'}</Text>
        </AppCard>
        <AppButton title="Edit" onPress={() => router.push(`/edit/${id}`)} />
        <AppButton title="Delete" variant="danger" onPress={onDelete} />
      </ScrollView>
    </ScreenBackground>
  );
}