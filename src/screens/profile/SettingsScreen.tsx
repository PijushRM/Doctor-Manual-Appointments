import React from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {AppText} from 'src/components/shared/AppText';
import {BackHeader} from 'src/components/shared/BackHeader';
import {Icon, type IconName} from 'src/components/shared/Icon';
import {Screen} from 'src/components/shared/Screen';
import {Sheet} from 'src/components/shared/Sheet';
import type {Theme} from 'src/configs/theme';
import {useSettingsViewModel} from 'src/hooks/useSettingsViewModel';
import {useStyles, useTheme} from 'src/hooks/useTheme';
import {makeStyles as makeProfileStyles} from './styles';

type Row = {
  icon: IconName;
  label: string;
  onPress: () => void;
  on?: boolean; // a switch
  value?: string; // shown before the chevron, e.g. the current language
};

// Artboard: doctor/DocProfile2. "Help & support" is left out until there's a
// real support contact.
export const SettingsScreen = () => {
  const vm = useSettingsViewModel();
  const {colors} = useTheme();
  const shared = useStyles(makeProfileStyles);
  const styles = useStyles(makeStyles);
  const {t} = vm;

  const card = (rows: Row[]) => (
    <View style={shared.card}>
      {rows.map((row, i) => {
        const isSwitch = row.on !== undefined;
        return (
          <Pressable
            key={row.label}
            accessibilityRole={isSwitch ? 'switch' : 'button'}
            accessibilityState={isSwitch ? {checked: row.on} : undefined}
            accessibilityValue={row.value ? {text: row.value} : undefined}
            onPress={row.onPress}
            style={[shared.row, i < rows.length - 1 && shared.divider]}>
            <View style={shared.rowIcon}>
              <Icon name={row.icon} size={18} color={colors.textLink} />
            </View>
            <AppText variant="bodyStrong" style={shared.rowText}>
              {row.label}
            </AppText>
            {isSwitch ? (
              // The design's `.sw` toggle.
              <View style={[styles.switch, row.on && styles.switchOn]}>
                <View style={[styles.thumb, row.on && styles.thumbOn]} />
              </View>
            ) : (
              <>
                {row.value && (
                  <AppText variant="label" color="textSubtle">
                    {row.value}
                  </AppText>
                )}
                <Icon name="chevronRight" size={20} color={colors.textBase} />
              </>
            )}
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <Screen>
      <BackHeader onBack={vm.back} backLabel={t.back} />
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="headline" accessibilityRole="header">
          {t.title}
        </AppText>
        <AppText variant="heading" accessibilityRole="header">
          {t.practice}
        </AppText>
        {card([
          {
            icon: 'calendar',
            label: t.availability,
            onPress: vm.openAvailability,
          },
          {
            icon: 'bell',
            label: t.alerts,
            onPress: vm.toggleAlerts,
            on: vm.alerts,
          },
        ])}
        <AppText variant="heading" accessibilityRole="header">
          {t.app}
        </AppText>
        {card([
          {
            icon: 'globe',
            label: t.language,
            value: vm.languageName,
            onPress: vm.openLanguage,
          },
        ])}
        <AppText variant="heading" accessibilityRole="header">
          {t.account}
        </AppText>
        {card([
          {icon: 'lock', label: t.changePassword, onPress: vm.changePassword},
        ])}

        <Pressable
          accessibilityRole="button"
          onPress={vm.logOut}
          style={({pressed}) => [styles.logOut, pressed && styles.pressed]}>
          <Icon name="logout" size={20} color={colors.textDanger} />
          <AppText variant="button" color="textDanger">
            {t.logOut}
          </AppText>
        </Pressable>
      </ScrollView>

      {vm.languageOpen && (
        <Sheet label={t.chooseLanguage} onClose={vm.closeLanguage}>
          <AppText variant="heading" accessibilityRole="header">
            {t.chooseLanguage}
          </AppText>
          <AppText variant="caption" style={styles.sheetHint}>
            {t.languageHint}
          </AppText>
          <View style={shared.card}>
            {vm.languages.map((l, i) => (
              <Pressable
                key={l.key}
                accessibilityRole="radio"
                accessibilityState={{selected: l.selected}}
                onPress={l.pick}
                style={[
                  shared.row,
                  i < vm.languages.length - 1 && shared.divider,
                ]}>
                <AppText variant="bodyStrong" style={shared.rowText}>
                  {l.name}
                </AppText>
                {l.selected && (
                  <Icon
                    name="check"
                    size={20}
                    strokeWidth={2.2}
                    color={colors.textLink}
                  />
                )}
              </Pressable>
            ))}
          </View>
        </Sheet>
      )}
    </Screen>
  );
};

const SWITCH_WIDTH = 44;
const THUMB = 20;
const INSET = 3;

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    content: {
      flexGrow: 1,
      paddingTop: 16,
      paddingHorizontal: 16,
      paddingBottom: 24,
      gap: 16,
    },
    switch: {
      width: SWITCH_WIDTH,
      height: THUMB + INSET * 2,
      borderRadius: 999,
      backgroundColor: theme.colors.border,
    },
    switchOn: {backgroundColor: theme.colors.textLink},
    thumb: {
      position: 'absolute',
      top: INSET,
      left: INSET,
      width: THUMB,
      height: THUMB,
      borderRadius: THUMB / 2,
      backgroundColor: '#FFFFFF',
    },
    thumbOn: {left: SWITCH_WIDTH - THUMB - INSET},
    logOut: {
      marginTop: 'auto',
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
    sheetHint: {marginTop: 4, marginBottom: 16},
  });
