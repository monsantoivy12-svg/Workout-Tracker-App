import { useState } from 'react';
import { Text, Image, View, Linking, Alert } from 'react-native';
import AppCard from './AppCard';
import AppButton from './AppButton';
import { colors } from '../constants/theme';

// Card para sa usa ka suggested workout (naay picture ug video link gikan sa URL)
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
        <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 12 }}>
          {item.category.toUpperCase()} • {item.level}
        </Text>
        <Text style={{ fontSize: 18, fontWeight: '800', marginVertical: 4 }}>{item.name}</Text>
        <Text style={{ color: colors.muted, marginBottom: 6 }}>
          ⏱ {item.duration} min   🔥 {item.calories} kcal
        </Text>
        {item.exercises.map((e) => (
          <Text key={e} style={{ color: colors.text, fontSize: 13 }}>• {e}</Text>
        ))}
        {item.video ? (
          <AppButton variant="outline" title="▶ Watch video" onPress={openVideo} style={{ marginTop: 10 }} />
        ) : null}
        <AppButton variant="secondary" title="Add to my workouts" onPress={() => onAdd(item)} />
      </View>
    </AppCard>
  );
}