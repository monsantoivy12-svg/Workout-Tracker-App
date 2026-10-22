import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import ScreenBackground from '../components/ScreenBackground';
import { colors } from '../constants/theme';
import { useWorkouts } from '../context/WorkoutContext';

const Tile = ({ value, label }) => (
  <View
    style={{
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
    }}
  >
    <Text style={{ fontSize: 22, fontWeight: '900', color: colors.primary }}>{value}</Text>
    <Text style={{ fontSize: 11, fontWeight: '700', color: colors.muted, marginTop: 2 }}>{label}</Text>
  </View>
);

export default function WorkoutDetailScreen() {
  const params = useLocalSearchParams(); // dynamic route param from /workout/[id]
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { getWorkout, deleteWorkout } = useWorkouts();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [imgFailed, setImgFailed] = useState(false);
  const w = getWorkout(id);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  const BackSquare = (
    <TouchableOpacity
      onPress={goBack}
      style={{
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: colors.card,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Feather name="chevron-left" size={24} color="#fff" />
    </TouchableOpacity>
  );

  if (!w)
    return (
      <ScreenBackground>
        <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 16 }}>
          {BackSquare}
          <Text style={{ marginVertical: 20, color: colors.text, fontSize: 16 }}>
            Workout not found (ID: {String(id)}).
          </Text>
          <AppButton title="← Back" onPress={goBack} />
        </View>
      </ScreenBackground>
    );

  const onDelete = () =>
    Alert.alert('Delete', `Delete "${w.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteWorkout(id);
          goBack();
        },
      },
    ]);

  return (
    <ScreenBackground>
      <ScrollView style={{ backgroundColor: 'transparent' }} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Top bar: back square + duration */}
        <View
          style={{
            paddingTop: insets.top + 12,
            paddingHorizontal: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {BackSquare}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Feather name="clock" size={20} color={colors.text} />
            <Text style={{ color: colors.text, fontWeight: '900', fontSize: 18, marginLeft: 8 }}>
              {w.duration} min
            </Text>
          </View>
        </View>

        {/* Hero image */}
        <View style={{ padding: 16 }}>
          {w.image && !imgFailed ? (
            <Image
              source={{ uri: w.image }}
              style={{ width: '100%', height: 260, borderRadius: 24 }}
              resizeMode="cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <View
              style={{
                height: 200,
                borderRadius: 24,
                backgroundColor: colors.card,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 56 }}>🏋️</Text>
            </View>
          )}
        </View>

        {/* Dark bottom panel */}
        <View
          style={{
            flexGrow: 1,
            backgroundColor: colors.card,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            padding: 20,
            paddingBottom: 32,
          }}
        >
          <View
            style={{
              alignSelf: 'center',
              width: 44,
              height: 4,
              borderRadius: 2,
              backgroundColor: colors.border,
              marginBottom: 16,
            }}
          />

          <Text
            style={{
              fontSize: 26,
              fontWeight: '900',
              color: colors.text,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {w.name}
          </Text>
          <Text style={{ color: colors.muted, marginTop: 4, marginBottom: 16, fontWeight: '600' }}>
            ID: {w.id}
          </Text>

          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <Tile value={w.duration} label="MINUTES" />
            <Tile value={w.calories} label="KCAL" />
          </View>

          <Text style={{ color: colors.muted, fontWeight: '700', fontSize: 12, marginBottom: 4 }}>
            DESCRIPTION
          </Text>
          <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22, marginBottom: 12 }}>
            {w.notes || 'No description.'}
          </Text>

          <AppButton title="Edit" onPress={() => router.push(`/edit/${w.id}`)} />
          <AppButton title="Delete" variant="danger" onPress={onDelete} />
          <AppButton title="← Back" variant="outline" onPress={goBack} />
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}