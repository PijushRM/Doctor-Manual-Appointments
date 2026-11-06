import type {TextStyle} from 'react-native';

// Android resolves fontFamily to android/app/src/main/assets/fonts/<name>.ttf
export const FontFamily = {
  regular: 'AlbertSans-Regular',
  medium: 'AlbertSans-Medium',
  semibold: 'AlbertSans-SemiBold',
  bold: 'AlbertSans-Bold',
  display: 'Fraunces-Regular',
} as const;

// Type scale from the artboards: .hl, .hs, .num, body, .bs, .cap, .lbl, .btn
export type FontType =
  | 'headline'
  | 'heading'
  | 'stat'
  | 'body'
  | 'bodyStrong'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'button';

export const Fonts: Record<FontType, TextStyle> = {
  headline: {fontFamily: FontFamily.display, fontSize: 34, lineHeight: 41},
  heading: {fontFamily: FontFamily.display, fontSize: 20, lineHeight: 29},
  stat: {fontFamily: FontFamily.display, fontSize: 34, lineHeight: 41},
  body: {fontSize: 16, lineHeight: 20}, // family comes from theme.bodyFont
  bodyStrong: {fontFamily: FontFamily.semibold, fontSize: 16, lineHeight: 20},
  bodySmall: {fontFamily: FontFamily.regular, fontSize: 14, lineHeight: 20},
  caption: {fontFamily: FontFamily.semibold, fontSize: 12, lineHeight: 17},
  label: {fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 20},
  button: {fontFamily: FontFamily.semibold, fontSize: 16, lineHeight: 20},
};
