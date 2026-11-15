import React, {useEffect, useRef} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type TextInput,
} from 'react-native';
import {AppText} from 'src/components/shared/AppText';
import {BackHeader} from 'src/components/shared/BackHeader';
import {BottomBar} from 'src/components/shared/BottomBar';
import {Button} from 'src/components/shared/Button';
import {Icon} from 'src/components/shared/Icon';
import {Screen} from 'src/components/shared/Screen';
import {TextField} from 'src/components/shared/TextField';
import type {Theme} from 'src/configs/theme';
import {useEditPatientViewModel} from 'src/hooks/useEditPatientViewModel';
import {useStyles, useTheme} from 'src/hooks/useTheme';
import {tr} from 'src/i18n';
import {appointmentsText} from 'src/i18n/strings/appointments';
import {styles as formStyles} from '../appointments/styles';

// Edit a patient's details (the New Appointment fields), or delete them.
export const EditPatientScreen = () => {
  const vm = useEditPatientViewModel();
  const {colors} = useTheme();
  const styles = useStyles(makeStyles);
  const ageRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  // Field labels and checks are the same as on New Appointment.
  const f = tr(appointmentsText);
  const {t} = vm;

  useEffect(() => {
    if (vm.gone) {
      vm.back();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vm.gone]);

  return (
    <Screen>
      <BackHeader onBack={vm.back} backLabel={t.back} />
      <ScrollView
        style={formStyles.flex}
        contentContainerStyle={formStyles.content}
        keyboardShouldPersistTaps="handled">
        <AppText variant="headline" accessibilityRole="header">
          {t.titleStart}{' '}
          <AppText variant="headline" color="textLink">
            {t.titleAccent}
          </AppText>
        </AppText>
        <TextField
          label={f.fullName}
          placeholder={f.fullNamePlaceholder}
          // Keyboards "correct" names (Subhas → Subhash).
          autoCorrect={false}
          value={vm.draft.name}
          onChangeText={vm.setField('name')}
          error={vm.errors.name}
          autoCapitalize="words"
          autoComplete="name"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => ageRef.current?.focus()}
        />
        <View style={formStyles.row}>
          <View style={formStyles.age}>
            <TextField
              ref={ageRef}
              label={f.age}
              placeholder={f.agePlaceholder}
              value={vm.draft.age}
              onChangeText={vm.setField('age')}
              error={vm.errors.age}
              keyboardType="number-pad"
              maxLength={3}
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => phoneRef.current?.focus()}
            />
          </View>
          <View style={formStyles.flex}>
            <TextField
              ref={phoneRef}
              label={f.phone}
              placeholder={f.phonePlaceholder}
              value={vm.draft.phone}
              onChangeText={vm.setField('phone')}
              error={vm.errors.phone}
              keyboardType="phone-pad"
              autoComplete="tel"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
          </View>
        </View>
        <TextField
          ref={emailRef}
          label={f.email}
          placeholder={f.emailPlaceholder}
          value={vm.draft.email}
          onChangeText={vm.setField('email')}
          error={vm.errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          returnKeyType="done"
          onSubmitEditing={vm.save}
        />

        <Pressable
          accessibilityRole="button"
          disabled={vm.busy !== null}
          onPress={vm.remove}
          style={({pressed}) => [styles.delete, pressed && styles.pressed]}>
          <Icon name="close" size={20} color={colors.textDanger} />
          <AppText variant="button" color="textDanger">
            {vm.busy === 'deleting' ? t.deleting : t.deletePatient}
          </AppText>
        </Pressable>
      </ScrollView>
      <BottomBar>
        <Button
          title={vm.busy === 'saving' ? t.saving : t.save}
          onPress={vm.save}
          disabled={vm.busy !== null}
        />
      </BottomBar>
    </Screen>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    delete: {
      marginTop: 16,
      minHeight: 56,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    pressed: {transform: [{scale: 0.97}]},
  });
