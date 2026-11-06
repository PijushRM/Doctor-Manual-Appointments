import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import type {Theme} from 'src/configs/theme';
import {useStyles, useTheme} from 'src/hooks/useTheme';
import {AppText} from './AppText';
import {Icon} from './Icon';

type Props = {
  initials: string;
  name: string;
  subtitle: string;
  isNew?: boolean;
  divider?: boolean;
  onPress: () => void;
};

// The artboards' `.pr`: avatar, name (+ New tag), caption, chevron.
export const PatientRow = ({
  initials,
  name,
  subtitle,
  isNew,
  divider,
  onPress,
}: Props) => {
  const {colors} = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}${isNew ? ', new' : ''}, ${subtitle}`}
      onPress={onPress}
      style={[styles.row, divider && styles.divider]}>
      <View style={styles.avatar}>
        <AppText variant="label" color="textLink">
          {initials}
        </AppText>
      </View>
      <View style={styles.text}>
        <View style={styles.nameRow}>
          <AppText variant="bodyStrong" numberOfLines={1} style={styles.name}>
            {name}
          </AppText>
          {isNew && (
            <View style={styles.tag}>
              <AppText variant="caption" color="textBase">
                New
              </AppText>
            </View>
          )}
        </View>
        <AppText variant="caption" style={styles.subtitle}>
          {subtitle}
        </AppText>
      </View>
      <Icon name="chevronRight" size={20} color={colors.textBase} />
    </Pressable>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
    },
    divider: {borderBottomWidth: 1, borderBottomColor: theme.colors.border},
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.chip,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {flex: 1, minWidth: 0},
    nameRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
    name: {flexShrink: 1},
    tag: {
      paddingVertical: 2,
      paddingHorizontal: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.chip,
      borderWidth: 1,
      borderColor: theme.colors.ring,
    },
    subtitle: {marginTop: 4},
  });
