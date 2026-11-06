import {StyleSheet} from 'react-native';
import type {Theme} from 'src/configs/theme';

export const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    body: {flex: 1, paddingTop: 16, paddingHorizontal: 16, gap: 12},
    titleRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
    },
    search: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      height: 48,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceSunken,
    },
    searchInput: {
      flex: 1,
      height: '100%',
      padding: 0,
      fontSize: 16,
      color: theme.colors.textBase,
    },
    sorted: {marginTop: 4},
    list: {flex: 1, marginBottom: 16},
    group: {
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
      minHeight: 60,
      paddingVertical: 10,
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
    topLine: {flexDirection: 'row', justifyContent: 'space-between', gap: 8},
    name: {flexShrink: 1},
    activity: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 3,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.textLink,
    },
    activityText: {flexShrink: 1, fontSize: 13, lineHeight: 18},
  });
