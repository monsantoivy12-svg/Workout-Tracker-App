import { VideoView, useVideoPlayer } from 'expo-video';
import React from 'react';
import { Platform, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '../constants/theme';
import { getAssetVideo } from '../data/localVideos';
import { getYouTubeId, isAssetVideo, isPhoneVideo } from '../utils/video';

// block opening the YouTube app/browser; the video stays inside the app
const allowed = (url = '') =>
  url.startsWith('about:') ||
  url.startsWith('data:') ||
  url.includes('youtube.com/embed') ||
  url.includes('youtube-nocookie.com/embed') ||
  url === 'https://www.youtube.com' ||
  url === 'https://www.youtube.com/';

// source = number (require) or string (file:// uri)
function LocalVideo({ source, height, autoplay }) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = false;
    if (autoplay) p.play();
  });
  return (
    <View style={{ height, borderRadius: 16, overflow: 'hidden', backgroundColor: '#000' }}>
      <VideoView player={player} style={{ flex: 1 }} nativeControls allowsFullscreen contentFit="contain" />
    </View>
  );
}

function Empty({ height }) {
  return (
    <View
      style={{
        height,
        borderRadius: 16,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <Text style={{ color: colors.muted, textAlign: 'center' }}>
        No in-app video for this workout yet. The admin needs to add a video.
      </Text>
    </View>
  );
}

export default function VideoPlayer({ url, height = 210, autoplay = false }) {
  // 1) video from assets/video
  if (isAssetVideo(url)) {
    const src = getAssetVideo(url);
    return src ? <LocalVideo key={url} source={src} height={height} autoplay={autoplay} /> : <Empty height={height} />;
  }

  // 2) video from the phone
  if (isPhoneVideo(url)) return <LocalVideo key={url} source={url} height={height} autoplay={autoplay} />;

  // 3) YouTube
  const id = getYouTubeId(url);
  if (!id) return <Empty height={height} />;

  const embed = `https://www.youtube.com/embed/${id}?playsinline=1&rel=0&modestbranding=1&autoplay=${autoplay ? 1 : 0}`;

  if (Platform.OS === 'web') {
    return (
      <View style={{ height, borderRadius: 16, overflow: 'hidden', backgroundColor: '#000' }}>
        {React.createElement('iframe', {
          src: embed,
          style: { width: '100%', height: '100%', border: 0 },
          allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen',
          allowFullScreen: true,
        })}
      </View>
    );
  }

  const html = `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>html,body{margin:0;height:100%;background:#000}iframe{border:0;width:100%;height:100%}</style>
</head><body>
<iframe src="${embed}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
</body></html>`;

  return (
    <View style={{ height, borderRadius: 16, overflow: 'hidden', backgroundColor: '#000' }}>
      <WebView
        key={id}
        originWhitelist={['*']}
        source={{ html, baseUrl: 'https://www.youtube.com' }}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={!autoplay}
        setSupportMultipleWindows={false}
        onShouldStartLoadWithRequest={(req) => req.isTopFrame === false || allowed(req.url)}
        style={{ flex: 1, backgroundColor: '#000' }}
      />
    </View>
  );
}