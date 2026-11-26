import { getAssetVideo } from '../data/localVideos';

// Get the 11-character YouTube ID from any YouTube link
export const getYouTubeId = (url = '') => {
  if (!url) return null;
  const m = String(url).match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/
  );
  return m ? m[1] : null;
};

// video bundled in assets/video (video: 'asset:full-body')
export const isAssetVideo = (url = '') => /^asset:/i.test(String(url || ''));

// video from the phone (file:// or content://)
export const isPhoneVideo = (url = '') => /^(file|content|blob):/i.test(String(url || ''));

// any local video (asset or phone)
export const isLocalVideo = (url = '') => isAssetVideo(url) || isPhoneVideo(url);

// has a playable video
export const hasVideo = (url) =>
  !!getYouTubeId(url) || isPhoneVideo(url) || (isAssetVideo(url) && getAssetVideo(url) != null);

// 16:9 thumbnail (no black bars)
export const youTubeThumb = (url) => {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
};

// hqdefault/sddefault are 4:3 with black bars -> mqdefault (16:9)
export const fixImageUrl = (url) => {
  if (!url) return url;
  return /ytimg\.com|img\.youtube\.com/.test(url)
    ? String(url).replace(/\/(hq|sd)default\.jpg/, '/mqdefault.jpg')
    : url;
};