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
  MIN_PASSWORD_LENGTH,
  passwordChangeMessage,
  type PasswordChangeError,
} from 'src/features/auth/credentials';
import {tr} from 'src/i18n';
import {changePasswordText} from 'src/i18n/strings/auth';
import {useAuthStore} from 'src/store/useAuthStore';

// Not in the canvas: three fields in the same style as Login.
const FIELD_FOR_ERROR: Record<
  PasswordChangeError,
  'current' | 'next' | 'confirm' | null
> = {
  wrongCurrent: 'current',
  shortPassword: 'next',
  notMatching: 'confirm',
  offline: null,
  server: null,
};

export const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const changePassword = useAuthStore(s => s.changePassword);
  const [values, setValues] = useState({current: '', next: '', confirm: ''});
  const [error, setError] = useState<PasswordChangeError | null>(null);
  const [saving, setSaving] = useState(false);
  const nextRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);
  const t = tr(changePasswordText);

  const field = (key: keyof typeof values) => ({
    value: values[key],
    onChangeText: (text: string) => {
      setValues(v => ({...v, [key]: text}));
      setError(null);
    },
    error:
      error && FIELD_FOR_ERROR[error] === key
        ? passwordChangeMessage(error)
        : undefined,
    secureTextEntry: true,
    autoCapitalize: 'none' as const,
  });

  const save = async () => {
    if (saving) {
      return;
    }
    setSaving(true);
    const result = await changePassword(
      values.current,
      values.next,
      values.confirm,
    ).catch((): PasswordChangeError => 'server');
    setSaving(false);
    setError(result);
    if (result && !FIELD_FOR_ERROR[result]) {
      Alert.alert(t.failed, passwordChangeMessage(result));
      return;
    }
    if (!result) {
      Alert.alert(t.changed, t.changedBody);
      navigation.goBack();
    }
  };

  return (
    <Screen>
      <BackHeader onBack={navigation.goBack} backLabel={t.back} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <AppText variant="headline" accessibilityRole="header">
          {t.titleStart}
          <AppText variant="headline" color="textLink">
            {t.titleAccent}
          </AppText>
        </AppText>
        <TextField
          label={t.current}
          placeholder={t.currentPlaceholder}
          {...field('current')}
          autoComplete="current-password"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => nextRef.current?.focus()}
        />
        <TextField
          ref={nextRef}
          label={t.next}
          placeholder={t.nextPlaceholder(MIN_PASSWORD_LENGTH)}
          hint={t.nextHint(MIN_PASSWORD_LENGTH)}
          {...field('next')}
          autoComplete="new-password"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => confirmRef.current?.focus()}
        />
        <TextField
          ref={confirmRef}
          label={t.confirm}
          placeholder={t.confirmPlaceholder}
          {...field('confirm')}
          autoComplete="new-password"
          returnKeyType="done"
          onSubmitEditing={() => {
            save().catch(() => setSaving(false));
          }}
        />
      </ScrollView>
      <BottomBar>
        <Button
          title={saving ? t.saving : t.save}
          disabled={saving}
          onPress={() => {
            save().catch(() => setSaving(false));
          }}
        />
      </BottomBar>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {padding: 16, gap: 16},
});
