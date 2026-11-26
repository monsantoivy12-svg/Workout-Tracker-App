import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/theme';
import { defaultVideoFor } from '../data/localVideos';
import { fixImageUrl, hasVideo as isPlayable, youTubeThumb } from '../utils/video';
import AppButton from './AppButton';
import AppCard from './AppCard';
import VideoPlayer from './VideoPlayer';

const DEFAULT_REST = 60;

export default function SuggestionCard({ item, onAdd, width }) {
  const [imgFailed, setImgFailed] = useState(false);
  const [playing, setPlaying] = useState(false);

  const videoUrl = item.video || defaultVideoFor(item.category);
  const hasVideo = isPlayable(videoUrl);
  const uri = fixImageUrl(item.image) || youTubeThumb(videoUrl);
  const rest = item.rest ?? DEFAULT_REST;

  return (
    <AppCard style={{ width, padding: 0, overflow: 'hidden', marginBottom: 0 }}>
      {/* Video plays inside the card, or thumbnail + play button */}
      {playing && hasVideo ? (
        <View>
          <VideoPlayer url={videoUrl} height={200} autoplay />
          <TouchableOpacity
            onPress={() => setPlaying(false)}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}
          >
            <Feather name="x-circle" size={16} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '800', marginLeft: 6 }}>Close video</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity activeOpacity={hasVideo ? 0.85 : 1} onPress={() => hasVideo && setPlaying(true)}>
          {uri && !imgFailed ? (
            <Image
              source={{ uri }}
              style={{ width: '100%', aspectRatio: 16 / 9 }}
              resizeMode="cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <View
              style={{
                width: '100%',
                aspectRatio: 16 / 9,
                backgroundColor: colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Feather name="activity" size={40} color={colors.muted} />
            </View>
          )}
          {hasVideo ? (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.25)',
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Feather name="play" size={24} color={colors.dark} />
              </View>
            </View>
          ) : null}
        </TouchableOpacity>
      )}

      <View style={{ padding: 16 }}>
        <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 12, letterSpacing: 0.5 }}>
          {String(item.category || '').toUpperCase()} • {String(item.level || '').toUpperCase()}
        </Text>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '900',
            marginVertical: 4,
            color: colors.text,
            textTransform: 'uppercase',
          }}
        >
          {item.name}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Feather name="clock" size={14} color={colors.muted} />
          <Text style={{ color: colors.muted, marginLeft: 6, marginRight: 14 }}>{item.duration} min</Text>
          <Feather name="zap" size={14} color={colors.muted} />
          <Text style={{ color: colors.muted, marginLeft: 6 }}>{item.calories} kcal</Text>
        </View>

        {(item.exercises || []).map((e, i) => (
          <Text
            key={`${typeof e === 'string' ? e : e.name}-${i}`}
            style={{ color: colors.text, fontSize: 13, opacity: 0.9, marginBottom: 2 }}
          >
            • {typeof e === 'string' ? e : e.name}
          </Text>
        ))}
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 6 }}>Rest {rest}s between sets</Text>

        <AppButton title="Add to my workouts" onPress={() => onAdd(item)} style={{ marginTop: 12 }} />
      </View>
    </AppCard>
  );
}