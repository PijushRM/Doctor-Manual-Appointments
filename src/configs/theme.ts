// Tokens copied from the canvas artboards' `.lt` / `.dk` CSS variables (comment = CSS var).
export type ThemeColors = {
  textBase: string; // --tb
  textSubtle: string; // --ts
  textDim: string; // --td
  textBrand: string; // --tbr (active tab)
  textLink: string; // --tl
  textInverse: string; // --ti
  textDanger: string; // --tdg
  bg: string; // --bg (gradient top)
  bg2: string; // --bg2 (gradient bottom)
  surface: string; // --sf
  surfaceSunken: string; // --ss (input fields)
  fillStrong: string; // --bf (primary button)
  chip: string; // --chip
  ring: string; // --ring
  border: string; // --bs
  iconButton: string; // --ib
  success: string; // --ok
  overlay: string; // --ov
  sheet: string; // --sh2
  grab: string; // --grab
  focus: string; // .in:focus border
  focusRing: string; // .in:focus ring
};

export type Theme = {
  dark: boolean;
  colors: ThemeColors;
  bodyFont: string; // --bw: body weight is 500 in light, 400 in dark
  shadow: {button: string; raised: string}; // --sh, --shc
  hero: string; // --hero: confirmation screen background
};

export const lightTheme: Theme = {
  dark: false,
  colors: {
    textBase: '#1F2122',
    textSubtle: '#414346',
    textDim: '#66696D',
    textBrand: '#1379F3',
    textLink: '#0265DC',
    textInverse: '#FFFFFF',
    textDanger: '#D32F2F',
    bg: '#FFFFFF',
    bg2: '#F5F5F5',
    surface: '#FFFFFF',
    surfaceSunken: '#F0F1F2',
    fillStrong: '#000000',
    chip: '#E0F2FF',
    ring: '#0265DC',
    border: '#D5D5D5',
    iconButton: '#E0E0E0',
    success: 'rgba(52,199,89,0.15)',
    overlay: 'rgba(255,255,255,0.4)',
    sheet: '#FFFFFF',
    grab: '#CCCCCC',
    focus: '#59A7F6',
    focusRing: 'rgba(89,167,246,0.25)',
  },
  bodyFont: 'AlbertSans-Medium',
  shadow: {
    button: '0 8px 16px rgba(0,0,0,0.08)',
    raised: '0 8px 32px rgba(0,0,0,0.12)',
  },
  hero: 'linear-gradient(135deg, #FFFFFF 30%, #8FCAFC)',
};

export const darkTheme: Theme = {
  dark: true,
  colors: {
    textBase: '#EBEBEB',
    textSubtle: '#D0D0D0',
    textDim: '#B0B0B0',
    textBrand: '#72B7F9',
    textLink: '#72B7F9',
    textInverse: '#1F2122',
    textDanger: '#FF6B6B',
    bg: '#000000',
    bg2: '#000000',
    surface: '#0E0E0E',
    surfaceSunken: '#1D1D1D',
    fillStrong: '#72B7F9',
    chip: '#1D1D1D',
    ring: '#303030',
    border: '#303030',
    iconButton: '#2A2A2A',
    success: 'rgba(52,199,89,0.15)',
    overlay: 'rgba(0,0,0,0.4)',
    sheet: '#000000',
    grab: '#333333',
    focus: '#59A7F6',
    focusRing: 'rgba(89,167,246,0.25)',
  },
  bodyFont: 'AlbertSans-Regular',
  shadow: {button: 'none', raised: 'none'},
  hero: 'linear-gradient(#000000, #000000)',
};
