import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';
import { fixImageUrl, hasVideo } from '../utils/video';
import AppButton from './AppButton';
import VideoPlayer from './VideoPlayer';

export default function SuggestionModal({ item, visible, onClose, onAdd }) {
  const insets = useSafeAreaInsets();
  const [imgFailed, setImgFailed] = useState(false);

  if (!item) return null;

  const stat = (icon, text) => (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Feather name={icon} size={18} color={colors.primary} />
      <Text style={{ color: colors.text, fontWeight: '800', marginTop: 6 }}>{text}</Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        >
          {item.image && !imgFailed ? (
            <View style={{ width: '100%', aspectRatio: 16 / 9, backgroundColor: colors.surface }}>
              <Image
                source={{ uri: fixImageUrl(item.image) }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
                onError={() => setImgFailed(true)}
              />
            </View>
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
              <Text style={{ fontSize: 48 }}>🏋️</Text>
            </View>
          )}

          <View style={{ padding: 20 }}>
            <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 13, letterSpacing: 0.5 }}>
              {item.category.toUpperCase()} • {item.level.toUpperCase()}
            </Text>
            <Text
              style={{
                fontSize: 28,
                fontWeight: '900',
                marginTop: 6,
                color: colors.text,
                textTransform: 'uppercase',
              }}
            >
              {item.name}
            </Text>

            <View style={{ flexDirection: 'row', marginTop: 14, gap: 12 }}>
              {stat('clock', `${item.duration} min`)}
              {stat('zap', `${item.calories} kcal`)}
            </View>

            {hasVideo(item.video) ? (
              <View style={{ marginTop: 20 }}>
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 8 }}>
                  Video
                </Text>
                <VideoPlayer url={item.video} />
              </View>
            ) : null}

            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 24 }}>
              Exercises
            </Text>
            <View style={{ marginTop: 8 }}>
              {item.exercises.map((e, i) => {
                const isLast = i === item.exercises.length - 1;
                return (
                  <View key={`${e}-${i}`}>
                    <View
                      style={{
                        backgroundColor: colors.card,
                        borderRadius: 12,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{e}</Text>
                    </View>
                    {!isLast ? (
                      <Text
                        style={{ color: colors.muted, fontSize: 12, textAlign: 'center', marginVertical: 6 }}
                      >
                        😮‍💨 Rest 1 min
                      </Text>
                    ) : null}
                  </View>
                );
              })}
            </View>

            <AppButton
              title="Add to my workouts"
              style={{ marginTop: 20 }}
              onPress={() => {
                onAdd(item);
                onClose();
              }}
            />
          </View>
        </ScrollView>

        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.8}
          style={{
            position: 'absolute',
            top: insets.top + 10,
            right: 16,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(0,0,0,0.6)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Feather name="x" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}