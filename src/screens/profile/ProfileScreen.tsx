import React, {useState} from 'react';
import {Image, Pressable, ScrollView, View} from 'react-native';
import {PhotoViewer} from 'src/components/PhotoViewer';
import {AppText} from 'src/components/shared/AppText';
import {Icon, type IconName} from 'src/components/shared/Icon';
import {Screen} from 'src/components/shared/Screen';
import {StatCard} from 'src/components/shared/StatCard';
import {useProfileViewModel} from 'src/hooks/useProfileViewModel';
import {useStyles, useTheme} from 'src/hooks/useTheme';
import {makeStyles} from './styles';

// Artboard: doctor/DocProfile
export const ProfileScreen = () => {
  const vm = useProfileViewModel();
  const {colors} = useTheme();
  const styles = useStyles(makeStyles);
  const [viewingPhoto, setViewingPhoto] = useState(false);
  const {t} = vm;

  const linkRows: {
    icon: IconName;
    label: string;
    extra?: string;
    onPress: () => void;
  }[] = [
    {icon: 'gear', label: t.settingsAndLogOut, onPress: vm.openSettings},
    {
      icon: 'info',
      label: t.aboutThisApp,
      extra: vm.version,
      onPress: vm.openAbout,
    },
  ];

  return (
    <Screen>
      <AppText style={styles.title} accessibilityRole="header">
        {t.title}
      </AppText>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.identity}>
          <View>
            {/* Tap the photo to see it full size; the pencil edits. */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={vm.photo ? t.viewPhoto : t.editProfile}
              onPress={vm.photo ? () => setViewingPhoto(true) : vm.editProfile}>
              {vm.photo ? (
                <Image source={vm.photo} style={styles.photo} />
              ) : (
                <View style={styles.avatar}>
                  <AppText style={styles.avatarText} color="textLink">
                    {vm.initials}
                  </AppText>
                </View>
              )}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t.editProfile}
              hitSlop={8}
              onPress={vm.editProfile}
              style={styles.badge}>
              <Icon
                name="pencil"
                size={14}
                strokeWidth={2}
                color={colors.textInverse}
              />
            </Pressable>
          </View>
          <AppText style={styles.name}>
            {vm.firstNames}
            <AppText style={styles.name} color="textLink">
              {vm.surname}
            </AppText>
          </AppText>
          {!!vm.credentials && (
            <AppText variant="bodySmall">{vm.credentials}</AppText>
          )}
          {!!vm.clinicName && (
            <View style={styles.chip}>
              <AppText variant="caption" color="textBase">
                {vm.clinicName}
              </AppText>
            </View>
          )}
        </View>

        <View style={styles.stats}>
          {vm.stats.map(s => (
            <StatCard key={s.label} label={s.label} value={s.value} />
          ))}
        </View>

        <AppText variant="heading" accessibilityRole="header">
          {t.contactAndClinic}
        </AppText>
        <View style={styles.card}>
          {vm.contact.map((row, i) => (
            <View
              key={row.label}
              accessible
              accessibilityLabel={`${row.label}: ${
                row.value || t.notSetSpoken
              }`}
              style={[styles.row, i < vm.contact.length - 1 && styles.divider]}>
              <View style={styles.rowIcon}>
                <Icon name={row.icon} size={18} color={colors.textLink} />
              </View>
              <View style={styles.rowText}>
                <AppText variant="caption">{row.label}</AppText>
                <AppText
                  color={row.value ? 'textBase' : 'textDim'}
                  style={styles.rowValue}>
                  {row.value || t.notSet}
                </AppText>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          {linkRows.map((row, i) => (
            <Pressable
              key={row.label}
              accessibilityRole="button"
              onPress={row.onPress}
              style={[styles.row, i < linkRows.length - 1 && styles.divider]}>
              <View style={styles.rowIcon}>
                <Icon name={row.icon} size={18} color={colors.textLink} />
              </View>
              <AppText variant="bodyStrong" style={styles.rowText}>
                {row.label}
              </AppText>
              {row.extra && (
                <AppText variant="caption" style={styles.version}>
                  {row.extra}
                </AppText>
              )}
              <Icon name="chevronRight" size={20} color={colors.textBase} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
      {viewingPhoto && vm.photo && (
        <PhotoViewer
          source={vm.photo}
          label={t.profilePhoto}
          onClose={() => setViewingPhoto(false)}
        />
      )}
    </Screen>
  );
};
