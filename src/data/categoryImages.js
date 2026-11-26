// Default image per category (used when the workout has no image)
const CATEGORY_IMAGE = {
  Strength: 'https://i.ytimg.com/vi/upQrEnkb53I/mqdefault.jpg',
  Cardio: 'https://i.ytimg.com/vi/JqSIh5IiVAs/mqdefault.jpg',
  HIIT: 'https://i.ytimg.com/vi/NfHQd64VqVg/mqdefault.jpg',
  Core: 'https://i.ytimg.com/vi/JX0yy74tlCI/mqdefault.jpg',
  Mobility: 'https://i.ytimg.com/vi/FIOuEo7E594/mqdefault.jpg',
};

export const defaultImageFor = (category) => CATEGORY_IMAGE[category] || CATEGORY_IMAGE.Strength;