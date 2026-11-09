import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {Theme} from 'src/configs/theme';
import {
  joinTime,
  splitTime,
  type TimeParts,
} from 'src/features/appointments/schedule';
import {useStyles} from 'src/hooks/useTheme';
import {tr} from 'src/i18n';
import {localDigits} from 'src/i18n/format';
import {appointmentsText} from 'src/i18n/strings/appointments';
import {WHEEL_ROW_HEIGHT, WHEEL_VISIBLE_ROWS, WheelPicker} from './WheelPicker';

// Wheel labels in the current language; the index of each row never changes.
const HOURS = Array.from({length: 12}, (_, i) => String(i + 1)); // 1…12
const MINUTES = Array.from({length: 60}, (_, i) => String(i).padStart(2, '0'));

type Props = {minutes: number; onChange: (minutes: number) => void};

// The artboard's `.wheel`: hour · minute · AM/PM spinning wheels around a
// highlighted band, like the iOS time picker.
export const TimeWheel = ({minutes, onChange}: Props) => {
  const styles = useStyles(makeStyles);
  const parts = splitTime(minutes);
  const set = (next: Partial<TimeParts>) =>
    onChange(joinTime({...parts, ...next}));
  const t = tr(appointmentsText);

  return (
    <View style={styles.wheel}>
      <View style={styles.band} pointerEvents="none" />
      <WheelPicker
        label={t.hour}
        items={HOURS.map(localDigits)}
        index={parts.h12 - 1}
        onChange={i => set({h12: i + 1})}
        loop
      />
      <WheelPicker
        label={t.minute}
        items={MINUTES.map(localDigits)}
        index={parts.m}
        onChange={m => set({m})}
        loop
      />
      <WheelPicker
        label={t.amPm}
        items={[t.am, t.pm]}
        index={parts.pm ? 1 : 0}
        onChange={i => set({pm: i === 1})}
      />
    </View>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    wheel: {
      flexDirection: 'row',
      gap: 8,
      padding: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      overflow: 'hidden',
    },
    band: {
      position: 'absolute',
      left: 8,
      right: 8,
      top: 8 + WHEEL_ROW_HEIGHT * Math.floor(WHEEL_VISIBLE_ROWS / 2),
      height: WHEEL_ROW_HEIGHT,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.ring,
      backgroundColor: theme.colors.chip,
    },
  });
