import React from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {AppText} from 'src/components/shared/AppText';
import {Button} from 'src/components/shared/Button';
import {Icon, type IconName} from 'src/components/shared/Icon';
import {Screen} from 'src/components/shared/Screen';
import {FontFamily} from 'src/configs/fonts';
import type {Theme} from 'src/configs/theme';
import {
  useAppointmentSavedViewModel,
  type Channel,
} from 'src/hooks/useAppointmentSavedViewModel';
import {useStyles, useTheme} from 'src/hooks/useTheme';

const CHANNEL_ICON: Record<Channel, IconName> = {
  sms: 'sms',
  whatsapp: 'whatsapp',
  facebook: 'messenger',
};

// Artboard: doctor/DocSaved. No tab bar: it's a confirmation over the app.
export const AppointmentSavedScreen = () => {
  const vm = useAppointmentSavedViewModel();
  const {colors} = useTheme();
  const styles = useStyles(makeStyles);
  if (!vm) {
    return null;
  }

  return (
    <Screen edges={['top', 'bottom']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.check}>
            <Icon
              name="check"
              size={28}
              strokeWidth={2}
              color={colors.textInverse}
            />
          </View>
          <AppText
            variant="headline"
            accessibilityRole="header"
            style={styles.title}>
            Appointment{' '}
            <AppText variant="headline" color="textLink">
              added
            </AppText>
          </AppText>
          <AppText variant="bodySmall">
            {vm.patientName} is now on your patient list.
          </AppText>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.avatar}>
              <AppText variant="label" color="textLink">
                {vm.patientInitials}
              </AppText>
            </View>
            <View>
              <AppText variant="bodyStrong">{vm.patientName}</AppText>
              <AppText variant="caption">{vm.patientAge}</AppText>
            </View>
          </View>
          {vm.details.map(row => (
            <View key={row.label} style={styles.row}>
              <AppText variant="bodySmall">{row.label}</AppText>
              <AppText
                variant="bodySmall"
                color="textBase"
                style={styles.value}>
                {row.value}
              </AppText>
            </View>
          ))}
        </View>

        <View style={styles.send}>
          <AppText variant="caption">SEND DETAILS TO PATIENT</AppText>
          <View style={styles.channels}>
            {vm.channels.map(c => {
              const sent = c.status === 'sent';
              return (
                <Pressable
                  key={c.key}
                  accessibilityRole="button"
                  accessibilityLabel={
                    sent ? `${c.label}: sent` : `Send by ${c.label}`
                  }
                  accessibilityState={{busy: c.status === 'sending'}}
                  disabled={c.status === 'sending'}
                  onPress={c.send}
                  style={({pressed}) => [
                    styles.channel,
                    sent && styles.channelSent,
                    c.status === 'sending' && styles.channelBusy,
                    pressed && styles.pressed,
                  ]}>
                  <Icon
                    name={sent ? 'check' : CHANNEL_ICON[c.key]}
                    size={sent ? 16 : 24}
                    strokeWidth={sent ? 2.2 : 1.5}
                    color={colors.textBase}
                  />
                </Pressable>
              );
            })}
          </View>
          <View style={styles.message}>
            <AppText style={styles.messageText} color="textSubtle">
              “{vm.message}”
            </AppText>
          </View>
        </View>

        <View style={styles.actions}>
          <Button title="View my patients" onPress={vm.viewPatients} />
          <Button
            title="Add another appointment"
            variant="outline"
            onPress={vm.addAnother}
          />
        </View>
      </ScrollView>
    </Screen>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    screen: {experimental_backgroundImage: theme.hero},
    content: {
      flexGrow: 1,
      paddingTop: 40,
      paddingHorizontal: 24,
      paddingBottom: 32,
    },
    hero: {gap: 10},
    check: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.fillStrong,
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: theme.shadow.raised,
    },
    title: {marginTop: 6},
    card: {
      marginTop: 18,
      gap: 10,
      paddingVertical: 18,
      paddingHorizontal: 20,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      boxShadow: theme.shadow.raised,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.chip,
      alignItems: 'center',
      justifyContent: 'center',
    },
    row: {flexDirection: 'row', justifyContent: 'space-between', gap: 12},
    value: {flexShrink: 1, textAlign: 'right'},
    send: {marginTop: 18, gap: 8},
    channels: {flexDirection: 'row', gap: 8},
    channel: {
      width: 56,
      height: 56,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    channelSent: {
      backgroundColor: theme.colors.success,
      borderColor: 'transparent',
    },
    channelBusy: {opacity: 0.5},
    pressed: {transform: [{scale: 0.97}]},
    message: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    messageText: {fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 18},
    actions: {marginTop: 'auto', paddingTop: 24, gap: 10},
  });
