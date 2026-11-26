import { Feather } from '@expo/vector-icons';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';
import VideoPlayer from './VideoPlayer';

export default function VideoModal({ visible, url, title, onClose }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          paddingTop: insets.top + 12,
          paddingHorizontal: 16,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ flex: 1, color: colors.text, fontSize: 18, fontWeight: '900' }} numberOfLines={1}>
            {title || 'Video'}
          </Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="x" size={26} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* i-render lang kung bukas, aron mo-undang ang video kung i-close */}
        {visible ? <VideoPlayer url={url} height={240} autoplay /> : null}

        <Text style={{ color: colors.muted, marginTop: 14, fontSize: 12 }}>
          The video plays inside the app.
        </Text>
      </View>
    </Modal>
  );
}