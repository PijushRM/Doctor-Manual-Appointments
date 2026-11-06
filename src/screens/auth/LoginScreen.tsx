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
              Doctor portal
            </AppText>
          </View>
          <AppText variant="headline" accessibilityRole="header">
            Welcome,{' '}
            <AppText variant="headline" color="textLink">
              Doctor
            </AppText>
          </AppText>
          <AppText variant="bodySmall">
            Log in to manage appointments and your patients.
          </AppText>
        </View>

        <View style={styles.fields}>
          <TextField
            label="Email or registration ID"
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
            label="Password"
            icon="lock"
            value={vm.password}
            onChangeText={vm.setPassword}
            secureTextEntry={!vm.showPassword}
            autoCapitalize="none"
            autoComplete="password"
            returnKeyType="go"
            onSubmitEditing={vm.submit}
            trailing={
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  vm.showPassword ? 'Hide password' : 'Show password'
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

        <Pressable
          accessibilityRole="button"
          onPress={vm.forgotPassword}
          style={styles.forgot}>
          <AppText variant="label" color="textLink">
            Forgot password?
          </AppText>
        </Pressable>

        <View style={styles.footer}>
          <Button title="Log in" onPress={vm.submit} />
          <AppText variant="bodySmall">
            For clinic doctors and staff only
          </AppText>
        </View>
      </ScrollView>
    </Screen>
  );
};
