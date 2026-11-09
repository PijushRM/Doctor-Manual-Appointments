import React, {useEffect, useRef} from 'react';
import {FlatList, Pressable, ScrollView, View} from 'react-native';
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
import {tick} from 'src/services/feedback';
import {tr} from 'src/i18n';
import {appointmentsText} from 'src/i18n/strings/appointments';
import {DATE_CHIP_STEP, makeStyles} from './dateTimeStyles';

// Artboards: doctor/DocAdd2 (scroll wheel = Option A), DocAdd2Cal (calendar open).
export const NewAppointmentDateTimeScreen = () => {
  const vm = useNewAppointmentDateTimeViewModel();
  const {colors} = useTheme();
  const styles = useStyles(makeStyles);
  const t = tr(appointmentsText);
  const datesRef = useRef<FlatList<(typeof vm.dates)[number]>>(null);
  const selectedDate = vm.dates.findIndex(d => d.selected);

  // Keep the chosen day in view: centred once the list knows its width (on
  // open), then slid to whenever it changes (e.g. picked on the calendar).
  const laidOut = useRef(false);
  const centreSelected = (animated: boolean) => {
    if (selectedDate >= 0) {
      datesRef.current?.scrollToIndex({
        index: selectedDate,
        viewPosition: 0.5,
        animated,
      });
    }
  };
  useEffect(() => {
    if (laidOut.current) {
      centreSelected(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  return (
    <Screen>
      <StepHeader
        part={2}
        total={2}
        onBack={vm.back}
        backLabel={t.backToDetails}
      />
      <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
        <ProgressBar part={2} total={2} />
        <AppText
          variant="headline"
          accessibilityRole="header"
          style={styles.title}>
          {t.dateTitleStart}{' '}
          <AppText variant="headline" color="textLink">
            {t.dateTitleAccent}
          </AppText>
        </AppText>

        <View style={styles.sectionRow}>
          <AppText variant="heading" accessibilityRole="header">
            {t.date}
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t.openCalendar(vm.monthLabel)}
            onPress={vm.openCalendar}
            style={styles.month}>
            <AppText variant="label">{vm.monthLabel}</AppText>
            <Icon name="chevronDown" size={18} color={colors.textBase} />
          </Pressable>
        </View>
        <FlatList
          ref={datesRef}
          horizontal
          onLayout={() => {
            if (!laidOut.current) {
              laidOut.current = true;
              centreSelected(false);
            }
          }}
          data={vm.dates}
          keyExtractor={date => date.key}
          getItemLayout={(_, index) => ({
            length: DATE_CHIP_STEP,
            offset: DATE_CHIP_STEP * index,
            index,
          })}
          initialNumToRender={10}
          showsHorizontalScrollIndicator={false}
          snapToInterval={DATE_CHIP_STEP}
          decelerationRate="fast"
          contentContainerStyle={styles.dates}
          renderItem={({item: date}) => (
            <Pressable
              accessibilityRole="radio"
              accessibilityLabel={date.label}
              accessibilityState={{selected: date.selected}}
              onPress={() => {
                tick();
                date.pick();
              }}
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
          )}
        />

        <View style={styles.sectionRow}>
          <AppText variant="heading" accessibilityRole="header">
            {t.time}
          </AppText>
          <AppText variant="caption">{t.scrollOrTap}</AppText>
        </View>
        <TimeWheel minutes={vm.minutes} onChange={vm.setMinutes} />

        {vm.quickPicks.length > 0 && (
          <View style={styles.quick}>
            <AppText variant="caption">{t.freeSoon}</AppText>
            {vm.quickPicks.map(q => (
              <Pressable
                key={q.label}
                accessibilityRole="button"
                accessibilityLabel={t.setTimeTo(q.label)}
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
          title={vm.saving ? t.saving : t.saveAppointment}
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
