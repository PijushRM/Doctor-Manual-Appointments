import {StyleSheet} from 'react-native';
import type {Theme} from 'src/configs/theme';

export const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    body: {flex: 1, paddingTop: 16, paddingHorizontal: 16, gap: 16},
    stats: {flexDirection: 'row', gap: 8},
    tabs: {flexDirection: 'row', gap: 8},
    tab: {
      flex: 1,
      height: 44,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabOn: {
      backgroundColor: theme.colors.fillStrong,
      borderColor: theme.colors.fillStrong,
    },
    list: {flex: 1},
    listContent: {gap: 12, paddingBottom: 24},
    listContentWithAdd: {paddingBottom: 96}, // clear the floating button
    groupTitle: {marginBottom: 8},
    group: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 16,
      paddingHorizontal: 16,
    },
    add: {
      position: 'absolute',
      right: 16,
      bottom: 24,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      height: 56,
      paddingLeft: 18,
      paddingRight: 24,
      borderRadius: 999,
      backgroundColor: theme.colors.fillStrong,
      boxShadow: theme.shadow.raised,
    },
    pressed: {transform: [{scale: 0.95}]},
  });
