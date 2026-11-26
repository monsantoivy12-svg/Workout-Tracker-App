export const palettes = {
  dark: {
    primary: '#F5A03C',
    secondary: '#FFB95E',
    accent: '#F5A03C',
    danger: '#EF4444',
    bg: '#0F0F10',      // screen background
    dark: '#0F0F10',    // text color sa ibabaw sa orange
    card: '#1E1E20',
    surface: '#2A2A2D',
    light: '#FAFAFA',
    text: '#FFFFFF',
    muted: '#9CA3AF',
    border: '#3A3A3D',
    tabBar: '#161618',
  },
  light: {
    primary: '#F5A03C',
    secondary: '#FFB95E',
    accent: '#F5A03C',
    danger: '#EF4444',
    bg: '#F4F5F7',
    dark: '#0F0F10',
    card: '#FFFFFF',
    surface: '#EDEEF1',
    light: '#FFFFFF',
    text: '#111827',
    muted: '#6B7280',
    border: '#E1E3E8',
    tabBar: '#FFFFFF',
  },
};

// mutable: gi-update kung mo-switch ang theme
export const colors = { ...palettes.dark };

export const applyTheme = (mode) => Object.assign(colors, palettes[mode]);

export const bgImage = '';