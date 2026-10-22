import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/theme';

export default function WorkoutItem({ workout, onPress }) {
  const [failed, setFailed] = useState(false);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <View
        style={{
          backgroundColor: colors.light,
          borderRadius: 18,
          padding: 10,
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        {workout.image && !failed ? (
          <Image
            source={{ uri: workout.image }}
            style={{ width: 88, height: 88, borderRadius: 14 }}
            resizeMode="cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 14,
              backgroundColor: '#E5E7EB',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 32 }}>🏋️</Text>
          </View>
        )}

        <View style={{ flex: 1, paddingHorizontal: 12 }}>
          <Text
            numberOfLines={2}
            style={{
              fontSize: 16,
              fontWeight: '900',
              color: '#111',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {workout.name}
          </Text>
          <Text style={{ marginTop: 8, color: '#9CA3AF', fontSize: 12, fontWeight: '700' }}>
            {workout.duration} MIN  •  {workout.calories} KCAL
          </Text>
        </View>

        <View style={{ alignSelf: 'flex-start', padding: 4 }}>
          <Feather name="arrow-up-right" size={20} color="#111" />
        </View>
      </View>
    </TouchableOpacity>
  );
}