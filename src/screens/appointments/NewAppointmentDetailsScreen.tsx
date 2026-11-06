import React, {useRef} from 'react';
import {ScrollView, View, type TextInput} from 'react-native';
import {AppText} from 'src/components/shared/AppText';
import {BottomBar} from 'src/components/shared/BottomBar';
import {Button} from 'src/components/shared/Button';
import {Screen} from 'src/components/shared/Screen';
import {ProgressBar, StepHeader} from 'src/components/shared/StepHeader';
import {TextField} from 'src/components/shared/TextField';
import {useNewAppointmentDetailsViewModel} from 'src/hooks/useNewAppointmentDetailsViewModel';
import {styles} from './styles';

// Artboard: doctor/DocAdd
export const NewAppointmentDetailsScreen = () => {
  const vm = useNewAppointmentDetailsViewModel();
  const ageRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);

  return (
    <Screen>
      <StepHeader
        part={1}
        total={2}
        onBack={vm.back}
        backLabel="Back to my patients"
      />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <ProgressBar part={1} total={2} />
        <View>
          <AppText variant="headline" accessibilityRole="header">
            New{' '}
            <AppText variant="headline" color="textLink">
              appointment
            </AppText>
          </AppText>
          <AppText variant="bodySmall" style={styles.intro}>
            Start with the patient's details. You'll pick the date and time
            next.
          </AppText>
        </View>

        <AppText variant="heading" accessibilityRole="header">
          Patient details
        </AppText>
        <TextField
          label="Full name"
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
              label="Age"
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
              label="Phone number"
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
          label="Email (optional)"
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
            Already a patient — this appointment will be added to{' '}
            {vm.existingName}'s record.
          </AppText>
        )}
      </ScrollView>
      <BottomBar>
        <Button title="Next: date & time" onPress={vm.next} />
      </BottomBar>
    </Screen>
  );
};
