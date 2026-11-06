import React from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {AppText} from 'src/components/shared/AppText';
import {BackHeader} from 'src/components/shared/BackHeader';
import {Icon} from 'src/components/shared/Icon';
import {Screen} from 'src/components/shared/Screen';
import {FontFamily} from 'src/configs/fonts';
import type {Theme} from 'src/configs/theme';
import {useAboutViewModel} from 'src/hooks/useAboutViewModel';
import {useStyles, useTheme} from 'src/hooks/useTheme';
import {makeStyles as makeProfileStyles} from './styles';

// Artboard: doctor/DocAbout. The Legal rows (Terms, Privacy, licences) stay
// hidden until those pages exist.
export const AboutScreen = () => {
  const vm = useAboutViewModel();
  const {colors} = useTheme();
  const shared = useStyles(makeProfileStyles);
  const styles = useStyles(makeStyles);

  return (
    <Screen>
      <BackHeader
        onBack={vm.back}
        backLabel="Back to profile"
        right={<AppText variant="caption">ABOUT THIS APP</AppText>}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.identity}>
          <View style={styles.logo}>
            <Icon name="tooth" size={32} color={colors.textInverse} />
          </View>
          <AppText style={styles.title} accessibilityRole="header">
            {vm.title.before && `${vm.title.before} `}
            <AppText style={styles.title} color="textLink">
              {vm.title.accent}
            </AppText>
            {vm.title.after ? ` ${vm.title.after}` : ''}
          </AppText>
          <AppText variant="caption">{vm.version}</AppText>
        </View>

        <AppText variant="heading" accessibilityRole="header">
          Developed by
        </AppText>
        <View style={shared.card}>
          {vm.developer.map((row, i) => (
            <Pressable
              key={row.icon}
              disabled={!row.open}
              onPress={row.open}
              accessibilityRole={row.open ? 'link' : undefined}
              accessibilityLabel={[row.label, row.value]
                .filter(Boolean)
                .join(': ')}
              style={[
                styles.row,
                i < vm.developer.length - 1 && shared.divider,
              ]}>
              <View style={styles.rowIcon}>
                <Icon name={row.icon} size={16} color={colors.textLink} />
              </View>
              <View style={shared.rowText}>
                {row.label && <AppText variant="caption">{row.label}</AppText>}
                <AppText
                  variant={row.label ? 'bodySmall' : 'bodyStrong'}
                  color="textBase"
                  style={row.label && styles.value}>
                  {row.value}
                </AppText>
              </View>
            </Pressable>
          ))}
        </View>

        <AppText variant="caption" style={styles.copyright}>
          {vm.copyright}
        </AppText>
      </ScrollView>
    </Screen>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    content: {
      flexGrow: 1,
      paddingTop: 12,
      paddingHorizontal: 16,
      paddingBottom: 16,
      gap: 14,
    },
    identity: {alignItems: 'center', gap: 6},
    logo: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.fillStrong,
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: theme.shadow.raised,
    },
    title: {
      marginTop: 4,
      fontFamily: FontFamily.display,
      fontSize: 24,
      lineHeight: 29,
      textAlign: 'center',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      minHeight: 52,
      paddingVertical: 6,
    },
    rowIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.chip,
      alignItems: 'center',
      justifyContent: 'center',
    },
    value: {fontFamily: FontFamily.medium},
    copyright: {
      marginTop: 'auto',
      textAlign: 'center',
      fontFamily: FontFamily.medium,
    },
  });
