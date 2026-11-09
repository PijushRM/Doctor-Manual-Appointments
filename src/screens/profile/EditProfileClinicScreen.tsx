import React from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {TimeSheet} from 'src/components/TimeSheet';
import {AppText} from 'src/components/shared/AppText';
import {BottomBar} from 'src/components/shared/BottomBar';
import {Button} from 'src/components/shared/Button';
import {Icon} from 'src/components/shared/Icon';
import {Screen} from 'src/components/shared/Screen';
import {ProgressBar, StepHeader} from 'src/components/shared/StepHeader';
import {TextField} from 'src/components/shared/TextField';
import {useEditProfileClinicViewModel} from 'src/hooks/useEditProfileClinicViewModel';
import {useStyles, useTheme} from 'src/hooks/useTheme';
import {makeStyles} from './editStyles';

// Artboard: doctor/DocProfileEdit2 (also Settings › Availability & slots).
export const EditProfileClinicScreen = () => {
  const vm = useEditProfileClinicViewModel();
  const {colors} = useTheme();
  const styles = useStyles(makeStyles);
  const {t} = vm;

  return (
    <Screen>
      <StepHeader
        part={2}
        total={2}
        onBack={vm.back}
        backLabel={vm.fromSettings ? t.backToSettings : t.backToPersonal}
      />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <ProgressBar part={2} total={2} />
        <AppText variant="headline" accessibilityRole="header">
          {t.contactTitle}{' '}
          <AppText variant="headline" color="textLink">
            {t.contactTitleAccent}
          </AppText>
        </AppText>
        <TextField
          label={t.emailLabel}
          placeholder={t.emailPlaceholder}
          value={vm.draft.email}
          onChangeText={vm.setText('email')}
          error={vm.errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <TextField
          label={t.phoneLabel}
          placeholder={t.phonePlaceholder}
          hint={t.phoneHint}
          value={vm.draft.phone}
          onChangeText={vm.setText('phone')}
          error={vm.errors.phone}
          keyboardType="phone-pad"
          autoComplete="tel"
        />
        <TextField
          label={t.clinicName}
          placeholder={t.clinicNamePlaceholder}
          // Keyboards "correct" names (Subhas → Subhash).
          autoCorrect={false}
          value={vm.draft.clinicName}
          onChangeText={vm.setText('clinicName')}
          autoCapitalize="words"
        />

        <View>
          <View style={styles.row}>
            {vm.times.map(time => (
              <View key={time.key} style={styles.flex}>
                <AppText variant="label" style={styles.timeLabel}>
                  {time.label}
                </AppText>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t.changeTime(time.label, time.value)}
                  onPress={time.open}
                  style={[
                    styles.timeField,
                    !!vm.errors.hours && styles.timeFieldError,
                  ]}>
                  <AppText>{time.value}</AppText>
                  <Icon name="clock" size={18} color={colors.textSubtle} />
                </Pressable>
              </View>
            ))}
          </View>
          {vm.errors.hours && (
            <AppText variant="caption" color="textDanger" style={styles.error}>
              {vm.errors.hours}
            </AppText>
          )}
        </View>

        <View>
          <AppText variant="label" style={styles.timeLabel}>
            {t.workingDays}
          </AppText>
          <View style={styles.days}>
            {vm.days.map(d => (
              <Pressable
                key={d.name}
                accessibilityRole="checkbox"
                accessibilityLabel={d.name}
                accessibilityState={{checked: d.on}}
                onPress={d.toggle}
                style={[styles.day, d.on && styles.dayOn]}>
                <AppText
                  variant="label"
                  color={d.on ? 'textInverse' : 'textSubtle'}
                  style={styles.dayText}>
                  {d.letter}
                </AppText>
              </Pressable>
            ))}
          </View>
          {vm.errors.days && (
            <AppText variant="caption" color="textDanger" style={styles.error}>
              {vm.errors.days}
            </AppText>
          )}
        </View>
      </ScrollView>
      <BottomBar>
        <Button
          title={vm.saving ? t.saving : t.saveChanges}
          onPress={vm.save}
          disabled={vm.saving}
        />
      </BottomBar>

      {vm.editingTime && (
        <TimeSheet
          title={vm.editingTime.title}
          minutes={vm.editingTime.minutes}
          onDone={vm.editingTime.done}
          onClose={vm.editingTime.close}
        />
      )}
    </Screen>
  );
};
