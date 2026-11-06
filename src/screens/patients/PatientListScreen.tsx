import React from 'react';
import {FlatList, Pressable, TextInput, View} from 'react-native';
import {AppText} from 'src/components/shared/AppText';
import {DoctorHeader} from 'src/components/shared/DoctorHeader';
import {Icon} from 'src/components/shared/Icon';
import {Screen} from 'src/components/shared/Screen';
import type {PatientListRow} from 'src/features/patients/activity';
import {usePatientListViewModel} from 'src/hooks/usePatientListViewModel';
import {useStyles, useTheme} from 'src/hooks/useTheme';
import {makeStyles} from './styles';

// Artboard: doctor/DocPatientList
export const PatientListScreen = () => {
  const vm = usePatientListViewModel();
  const theme = useTheme();
  const styles = useStyles(makeStyles);

  const renderRow = ({item, index}: {item: PatientListRow; index: number}) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${item.age} years. ${item.activity}, ${item.when}`}
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
            {item.name} <AppText variant="caption">· {item.age} yrs</AppText>
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
            Pat
            <AppText variant="headline" color="textLink">
              ients
            </AppText>
          </AppText>
          <AppText variant="caption">{vm.countLabel}</AppText>
        </View>

        <View style={styles.search}>
          <Icon name="search" size={20} color={theme.colors.textSubtle} />
          <TextInput
            value={vm.query}
            onChangeText={vm.setQuery}
            placeholder="Search name or phone"
            placeholderTextColor={theme.colors.textDim}
            accessibilityLabel="Search patients"
            autoCorrect={false}
            returnKeyType="search"
            clearButtonMode="while-editing"
            style={[styles.searchInput, {fontFamily: theme.bodyFont}]}
          />
        </View>
        <AppText variant="caption" style={styles.sorted}>
          SORTED BY LAST ACTIVITY
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
