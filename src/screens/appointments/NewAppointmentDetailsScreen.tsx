import React, {useRef} from 'react';
import {ScrollView, View, type TextInput} from 'react-native';
import {AppText} from 'src/components/shared/AppText';
import {BottomBar} from 'src/components/shared/BottomBar';
import {Button} from 'src/components/shared/Button';
import {Screen} from 'src/components/shared/Screen';
import {ProgressBar, StepHeader} from 'src/components/shared/StepHeader';
import {TextField} from 'src/components/shared/TextField';
import {useNewAppointmentDetailsViewModel} from 'src/hooks/useNewAppointmentDetailsViewModel';
import {tr} from 'src/i18n';
import {appointmentsText} from 'src/i18n/strings/appointments';
import {styles} from './styles';

// Artboard: doctor/DocAdd
export const NewAppointmentDetailsScreen = () => {
  const vm = useNewAppointmentDetailsViewModel();
  const ageRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const t = tr(appointmentsText);

  return (
    <Screen>
      <StepHeader
        part={1}
        total={2}
        onBack={vm.back}
        backLabel={t.backToPatients}
      />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <ProgressBar part={1} total={2} />
        <View>
          <AppText variant="headline" accessibilityRole="header">
            {t.titleStart}{' '}
            <AppText variant="headline" color="textLink">
              {t.titleAccent}
            </AppText>
          </AppText>
          <AppText variant="bodySmall" style={styles.intro}>
            {t.intro}
          </AppText>
        </View>

        <AppText variant="heading" accessibilityRole="header">
          {t.patientDetails}
        </AppText>
        <TextField
          label={t.fullName}
          placeholder={t.fullNamePlaceholder}
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
        <View style={styles.row}>
          <View style={styles.age}>
            <TextField
              ref={ageRef}
              label={t.age}
              placeholder={t.agePlaceholder}
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
          <View style={styles.flex}>
            <TextField
              ref={phoneRef}
              label={t.phone}
              placeholder={t.phonePlaceholder}
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
          label={t.email}
          placeholder={t.emailPlaceholder}
          value={vm.draft.email}
          onChangeText={vm.setField('email')}
          error={vm.errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          returnKeyType="done"
          onSubmitEditing={vm.next}
        />
        {vm.existingName && (
          <AppText variant="caption" color="textLink">
            {t.alreadyPatient(vm.existingName)}
          </AppText>
        )}
      </ScrollView>
      <BottomBar>
        <Button title={t.nextDateTime} onPress={vm.next} />
      </BottomBar>
    </Screen>
  );
};
