import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { colors } from '../constants/theme';
import { selectSuggestions } from '../store/suggestionsSlice';
import SuggestionCard from './SuggestionCard';

// Ang listahan gikan sa store (gi-manage sa admin)
export default function SuggestionCarousel({ onAdd }) {
  const list = useSelector(selectSuggestions);
  const [index, setIndex] = useState(0);

  if (!list.length) {
    return <Text style={{ color: colors.muted, paddingHorizontal: 16 }}>No suggested workouts yet.</Text>;
  }

  const i = Math.min(index, list.length - 1);
  const item = list[i];

  const arrow = (dir) => {
    const disabled = dir < 0 ? i === 0 : i === list.length - 1;
    return (
      <TouchableOpacity
        disabled={disabled}
        onPress={() => setIndex(i + dir)}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.35 : 1,
        }}
      >
        <Feather name={dir < 0 ? 'chevron-left' : 'chevron-right'} size={22} color={colors.text} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ paddingHorizontal: 16 }}>
      <SuggestionCard
        key={item.id}
        item={item}
        onAdd={(x) => {
          onAdd(x);
          Alert.alert('Added', `"${x.name}" was added to your workouts.`);
        }}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
        {arrow(-1)}
        <Text style={{ color: colors.muted, fontWeight: '700' }}>
          {i + 1} / {list.length}
        </Text>
        {arrow(1)}
      </View>
    </View>
  );
}