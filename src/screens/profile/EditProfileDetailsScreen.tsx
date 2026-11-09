import React from 'react';
import {Image, Pressable, ScrollView, View} from 'react-native';
import {AppText} from 'src/components/shared/AppText';
import {BottomBar} from 'src/components/shared/BottomBar';
import {Button} from 'src/components/shared/Button';
import {Icon} from 'src/components/shared/Icon';
import {Screen} from 'src/components/shared/Screen';
import {ProgressBar, StepHeader} from 'src/components/shared/StepHeader';
import {TextField} from 'src/components/shared/TextField';
import {useEditProfileDetailsViewModel} from 'src/hooks/useEditProfileDetailsViewModel';
import {useStyles, useTheme} from 'src/hooks/useTheme';
import {makeStyles} from './editStyles';
import {makeStyles as makeProfileStyles} from './styles';

// Artboard: doctor/DocProfileEdit
export const EditProfileDetailsScreen = () => {
  const vm = useEditProfileDetailsViewModel();
  const {colors} = useTheme();
  const styles = useStyles(makeStyles);
  const profileStyles = useStyles(makeProfileStyles);
  const {t} = vm;

  return (
    <Screen>
      <StepHeader
        part={1}
        total={2}
        onBack={vm.back}
        backLabel={t.backToProfile}
      />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <ProgressBar part={1} total={2} />
        <AppText variant="headline" accessibilityRole="header">
          {t.editTitle}{' '}
          <AppText variant="headline" color="textLink">
            {t.editTitleAccent}
          </AppText>
        </AppText>

        <View style={styles.photoBlock}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t.changePhoto}
            onPress={vm.changePhoto}>
            {vm.photo ? (
              <Image source={vm.photo} style={profileStyles.photo} />
            ) : (
              <View style={styles.avatar}>
                <AppText style={styles.avatarText} color="textLink">
                  {vm.initials}
                </AppText>
              </View>
            )}
            <View style={styles.badge}>
              <Icon
                name="camera"
                size={15}
                strokeWidth={2}
                color={colors.textInverse}
              />
            </View>
          </Pressable>
          <AppText variant="caption">{t.tapToChange}</AppText>
        </View>

        <AppText variant="heading" accessibilityRole="header">
          {t.personalDetails}
        </AppText>
        <TextField
          label={t.fullName}
          placeholder={t.fullNamePlaceholder}
          // Keyboards "correct" names (Subhas → Subhash).
          autoCorrect={false}
          value={vm.draft.name}
          onChangeText={vm.setField('name')}
          error={vm.errors.name}
          autoCapitalize="words"
          autoComplete="name"
        />
        <TextField
          label={t.qualifications}
          // …and degree abbreviations (FICOI).
          autoCorrect={false}
          value={vm.draft.qualifications}
          onChangeText={vm.setField('qualifications')}
          placeholder={t.qualificationsPlaceholder}
          autoCapitalize="characters"
        />
        <TextField
          label={t.speciality}
          value={vm.draft.speciality}
          onChangeText={vm.setField('speciality')}
          placeholder={t.specialityPlaceholder}
          autoCapitalize="words"
        />
      </ScrollView>
      <BottomBar>
        <Button title={t.nextContact} onPress={vm.next} />
      </BottomBar>
    </Screen>
  );
};
