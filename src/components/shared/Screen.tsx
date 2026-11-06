import React from 'react';
import {StyleSheet, type ViewStyle} from 'react-native';
import {SafeAreaView, type Edge} from 'react-native-safe-area-context';
import type {Theme} from 'src/configs/theme';
import {useStyles} from 'src/hooks/useTheme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  // Tab screens leave the bottom inset to the tab bar.
  edges?: Edge[];
};

// The artboards' `.scr`: full-height column on the bg → bg2 gradient.
export const Screen = ({children, style, edges = ['top']}: Props) => {
  const styles = useStyles(makeStyles);
  return (
    <SafeAreaView edges={edges} style={[styles.screen, style]}>
      {children}
    </SafeAreaView>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.bg2,
      experimental_backgroundImage: `linear-gradient(${theme.colors.bg}, ${theme.colors.bg2})`,
    },
  });
