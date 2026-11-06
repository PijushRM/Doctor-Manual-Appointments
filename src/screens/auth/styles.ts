import {StyleSheet} from 'react-native';
import type {Theme} from 'src/configs/theme';

export const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    content: {flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40},
    header: {paddingTop: 64, gap: 16},
    logo: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.fillStrong,
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: theme.shadow.raised,
    },
    chip: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      height: 32,
      paddingHorizontal: 12,
      borderRadius: 999,
      backgroundColor: theme.colors.chip,
      borderWidth: 1,
      borderColor: theme.colors.ring,
    },
    fields: {marginTop: 32, gap: 16},
    eye: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    error: {marginTop: -4},
    forgot: {
      alignSelf: 'flex-end',
      marginTop: 8,
      minHeight: 44,
      justifyContent: 'center',
    },
    footer: {marginTop: 'auto', paddingTop: 24, alignItems: 'center', gap: 16},
  });
