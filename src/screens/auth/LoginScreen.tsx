import React, {useRef} from 'react';
import {Pressable, ScrollView, View, type TextInput} from 'react-native';
import {AppText} from 'src/components/shared/AppText';
import {Button} from 'src/components/shared/Button';
import {Icon} from 'src/components/shared/Icon';
import {Screen} from 'src/components/shared/Screen';
import {TextField} from 'src/components/shared/TextField';
import {useLoginViewModel} from 'src/hooks/useLoginViewModel';
import {useStyles, useTheme} from 'src/hooks/useTheme';
import {makeStyles} from './styles';

// Artboard: doctor/DocLogin
export const LoginScreen = () => {
  const vm = useLoginViewModel();
  const {colors} = useTheme();
  const styles = useStyles(makeStyles);
  const passwordRef = useRef<TextInput>(null);
  const {t} = vm;

  return (
    <Screen edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logo}>
            <Icon name="tooth" size={32} color={colors.textInverse} />
          </View>
          <View style={styles.chip}>
            <Icon name="shield" size={14} color={colors.textBase} />
            <AppText variant="caption" color="textBase">
              {t.portal}
            </AppText>
          </View>
          <AppText variant="headline" accessibilityRole="header">
            {t.welcome}{' '}
            <AppText variant="headline" color="textLink">
              {t.doctor}
            </AppText>
          </AppText>
          <AppText variant="bodySmall">
            {vm.isRegister ? t.registerIntro : t.loginIntro}
          </AppText>
        </View>

        <View style={styles.fields}>
          <TextField
            label={t.identifier}
            icon="mail"
            value={vm.identifier}
            onChangeText={vm.setIdentifier}
            placeholder="name@clinic.com"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            keyboardType="email-address"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <TextField
            ref={passwordRef}
            label={t.password}
            placeholder={t.passwordPlaceholder}
            icon="lock"
            value={vm.password}
            onChangeText={vm.setPassword}
            secureTextEntry={!vm.showPassword}
            autoCapitalize="none"
            autoComplete={vm.isRegister ? 'new-password' : 'password'}
            returnKeyType="go"
            onSubmitEditing={vm.submit}
            trailing={
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  vm.showPassword ? t.hidePassword : t.showPassword
                }
                onPress={vm.toggleShowPassword}
                style={styles.eye}>
                <Icon name="eye" size={20} color={colors.textSubtle} />
              </Pressable>
            }
          />
          {vm.error && (
            <AppText
              variant="caption"
              color="textDanger"
              accessibilityLiveRegion="polite"
              style={styles.error}>
              {vm.error}
            </AppText>
          )}
        </View>

        {!vm.isRegister && (
          <Pressable
            accessibilityRole="button"
            onPress={vm.forgotPassword}
            style={styles.forgot}>
            <AppText variant="label" color="textLink">
              {t.forgotPassword}
            </AppText>
          </Pressable>
        )}

        <View style={styles.footer}>
          <Button
            title={vm.buttonTitle}
            onPress={vm.submit}
            disabled={vm.busy}
          />
          <Pressable
            accessibilityRole="button"
            onPress={vm.switchMode}
            disabled={vm.busy}
            style={styles.forgot}>
            <AppText variant="label" color="textLink">
              {vm.switchModeLabel}
            </AppText>
          </Pressable>
          <AppText variant="bodySmall">{t.staffOnly}</AppText>
        </View>
      </ScrollView>
    </Screen>
  );
};
