import {StyleSheet} from 'react-native';
import {FontFamily} from 'src/configs/fonts';
import type {Theme} from 'src/configs/theme';
import {AVATAR_SIZE} from './styles';

export const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    flex: {flex: 1},
    content: {padding: 16, gap: 16},
    photoBlock: {alignItems: 'center', gap: 8},
    avatar: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
      backgroundColor: theme.colors.chip,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {fontFamily: FontFamily.semibold, fontSize: 28, lineHeight: 34},
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
    row: {flexDirection: 'row', gap: 8},
    // Opens / Closes: look like the text fields, open the time wheel.
    timeLabel: {marginBottom: 8},
    timeField: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 56,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceSunken,
    },
    timeFieldError: {borderColor: theme.colors.textDanger},
    days: {flexDirection: 'row', justifyContent: 'space-between'},
    day: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayOn: {
      backgroundColor: theme.colors.fillStrong,
      borderColor: theme.colors.fillStrong,
    },
    dayText: {fontSize: 13},
    error: {marginTop: 6},
  });
