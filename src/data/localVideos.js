// key = name used by the app (video: 'asset:full-body')
export const localVideos = {
  'full-body':      { label: 'Full Body Burn',    source: require('../../assets/video/full-body.mp4') },
  'morning-cardio': { label: 'Morning Cardio',    source: require('../../assets/video/morning-cardio.mp4') },
  'full-pushup':    { label: 'Push Day',          source: require('../../assets/video/full-pushup.mp4') },
  'pull-day':       { label: 'Pull Day',          source: require('../../assets/video/pull-day.mp4') },
  'leg-day':        { label: 'Leg Day',           source: require('../../assets/video/leg-day.mp4') },
  'leg-burner':     { label: 'Leg Burner',        source: require('../../assets/video/leg-burner.mp4') },
  'body-crusher':   { label: 'Core Crusher',      source: require('../../assets/video/body-crusher.mp4') },
  'body-stretch':   { label: 'Stretch & Recover', source: require('../../assets/video/body-stretch.mp4') },
};

export const assetKey = (url = '') => String(url || '').replace(/^asset:/i, '');

// returns a source (number from require) or null
export const getAssetVideo = (url) => localVideos[assetKey(url)]?.source ?? null;

// fallback video when a suggestion has no video of its own
const DEFAULT_BY_CATEGORY = {
  Strength: 'asset:full-body',
  Cardio: 'asset:morning-cardio',
  HIIT: 'asset:morning-cardio',
  Core: 'asset:body-crusher',
  Mobility: 'asset:body-stretch',
};

export const defaultVideoFor = (category) => DEFAULT_BY_CATEGORY[category] || '';