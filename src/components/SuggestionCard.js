import { useState } from 'react';
import { Alert, Image, Linking, Text, View } from 'react-native';
import { colors } from '../constants/theme';
import AppButton from './AppButton';
import AppCard from './AppCard';

export default function SuggestionCard({ item, onAdd }) {
  const [imgFailed, setImgFailed] = useState(false);

  const openVideo = () =>
    Linking.openURL(item.video).catch(() => Alert.alert('Error', 'Cannot open this video link.'));

  return (
    <AppCard style={{ width: 260, marginRight: 12, padding: 0, overflow: 'hidden' }}>
      {item.image && !imgFailed ? (
        <Image
          source={{ uri: item.image }}
          style={{ width: '100%', height: 130 }}
          resizeMode="cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <View style={{ height: 130, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 36 }}>🏋️</Text>
        </View>
      )}

      <View style={{ padding: 16 }}>
        <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 12, letterSpacing: 0.5 }}>
          {item.category.toUpperCase()} • {item.level.toUpperCase()}
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
        <Text style={{ color: colors.muted, marginBottom: 6 }}>
          ⏱ {item.duration} min   🔥 {item.calories} kcal
        </Text>
        {item.exercises.map((e) => (
          <Text key={e} style={{ color: colors.text, fontSize: 13, opacity: 0.85 }}>• {e}</Text>
        ))}
        {item.video ? (
          <AppButton variant="outline" title="▶ Watch video" onPress={openVideo} style={{ marginTop: 10 }} />
        ) : null}
        <AppButton title="Add to my workouts" onPress={() => onAdd(item)} />
      </View>
    </AppCard>
  );
}