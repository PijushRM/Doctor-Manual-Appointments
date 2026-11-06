import React, {useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {addMonths, format, startOfMonth} from 'date-fns';
import {FontFamily} from 'src/configs/fonts';
import type {Theme} from 'src/configs/theme';
import {
  canGoToPreviousMonth,
  monthWeeks,
  WEEKDAY_INITIALS,
  type CalendarCell,
} from 'src/features/appointments/calendar';
import {useStyles, useTheme} from 'src/hooks/useTheme';
import {AppText} from './shared/AppText';
import {Button} from './shared/Button';
import {Icon} from './shared/Icon';
import {Sheet} from './shared/Sheet';

type Props = {
  selected: Date;
  busyDays: Set<string>;
  onPick: (date: Date) => void;
  onClose: () => void;
};

const dayLabel = (cell: CalendarCell) =>
  [
    format(cell.date!, 'EEEE d MMMM'),
    cell.busy && 'has appointments',
    cell.today && 'today',
  ]
    .filter(Boolean)
    .join(', ');

// Artboard: doctor/DocAdd2Cal. Opens on the selected day's month.
export const CalendarSheet = ({selected, busyDays, onPick, onClose}: Props) => {
  const {colors} = useTheme();
  const styles = useStyles(makeStyles);
  const [month, setMonth] = useState(() => startOfMonth(selected));
  const today = new Date();
  const canGoBack = canGoToPreviousMonth(month, today);

  return (
    <Sheet label="Choose a date" onClose={onClose}>
      <View style={styles.header}>
        <AppText variant="heading" accessibilityRole="header">
          {format(month, 'MMMM yyyy')}
        </AppText>
        <View style={styles.arrows}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous month"
            accessibilityState={{disabled: !canGoBack}}
            disabled={!canGoBack}
            onPress={() => setMonth(m => addMonths(m, -1))}
            style={[styles.arrow, !canGoBack && styles.arrowOff]}>
            <Icon name="chevronLeft" size={20} color={colors.textBase} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next month"
            onPress={() => setMonth(m => addMonths(m, 1))}
            style={styles.arrow}>
            <Icon name="chevronRight" size={20} color={colors.textBase} />
          </Pressable>
        </View>
      </View>

      <View style={styles.week}>
        {WEEKDAY_INITIALS.map((d, i) => (
          <AppText key={i} variant="caption" style={styles.weekday}>
            {d}
          </AppText>
        ))}
      </View>
      {monthWeeks(month, selected, today, busyDays).map((week, w) => (
        <View key={w} style={styles.week}>
          {week.map(cell =>
            cell.date ? (
              <Pressable
                key={cell.key}
                accessibilityRole="button"
                accessibilityLabel={dayLabel(cell)}
                accessibilityState={{
                  disabled: cell.past,
                  selected: cell.selected,
                }}
                disabled={cell.past}
                onPress={() => onPick(cell.date!)}
                style={[
                  styles.day,
                  cell.today && styles.today,
                  cell.selected && styles.selected,
                ]}>
                <AppText
                  style={[styles.dayText, cell.selected && styles.dayTextOn]}
                  color={
                    cell.selected
                      ? 'textInverse'
                      : cell.past
                      ? 'textDim'
                      : 'textBase'
                  }>
                  {cell.date.getDate()}
                </AppText>
                {cell.busy && (
                  <View
                    style={[
                      styles.dot,
                      styles.dayDot,
                      cell.selected && styles.dotOn,
                    ]}
                  />
                )}
              </Pressable>
            ) : (
              <View key={cell.key} style={styles.day} />
            ),
          )}
        </View>
      ))}

      <View style={styles.legend}>
        <View style={styles.dot} />
        <AppText variant="caption">Has appointments · outlined = today</AppText>
      </View>
      <Button title="Done" onPress={onClose} />
    </Sheet>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    arrows: {flexDirection: 'row', gap: 4},
    arrow: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.iconButton,
      alignItems: 'center',
      justifyContent: 'center',
    },
    arrowOff: {opacity: 0.35},
    week: {flexDirection: 'row', gap: 4, marginBottom: 4},
    weekday: {flex: 1, textAlign: 'center'},
    day: {
      flex: 1,
      height: 40,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
    },
    today: {borderWidth: 1, borderColor: theme.colors.border},
    selected: {backgroundColor: theme.colors.fillStrong, borderWidth: 0},
    dayText: {fontSize: 15},
    dayTextOn: {fontFamily: FontFamily.semibold},
    dot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.textLink,
    },
    dayDot: {position: 'absolute', bottom: 4},
    dotOn: {backgroundColor: theme.colors.textInverse},
    legend: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 8,
      marginBottom: 16,
    },
  });
