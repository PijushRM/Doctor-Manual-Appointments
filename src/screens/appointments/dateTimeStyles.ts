import {StyleSheet} from 'react-native';
import type {Theme} from 'src/configs/theme';

export const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    flex: {flex: 1},
    content: {padding: 16, gap: 12},
    title: {marginTop: 4},
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    month: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      minHeight: 44,
      paddingLeft: 14,
      paddingRight: 10,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.ring,
      backgroundColor: theme.colors.chip,
    },
    dates: {gap: 8, padding: 2},
    date: {
      width: 56,
      height: 64,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    },
    dateOn: {
      backgroundColor: theme.colors.fillStrong,
      borderColor: theme.colors.fillStrong,
    },
    quick: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 8,
    },
    chip: {
      height: 36,
      paddingHorizontal: 14,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.ring,
      backgroundColor: theme.colors.chip,
      justifyContent: 'center',
    },
    summary: {textAlign: 'center'},
  });
