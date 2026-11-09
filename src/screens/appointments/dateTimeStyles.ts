import {StyleSheet} from 'react-native';
import type {Theme} from 'src/configs/theme';

// Each day in the date row: 56 wide plus an 8 gap (used for snapping).
const DATE_CHIP_WIDTH = 56;
export const DATE_CHIP_STEP = 64;

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
    dates: {padding: 2},
    date: {
      width: DATE_CHIP_WIDTH,
      marginRight: DATE_CHIP_STEP - DATE_CHIP_WIDTH,
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
