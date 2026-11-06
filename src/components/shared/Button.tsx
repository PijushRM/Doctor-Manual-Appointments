import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {FontFamily} from 'src/configs/fonts';
import type {Theme} from 'src/configs/theme';
import {useStyles} from 'src/hooks/useTheme';
import {AppText} from './AppText';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'outline';
};

// The artboards' `.btn` (primary) and `.obtn` (outline): full-width pills
// that shrink to 95% while pressed.
export const Button = ({
  title,
  onPress,
  disabled,
  variant = 'primary',
}: Props) => {
  const styles = useStyles(makeStyles);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{disabled}}
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.button,
        variant === 'outline' && styles.outline,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}>
      <AppText
        variant="button"
        color={variant === 'outline' ? 'textBrand' : 'textInverse'}
        style={styles.title}>
        {title}
      </AppText>
    </Pressable>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    button: {
      height: 56,
      borderRadius: 999,
      backgroundColor: theme.colors.fillStrong,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'stretch',
      boxShadow: theme.shadow.button,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.border,
      boxShadow: 'none',
    },
    pressed: {transform: [{scale: 0.95}]},
    disabled: {opacity: 0.5},
    title: {fontFamily: FontFamily.semibold},
  });
