import React, {useRef, useState} from 'react';
import {Alert, ScrollView, StyleSheet, type TextInput} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {AppText} from 'src/components/shared/AppText';
import {BackHeader} from 'src/components/shared/BackHeader';
import {BottomBar} from 'src/components/shared/BottomBar';
import {Button} from 'src/components/shared/Button';
import {Screen} from 'src/components/shared/Screen';
import {TextField} from 'src/components/shared/TextField';
import {
  PASSWORD_CHANGE_MESSAGES,
  type PasswordChangeError,
} from 'src/features/auth/credentials';
import {useAuthStore} from 'src/store/useAuthStore';

// Not in the canvas: three fields in the same style as Login.
const FIELD_FOR_ERROR: Record<
  PasswordChangeError,
  'current' | 'next' | 'confirm'
> = {
  wrongCurrent: 'current',
  shortPassword: 'next',
  notMatching: 'confirm',
};

export const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const changePassword = useAuthStore(s => s.changePassword);
  const [values, setValues] = useState({current: '', next: '', confirm: ''});
  const [error, setError] = useState<PasswordChangeError | null>(null);
  const nextRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const field = (key: keyof typeof values) => ({
    value: values[key],
    onChangeText: (text: string) => {
      setValues(v => ({...v, [key]: text}));
      setError(null);
    },
    error:
      error && FIELD_FOR_ERROR[error] === key
        ? PASSWORD_CHANGE_MESSAGES[error]
        : undefined,
    secureTextEntry: true,
    autoCapitalize: 'none' as const,
  });

  const save = () => {
    const result = changePassword(values.current, values.next, values.confirm);
    setError(result);
    if (!result) {
      Alert.alert(
        'Password changed',
        'Use your new password next time you log in.',
      );
      navigation.goBack();
    }
  };

  return (
    <Screen>
      <BackHeader onBack={navigation.goBack} backLabel="Back to settings" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <AppText variant="headline" accessibilityRole="header">
          Change{' '}
          <AppText variant="headline" color="textLink">
            password
          </AppText>
        </AppText>
        <TextField
          label="Current password"
          {...field('current')}
          autoComplete="current-password"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => nextRef.current?.focus()}
        />
        <TextField
          ref={nextRef}
          label="New password"
          hint="AT LEAST 6 CHARACTERS"
          {...field('next')}
          autoComplete="new-password"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => confirmRef.current?.focus()}
        />
        <TextField
          ref={confirmRef}
          label="Confirm new password"
          {...field('confirm')}
          autoComplete="new-password"
          returnKeyType="done"
          onSubmitEditing={save}
        />
      </ScrollView>
      <BottomBar>
        <Button title="Save password" onPress={save} />
      </BottomBar>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {padding: 16, gap: 16},
});
