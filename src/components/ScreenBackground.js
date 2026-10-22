import { View } from 'react-native';
import { colors } from '../constants/theme';

export default function ScreenBackground({ children }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.dark, overflow: 'hidden' }}>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -140,
          right: -140,
          width: 360,
          height: 360,
          borderRadius: 180,
          backgroundColor: colors.primary,
          opacity: 0.14,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: -160,
          left: -160,
          width: 360,
          height: 360,
          borderRadius: 180,
          backgroundColor: colors.primary,
          opacity: 0.06,
        }}
      />
      {children}
    </View>
  );
}