import {StyleSheet} from 'react-native';
import {FontFamily} from 'src/configs/fonts';
import type {Theme} from 'src/configs/theme';

export const AVATAR_SIZE = 88;

export const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    title: {
      paddingTop: 16,
      paddingHorizontal: 16,
      fontFamily: FontFamily.display,
      fontSize: 24,
      lineHeight: 29,
    },
    content: {
      paddingTop: 16,
      paddingHorizontal: 16,
      paddingBottom: 24,
      gap: 16,
    },
    identity: {alignItems: 'center', gap: 6},
    avatar: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
      backgroundColor: theme.colors.chip,
      alignItems: 'center',
      justifyContent: 'center',
    },
    photo: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
    },
    avatarText: {fontFamily: FontFamily.semibold, fontSize: 28, lineHeight: 34},
    // The pencil badge sits over the avatar's bottom-right edge.
    badge: {
      position: 'absolute',
      right: -2,
      bottom: -2,
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 3,
      borderColor: theme.colors.bg,
      backgroundColor: theme.colors.fillStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    name: {
      marginTop: 4,
      fontFamily: FontFamily.display,
      fontSize: 24,
      lineHeight: 29,
      textAlign: 'center',
    },
    chip: {
      height: 28,
      paddingHorizontal: 12,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.ring,
      backgroundColor: theme.colors.chip,
      justifyContent: 'center',
    },
    stats: {flexDirection: 'row', gap: 8},
    card: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 16,
      paddingHorizontal: 16,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      minHeight: 56,
      paddingVertical: 8,
    },
    divider: {borderBottomWidth: 1, borderBottomColor: theme.colors.border},
    rowIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.chip,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowText: {flex: 1, minWidth: 0},
    rowValue: {fontFamily: FontFamily.medium},
    version: {marginRight: 4},
  });
