import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {Theme} from 'src/configs/theme';
import {useStyles} from 'src/hooks/useTheme';
import {AppText} from './AppText';

// The artboards' `.stat`: caption over a big serif number.
export const StatCard = ({label, value}: {label: string; value: number}) => {
  const styles = useStyles(makeStyles);
  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={`${label}: ${value}`}>
      <AppText variant="caption">{label}</AppText>
      <AppText variant="stat">{value}</AppText>
    </View>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
  });
