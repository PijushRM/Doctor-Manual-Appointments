import React from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {AppText} from 'src/components/shared/AppText';
import {BackHeader} from 'src/components/shared/BackHeader';
import {Icon, type IconName} from 'src/components/shared/Icon';
import {Screen} from 'src/components/shared/Screen';
import type {ActivityEvent} from 'src/features/patients/activity';
import {usePatientProfileViewModel} from 'src/hooks/usePatientProfileViewModel';
import {useStyles, useTheme} from 'src/hooks/useTheme';
import {makeStyles} from './profileStyles';

const eventIcon = (event: ActivityEvent): IconName => {
  switch (event.kind) {
    case 'visit':
      return 'check';
    case 'note':
      return 'pencil';
    case 'upload':
      return event.docType === 'xray' ? 'image' : 'document';
    default:
      return 'calendar';
  }
};

// Artboard: doctor/DocPatientProfile
export const PatientProfileScreen = () => {
  const vm = usePatientProfileViewModel();
  const {colors} = useTheme();
  const styles = useStyles(makeStyles);
  if (!vm) {
    return null;
  }

  const info: {icon: IconName; text: React.ReactNode}[] = [
    {icon: 'phone', text: vm.phone},
    ...(vm.email ? [{icon: 'mail' as const, text: vm.email}] : []),
    {
      icon: 'calendar',
      text: (
        <>
          Next visit: <AppText variant="label">{vm.nextVisit}</AppText>
        </>
      ),
    },
  ];

  return (
    <Screen>
      <BackHeader
        onBack={vm.back}
        backLabel="Back to patients"
        right={<AppText variant="caption">PATIENT PROFILE</AppText>}
      />

      <View style={styles.body}>
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <AppText style={styles.avatarText} color="textLink">
              {vm.initials}
            </AppText>
          </View>
          <View>
            <AppText style={styles.name} accessibilityRole="header">
              {vm.firstNames}
              <AppText style={styles.name} color="textLink">
                {vm.surname}
              </AppText>
            </AppText>
            <AppText variant="caption" style={styles.facts}>
              {vm.facts}
            </AppText>
          </View>
        </View>

        <View style={styles.info}>
          {info.map((row, i) => (
            <View
              key={row.icon}
              style={[styles.infoRow, i < info.length - 1 && styles.divider]}>
              <Icon name={row.icon} size={18} color={colors.textLink} />
              <AppText
                variant="bodySmall"
                color="textBase"
                style={styles.infoText}>
                {row.text}
              </AppText>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={vm.upload}
            style={({pressed}) => [
              styles.action,
              styles.primary,
              pressed && styles.pressed,
            ]}>
            <Icon name="upload" size={18} color={colors.textInverse} />
            <AppText
              variant="button"
              color="textInverse"
              style={styles.actionText}>
              Upload
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={vm.addNote}
            style={({pressed}) => [
              styles.action,
              styles.outline,
              pressed && styles.pressed,
            ]}>
            <Icon name="pencil" size={18} color={colors.textBrand} />
            <AppText
              variant="button"
              color="textBrand"
              style={styles.actionText}>
              Add note
            </AppText>
          </Pressable>
        </View>

        {vm.addedBanner && (
          <View style={styles.banner} accessibilityRole="alert">
            <Icon
              name="check"
              size={18}
              strokeWidth={2}
              color={colors.textBase}
            />
            <AppText variant="label" style={styles.bannerText}>
              {vm.addedBanner}
            </AppText>
          </View>
        )}

        <View style={styles.activityHeader}>
          <AppText variant="heading" accessibilityRole="header">
            Activity
          </AppText>
          <AppText variant="caption">NEWEST FIRST</AppText>
        </View>
        <ScrollView style={styles.timeline}>
          {vm.events.map((event, i) => {
            const {file} = event;
            return (
              <Pressable
                key={event.key}
                // Uploads open in the phone's viewer; other events are plain rows.
                disabled={!file}
                onPress={file && (() => vm.open(file))}
                accessibilityRole={file ? 'button' : undefined}
                accessibilityHint={file ? 'Opens the file' : undefined}
                accessibilityLabel={[
                  event.title,
                  event.isNew && 'new',
                  event.detail,
                  event.note && `Note: ${event.note}`,
                  event.when,
                ]
                  .filter(Boolean)
                  .join(', ')}
                style={({pressed}) => [
                  styles.event,
                  pressed && styles.eventPressed,
                ]}>
                {i < vm.events.length - 1 && <View style={styles.line} />}
                <View
                  style={[
                    styles.eventIcon,
                    event.isNew && styles.eventIconNew,
                  ]}>
                  <Icon
                    name={eventIcon(event)}
                    size={18}
                    strokeWidth={event.kind === 'visit' ? 2 : 1.5}
                    color={event.isNew ? colors.textInverse : colors.textLink}
                  />
                </View>
                <View style={styles.eventText}>
                  <View style={styles.eventTop}>
                    <View style={styles.eventTitleRow}>
                      <AppText variant="bodyStrong" style={styles.eventTitle}>
                        {event.title}
                      </AppText>
                      {event.isNew && (
                        <View style={styles.newTag}>
                          <AppText
                            variant="caption"
                            color="textBase"
                            style={styles.newTagText}>
                            New
                          </AppText>
                        </View>
                      )}
                    </View>
                    <AppText variant="caption">{event.when}</AppText>
                  </View>
                  {event.detail && (
                    <AppText
                      variant="caption"
                      color={file ? 'textLink' : 'textSubtle'}
                      style={styles.eventDetail}>
                      {event.detail}
                    </AppText>
                  )}
                  {event.note && (
                    <View style={styles.note}>
                      <AppText variant="bodySmall" style={styles.noteText}>
                        Note: {event.note}
                      </AppText>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Screen>
  );
};
