import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import type {Theme} from 'src/configs/theme';
import {useStyles, useTheme} from 'src/hooks/useTheme';
import {Icon} from './Icon';

type Props = {onBack: () => void; backLabel: string; right?: React.ReactNode};

// Top row of pushed screens: the round back button (`.rb`) + optional right side.
export const BackHeader = ({onBack, backLabel, right}: Props) => {
  const {colors} = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={backLabel}
        onPress={onBack}
        style={styles.back}>
        <Icon name="chevronLeft" color={colors.textBase} />
      </Pressable>
      {right}
    </View>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 16,
      paddingHorizontal: 16,
    },
    back: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.iconButton,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
