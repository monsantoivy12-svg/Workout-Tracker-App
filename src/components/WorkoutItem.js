import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { defaultImageFor } from '../data/categoryImages';
import { defaultVideoFor } from '../data/localVideos';
import { fixImageUrl, hasVideo, youTubeThumb } from '../utils/video';

const clean = (s) => (typeof s === 'string' ? s.trim() : '');

export default function WorkoutItem({ workout, onPress }) {
  useTheme(); // rerender when the theme changes

  // if one image fails, move on to the next one
  const [tryIndex, setTryIndex] = useState(0);

  const videoUrl = workout.video || defaultVideoFor(workout.category);

  // order: saved image -> category default -> YouTube thumbnail
  const candidates = useMemo(() => {
    const list = [
      fixImageUrl(clean(workout.image)),
      defaultImageFor(workout.category),
      youTubeThumb(videoUrl),
    ].filter((u) => !!u);
    return [...new Set(list)];
  }, [workout.image, workout.category, videoUrl]);

  const uri = candidates[tryIndex]; // undefined = show the icon

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <View
        style={{
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 18,
          padding: 10,
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
        }}
      >
        {uri ? (
          <Image
            key={uri}
            source={{ uri }}
            style={{ width: 88, height: 88, borderRadius: 14, backgroundColor: colors.surface }}
            resizeMode="cover"
            onError={() => setTryIndex((i) => i + 1)}
          />
        ) : (
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 14,
              backgroundColor: colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Feather name="activity" size={30} color={colors.muted} />
          </View>
        )}

        <View style={{ flex: 1, paddingHorizontal: 12 }}>
          <Text
            numberOfLines={2}
            style={{
              fontSize: 16,
              fontWeight: '900',
              color: colors.text,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {workout.name}
          </Text>
          <Text style={{ marginTop: 8, color: colors.muted, fontSize: 12, fontWeight: '700' }}>
            {workout.duration} MIN  •  {workout.calories} KCAL
          </Text>
        </View>

        <View style={{ alignSelf: 'flex-start', padding: 4, alignItems: 'center' }}>
          <Feather name="arrow-up-right" size={20} color={colors.text} />
          {hasVideo(videoUrl) ? (
            <Feather name="video" size={14} color={colors.primary} style={{ marginTop: 8 }} />
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}