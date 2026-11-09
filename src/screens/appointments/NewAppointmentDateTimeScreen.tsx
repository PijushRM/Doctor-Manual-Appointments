import React from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {CalendarSheet} from 'src/components/CalendarSheet';
import {TimeWheel} from 'src/components/TimeWheel';
import {AppText} from 'src/components/shared/AppText';
import {BottomBar} from 'src/components/shared/BottomBar';
import {Button} from 'src/components/shared/Button';
import {Icon} from 'src/components/shared/Icon';
import {Screen} from 'src/components/shared/Screen';
import {ProgressBar, StepHeader} from 'src/components/shared/StepHeader';
import {useNewAppointmentDateTimeViewModel} from 'src/hooks/useNewAppointmentDateTimeViewModel';
import {useStyles, useTheme} from 'src/hooks/useTheme';
import {makeStyles} from './dateTimeStyles';

// Artboards: doctor/DocAdd2 (scroll wheel = Option A), DocAdd2Cal (calendar open).
export const NewAppointmentDateTimeScreen = () => {
  const vm = useNewAppointmentDateTimeViewModel();
  const {colors} = useTheme();
  const styles = useStyles(makeStyles);

  return (
    <Screen>
      <StepHeader
        part={2}
        total={2}
        onBack={vm.back}
        backLabel="Back to patient details"
      />
      <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
        <ProgressBar part={2} total={2} />
        <AppText
          variant="headline"
          accessibilityRole="header"
          style={styles.title}>
          Date &{' '}
          <AppText variant="headline" color="textLink">
            time
          </AppText>
        </AppText>

        <View style={styles.sectionRow}>
          <AppText variant="heading" accessibilityRole="header">
            Date
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open calendar, ${vm.monthLabel}`}
            onPress={vm.openCalendar}
            style={styles.month}>
            <AppText variant="label">{vm.monthLabel}</AppText>
            <Icon name="chevronDown" size={18} color={colors.textBase} />
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dates}>
          {vm.dates.map(date => (
            <Pressable
              key={date.key}
              accessibilityRole="radio"
              accessibilityLabel={date.label}
              accessibilityState={{selected: date.selected}}
              onPress={date.pick}
              style={[styles.date, date.selected && styles.dateOn]}>
              <AppText
                variant="caption"
                color={date.selected ? 'textInverse' : 'textSubtle'}>
                {date.weekday}
              </AppText>
              <AppText
                variant="bodyStrong"
                color={date.selected ? 'textInverse' : 'textBase'}>
                {date.dayOfMonth}
              </AppText>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.sectionRow}>
          <AppText variant="heading" accessibilityRole="header">
            Time
          </AppText>
          <AppText variant="caption">TAP OR SWIPE TO ROLL</AppText>
        </View>
        <TimeWheel minutes={vm.minutes} onChange={vm.setMinutes} />

        {vm.quickPicks.length > 0 && (
          <View style={styles.quick}>
            <AppText variant="caption">Free soon:</AppText>
            {vm.quickPicks.map(q => (
              <Pressable
                key={q.label}
                accessibilityRole="button"
                accessibilityLabel={`Set time to ${q.label}`}
                onPress={q.pick}
                style={styles.chip}>
                <AppText variant="label">{q.label}</AppText>
              </Pressable>
            ))}
          </View>
        )}
        <AppText
          variant="caption"
          color={vm.noteIsWarning ? 'textDanger' : 'textSubtle'}
          accessibilityLiveRegion="polite">
          {vm.note}
        </AppText>
      </ScrollView>

      <BottomBar>
        <AppText variant="caption" style={styles.summary}>
          {vm.summary}
        </AppText>
        <Button
          title={vm.saving ? 'Saving…' : 'Save appointment'}
          onPress={vm.save}
          disabled={vm.saving}
        />
      </BottomBar>

      {vm.calendarOpen && (
        <CalendarSheet
          selected={vm.selectedDay}
          busyDays={vm.busyDays}
          onPick={vm.pickCalendarDay}
          onClose={vm.closeCalendar}
        />
      )}
    </Screen>
  );
};
