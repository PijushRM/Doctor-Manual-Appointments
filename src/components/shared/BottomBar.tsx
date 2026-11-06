import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {Theme} from 'src/configs/theme';
import {useStyles} from 'src/hooks/useTheme';

// Pinned action area above the tab bar (Next / Save buttons).
export const BottomBar = ({children}: {children: React.ReactNode}) => {
  const styles = useStyles(makeStyles);
  return <View style={styles.bar}>{children}</View>;
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    bar: {
      paddingTop: 12,
      paddingHorizontal: 16,
      paddingBottom: 16,
      gap: 8,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.bg2,
    },
  });
