import { ImageBackground, View } from 'react-native';
import { colors, bgImage } from '../constants/theme';

// Picture nga background, naay semi-transparent nga overlay aron mabasa ang text
export default function ScreenBackground({ children, overlay = 'rgba(255,255,255,0.85)' }) {
  return (
    <ImageBackground
      source={{ uri: bgImage }}
      style={{ flex: 1, backgroundColor: colors.dark }} // fallback kung dili ma-load ang picture
      resizeMode="cover"
    >
      <View style={{ flex: 1, backgroundColor: overlay }}>{children}</View>
    </ImageBackground>
  );
}