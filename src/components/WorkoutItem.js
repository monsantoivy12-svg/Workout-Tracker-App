import { useState } from 'react';
import { TouchableOpacity, Text, View, Image } from 'react-native';
import AppCard from './AppCard';
import { colors } from '../constants/theme';

export default function WorkoutItem({ workout, onPress }) {
  const [failed, setFailed] = useState(false);

  return (
    <TouchableOpacity onPress={onPress}>
      <AppCard style={{ padding: 0, overflow: 'hidden', flexDirection: 'row' }}>
        {workout.image && !failed ? (
          <Image
            source={{ uri: workout.image }}
            style={{ width: 100, height: 100 }}
            resizeMode="cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <View style={{ width: 100, height: 100, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 32 }}>🏋️</Text>
          </View>
        )}

        <View style={{ flex: 1, padding: 12, justifyContent: 'center' }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text }}>{workout.name}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            <Text style={{ color: colors.muted }}>⏱ {workout.duration} min</Text>
            <Text style={{ color: colors.muted }}>🔥 {workout.calories} kcal</Text>
          </View>
        </View>
      </AppCard>
    </TouchableOpacity>
  );
}