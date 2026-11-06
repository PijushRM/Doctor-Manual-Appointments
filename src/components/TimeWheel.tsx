import React, {useMemo, useRef} from 'react';
import {PanResponder, Pressable, StyleSheet, View} from 'react-native';
import {FontFamily} from 'src/configs/fonts';
import type {Theme} from 'src/configs/theme';
import {
  joinTime,
  splitTime,
  wheelColumn,
  wrap,
  type TimeParts,
} from 'src/features/appointments/schedule';
import {useStyles} from 'src/hooks/useTheme';
import {AppText} from './shared/AppText';

const ROW_HEIGHT = 44;
const SWIPE_THRESHOLD = 8;

type ColumnProps = {
  label: string;
  value: number;
  count: number;
  start: number;
  pad?: boolean;
  onChange: (value: number) => void;
};

// One looping column: tap a row to roll to it, or swipe to step through.
// ponytail: rows jump on release instead of following the finger; animate if it feels stiff.
const Column = ({label, value, count, start, pad, onChange}: ColumnProps) => {
  const styles = useStyles(makeStyles);
  const step = (by: number) => onChange(wrap(value + by, count, start));
  const stepRef = useRef(step);
  stepRef.current = step;

  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > SWIPE_THRESHOLD,
        onPanResponderRelease: (_, g) => {
          const by = Math.round(-g.dy / ROW_HEIGHT);
          if (by) {
            stepRef.current(by);
          }
        },
      }),
    [],
  );

  const text = (v: number) => (pad ? String(v).padStart(2, '0') : String(v));

  return (
    <View
      style={styles.column}
      {...pan.panHandlers}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{text: text(value)}}
      accessibilityActions={[{name: 'increment'}, {name: 'decrement'}]}
      onAccessibilityAction={e =>
        step(e.nativeEvent.actionName === 'increment' ? 1 : -1)
      }>
      {wheelColumn(value, count, start).map(row => (
        <Pressable
          key={row.offset}
          onPress={() => onChange(row.value)}
          style={[styles.row, Math.abs(row.offset) === 2 && styles.far]}>
          <AppText
            style={row.offset === 0 ? styles.current : styles.other}
            color={row.offset === 0 ? 'textLink' : 'textDim'}>
            {text(row.value)}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
};

type Props = {minutes: number; onChange: (minutes: number) => void};

// The artboard's `.wheel`: hour · minute · AM/PM around a highlighted band.
export const TimeWheel = ({minutes, onChange}: Props) => {
  const styles = useStyles(makeStyles);
  const parts = splitTime(minutes);
  const set = (next: Partial<TimeParts>) =>
    onChange(joinTime({...parts, ...next}));

  return (
    <View style={styles.wheel}>
      <View style={styles.band} />
      <Column
        label="Hour"
        value={parts.h12}
        count={12}
        start={1}
        onChange={h12 => set({h12})}
      />
      <Column
        label="Minute"
        value={parts.m}
        count={60}
        start={0}
        pad
        onChange={m => set({m})}
      />
      <View style={styles.meridiem}>
        {(['AM', 'PM'] as const).map(label => {
          const selected = parts.pm === (label === 'PM');
          return (
            <Pressable
              key={label}
              accessibilityRole="radio"
              accessibilityState={{selected}}
              onPress={() => set({pm: label === 'PM'})}
              style={styles.row}>
              <AppText
                variant="bodyStrong"
                color={selected ? 'textLink' : 'textDim'}>
                {label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
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
    },
    band: {
      position: 'absolute',
      left: 8,
      right: 8,
      top: 8 + ROW_HEIGHT * 2,
      height: ROW_HEIGHT,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.ring,
      backgroundColor: theme.colors.chip,
    },
    column: {flex: 1},
    meridiem: {width: 88, paddingTop: 66},
    row: {height: ROW_HEIGHT, alignItems: 'center', justifyContent: 'center'},
    far: {opacity: 0.45},
    current: {fontFamily: FontFamily.display, fontSize: 26, lineHeight: 32},
    other: {fontFamily: FontFamily.medium},
  });
