import React from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {AppText} from 'src/components/shared/AppText';
import {BackHeader} from 'src/components/shared/BackHeader';
import {BottomBar} from 'src/components/shared/BottomBar';
import {Button} from 'src/components/shared/Button';
import {Icon} from 'src/components/shared/Icon';
import {Screen} from 'src/components/shared/Screen';
import {TextField} from 'src/components/shared/TextField';
import {useUploadNoteViewModel} from 'src/hooks/useUploadNoteViewModel';
import {useStyles, useTheme} from 'src/hooks/useTheme';
import {makeStyles} from './uploadStyles';

// Artboard: doctor/DocUpload
export const UploadNoteScreen = () => {
  const vm = useUploadNoteViewModel();
  const {colors} = useTheme();
  const styles = useStyles(makeStyles);
  if (!vm) {
    return null;
  }

  return (
    <Screen>
      <BackHeader
        onBack={vm.back}
        backLabel="Back to patient profile"
        right={
          <View style={styles.who}>
            <View style={styles.whoAvatar}>
              <AppText
                variant="label"
                color="textLink"
                style={styles.whoInitials}>
                {vm.patientInitials}
              </AppText>
            </View>
            <AppText variant="label">{vm.patientName}</AppText>
          </View>
        }
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <AppText variant="headline" accessibilityRole="header">
          Add to{' '}
          <AppText variant="headline" color="textLink">
            record
          </AppText>
        </AppText>

        <View>
          <AppText variant="caption" style={styles.typeLabel}>
            TYPE
          </AppText>
          <View style={styles.chips} accessibilityRole="radiogroup">
            {vm.types.map(t => (
              <Pressable
                key={t.key}
                accessibilityRole="radio"
                accessibilityState={{selected: t.selected}}
                onPress={t.pick}
                style={[styles.chip, t.selected && styles.chipOn]}>
                <AppText
                  variant="label"
                  color={t.selected ? 'textInverse' : 'textBase'}>
                  {t.label}
                </AppText>
              </Pressable>
            ))}
          </View>
        </View>

        {vm.needsFile &&
          (vm.file ? (
            <View style={styles.file}>
              <View style={styles.badge}>
                <AppText color="textLink" style={styles.badgeText}>
                  {vm.file.badge}
                </AppText>
              </View>
              <View style={styles.fileText}>
                <AppText
                  variant="bodyStrong"
                  numberOfLines={1}
                  style={styles.fileName}>
                  {vm.file.name}
                </AppText>
                <AppText variant="caption">{vm.file.details}</AppText>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remove file"
                onPress={vm.removeFile}
                style={styles.remove}>
                <Icon name="close" size={20} color={colors.textSubtle} />
              </Pressable>
            </View>
          ) : (
            <View>
              <View style={[styles.drop, !!vm.fileError && styles.dropError]}>
                <AppText variant="caption">
                  Add a photo or file (PDF, JPG, PNG)
                </AppText>
                <View style={styles.pickers}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={vm.takePhoto}
                    style={styles.pick}>
                    <Icon name="camera" size={18} color={colors.textBrand} />
                    <AppText variant="label" color="textBrand">
                      Camera
                    </AppText>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={vm.chooseFile}
                    style={styles.pick}>
                    <Icon name="file" size={18} color={colors.textBrand} />
                    <AppText variant="label" color="textBrand">
                      Choose file
                    </AppText>
                  </Pressable>
                </View>
              </View>
              {vm.fileError && (
                <AppText
                  variant="caption"
                  color="textDanger"
                  accessibilityLiveRegion="polite"
                  style={styles.fileError}>
                  {vm.fileError}
                </AppText>
              )}
            </View>
          ))}

        <TextField
          label="Note"
          hint={vm.noteHint}
          value={vm.note}
          onChangeText={vm.setNote}
          error={vm.noteError}
          multiline
          placeholder="e.g. Amoxicillin 500 mg, 3× a day for 5 days. Take after food."
        />
        <AppText variant="caption">{vm.footnote}</AppText>
      </ScrollView>

      <BottomBar>
        <Button
          title={vm.saving ? 'Saving…' : vm.saveLabel}
          onPress={vm.save}
          disabled={vm.saving}
        />
      </BottomBar>
    </Screen>
  );
};
