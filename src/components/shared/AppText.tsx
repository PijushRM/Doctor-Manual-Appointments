import React from 'react';
import {Text, type TextProps} from 'react-native';
import {Fonts, type FontType} from 'src/configs/fonts';
import type {ThemeColors} from 'src/configs/theme';
import {useTheme} from 'src/hooks/useTheme';

const DEFAULT_COLOR: Partial<Record<FontType, keyof ThemeColors>> = {
  bodySmall: 'textSubtle',
  caption: 'textSubtle',
};

type Props = TextProps & {variant?: FontType; color?: keyof ThemeColors};

export const AppText = ({variant = 'body', color, style, ...rest}: Props) => {
  const theme = useTheme();
  const tone = color ?? DEFAULT_COLOR[variant] ?? 'textBase';
  return (
    <Text
      {...rest}
      style={[
        variant === 'body' && {fontFamily: theme.bodyFont},
        Fonts[variant],
        {color: theme.colors[tone]},
        style,
      ]}
    />
  );
};
