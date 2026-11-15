import React, {useRef} from 'react';
import {Pressable, ScrollView, View, type TextInput} from 'react-native';
import {AppText} from 'src/components/shared/AppText';
import {BackHeader} from 'src/components/shared/BackHeader';
import {Button} from 'src/components/shared/Button';
import {Icon} from 'src/components/shared/Icon';
import {Screen} from 'src/components/shared/Screen';
import {TextField} from 'src/components/shared/TextField';
import {useResetPasswordViewModel} from 'src/hooks/useResetPasswordViewModel';
import {useStyles, useTheme} from 'src/hooks/useTheme';
import {makeStyles} from './styles';

// Forgot password, from the login screen.
export const ResetPasswordScreen = () => {
  const vm = useResetPasswordViewModel();
  const {colors} = useTheme();
  const styles = useStyles(makeStyles);
  const codeRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);
  const {t} = vm;

  const eye = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={vm.showPassword ? t.hidePassword : t.showPassword}
      onPress={vm.toggleShowPassword}
      style={styles.eye}>
      <Icon name="eye" size={20} color={colors.textSubtle} />
    </Pressable>
  );

  return (
    <Screen edges={['top', 'bottom']}>
      <BackHeader onBack={vm.back} backLabel={t.back} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <View>
          <AppText variant="headline" accessibilityRole="header">
            {t.titleStart}{' '}
            <AppText variant="headline" color="textLink">
              {t.titleAccent}
            </AppText>
          </AppText>
          <AppText variant="bodySmall">{t.intro}</AppText>
        </View>

        <View style={styles.fields}>
          <TextField
            label={t.identifier}
            icon="mail"
            placeholder="name@clinic.com"
            value={vm.values.identifier}
            onChangeText={vm.setField('identifier')}
            error={vm.fieldError('identifier')}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            keyboardType="email-address"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => codeRef.current?.focus()}
          />
          <TextField
            ref={codeRef}
            label={t.code}
            icon="shield"
            placeholder={t.codePlaceholder}
            value={vm.values.code}
            onChangeText={vm.setField('code')}
            error={vm.fieldError('code')}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="one-time-code"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <TextField
            ref={passwordRef}
            label={t.password}
            icon="lock"
            placeholder={t.passwordPlaceholder}
            value={vm.values.password}
            onChangeText={vm.setField('password')}
            error={vm.fieldError('password')}
            secureTextEntry={!vm.showPassword}
            autoCapitalize="none"
            autoComplete="new-password"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => confirmRef.current?.focus()}
            trailing={eye}
          />
          <TextField
            ref={confirmRef}
            label={t.confirm}
            icon="lock"
            placeholder={t.confirmPlaceholder}
            value={vm.values.confirm}
            onChangeText={vm.setField('confirm')}
            error={vm.fieldError('confirm')}
            secureTextEntry={!vm.showPassword}
            autoCapitalize="none"
            autoComplete="new-password"
            returnKeyType="go"
            onSubmitEditing={vm.submit}
          />
          {vm.formError && (
            <AppText
              variant="caption"
              color="textDanger"
              accessibilityLiveRegion="polite"
              style={styles.error}>
              {vm.formError}
            </AppText>
          )}
        </View>

        <View style={styles.footer}>
          <Button
            title={vm.busy ? t.submitting : t.submit}
            onPress={vm.submit}
            disabled={vm.busy}
          />
        </View>
      </ScrollView>
    </Screen>
  );
};
