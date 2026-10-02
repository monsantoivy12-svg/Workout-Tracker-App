import { useState } from 'react';
import { Alert } from 'react-native';
import AppInput from './AppInput';
import AppButton from './AppButton';

// Reused by Add (create) and Edit (update) screens
export default function WorkoutForm({ initial = {}, submitLabel, onSubmit }) {
  const [name, setName] = useState(initial.name || '');
  const [duration, setDuration] = useState(initial.duration ? String(initial.duration) : '');
  const [calories, setCalories] = useState(initial.calories ? String(initial.calories) : '');
  const [notes, setNotes] = useState(initial.notes || '');
  const [image, setImage] = useState(initial.image || '');

  const submit = () => {
    if (!name.trim() || !duration) return Alert.alert('Missing info', 'Name and duration are required.');
    onSubmit({
      name: name.trim(),
      duration: Number(duration),
      calories: Number(calories) || 0,
      notes,
      image: image.trim(),
    });
  };

  return (
    <>
      <AppInput label="Workout name" value={name} onChangeText={setName} placeholder="e.g. Push Day" autoCapitalize="sentences" />
      <AppInput label="Duration (minutes)" value={duration} onChangeText={setDuration} keyboardType="numeric" />
      <AppInput label="Calories burned" value={calories} onChangeText={setCalories} keyboardType="numeric" />
      <AppInput label="Image URL (optional)" value={image} onChangeText={setImage} placeholder="https://..." keyboardType="url" />
      <AppInput label="Notes" value={notes} onChangeText={setNotes} multiline autoCapitalize="sentences" />
      <AppButton title={submitLabel} onPress={submit} />
    </>
  );
}