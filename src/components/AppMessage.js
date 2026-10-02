import { View, Text } from 'react-native';

// Message banner sa sulod sa screen: { type: 'error' | 'success', text: '...' }
export default function AppMessage({ message }) {
  if (!message) return null;
  const ok = message.type === 'success';
  return (
    <View
      style={{
        backgroundColor: ok ? '#DCFCE7' : '#FEE2E2',
        borderRadius: 10,
        padding: 10,
        marginBottom: 12,
      }}
    >
      <Text style={{ color: ok ? '#166534' : '#991B1B', fontWeight: '600' }}>{message.text}</Text>
    </View>
  );
}