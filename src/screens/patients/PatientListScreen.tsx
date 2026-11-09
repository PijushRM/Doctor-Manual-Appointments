import React from 'react';
import {FlatList, Pressable, TextInput, View} from 'react-native';
import {AppText} from 'src/components/shared/AppText';
import {DoctorHeader} from 'src/components/shared/DoctorHeader';
import {Icon} from 'src/components/shared/Icon';
import {Screen} from 'src/components/shared/Screen';
import type {PatientListRow} from 'src/features/patients/activity';
import {usePatientListViewModel} from 'src/hooks/usePatientListViewModel';
import {useStyles, useTheme} from 'src/hooks/useTheme';
import {localDigits} from 'src/i18n/format';
import {makeStyles} from './styles';

// Artboard: doctor/DocPatientList
export const PatientListScreen = () => {
  const vm = usePatientListViewModel();
  const theme = useTheme();
  const styles = useStyles(makeStyles);
  const {t} = vm;

  const renderRow = ({item, index}: {item: PatientListRow; index: number}) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t.rowLabel(
        item.name,
        localDigits(item.age),
        item.activity,
        item.when,
      )}
      onPress={() => vm.openPatient(item.id)}
      style={[styles.row, index < vm.rows.length - 1 && styles.divider]}>
      <View style={styles.avatar}>
        <AppText variant="label" color="textLink">
          {item.initials}
        </AppText>
      </View>
      <View style={styles.text}>
        <View style={styles.topLine}>
          <AppText variant="bodyStrong" numberOfLines={1} style={styles.name}>
            {item.name}{' '}
            <AppText variant="caption">
              · {t.ageShort(localDigits(item.age))}
            </AppText>
          </AppText>
          <AppText variant="caption">{item.when}</AppText>
        </View>
        <View style={styles.activity}>
          <View style={styles.dot} />
          <AppText
            variant="bodySmall"
            numberOfLines={1}
            style={styles.activityText}>
            {item.activity}
          </AppText>
        </View>
      </View>
    </Pressable>
  );

  return (
    <Screen>
      <DoctorHeader />
      <View style={styles.body}>
        <View style={styles.titleRow}>
          {/* The design colours "ients", not the whole word. */}
          <AppText variant="headline" accessibilityRole="header">
            {t.titleStart}
            <AppText variant="headline" color="textLink">
              {t.titleAccent}
            </AppText>
          </AppText>
          <AppText variant="caption">{vm.countLabel}</AppText>
        </View>

        <View style={styles.search}>
          <Icon name="search" size={20} color={theme.colors.textSubtle} />
          <TextInput
            value={vm.query}
            onChangeText={vm.setQuery}
            placeholder={t.searchPlaceholder}
            placeholderTextColor={theme.colors.textDim}
            accessibilityLabel={t.searchLabel}
            autoCorrect={false}
            returnKeyType="search"
            clearButtonMode="while-editing"
            style={[styles.searchInput, {fontFamily: theme.bodyFont}]}
          />
        </View>
        <AppText variant="caption" style={styles.sorted}>
          {t.sorted}
        </AppText>

        <FlatList
          data={vm.rows}
          keyExtractor={row => row.id}
          renderItem={renderRow}
          style={styles.list}
          // The rounded card (the design's `.grp`) wraps the rows themselves.
          contentContainerStyle={vm.rows.length > 0 && styles.group}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <AppText variant="bodySmall">{vm.emptyText}</AppText>
          }
        />
      </View>
    </Screen>
  );
};
