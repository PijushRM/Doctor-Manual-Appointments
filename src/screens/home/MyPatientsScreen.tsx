import React from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {AppText} from 'src/components/shared/AppText';
import {DoctorHeader} from 'src/components/shared/DoctorHeader';
import {Icon} from 'src/components/shared/Icon';
import {PatientRow} from 'src/components/shared/PatientRow';
import {Screen} from 'src/components/shared/Screen';
import {StatCard} from 'src/components/shared/StatCard';
import {useMyPatientsViewModel} from 'src/hooks/useMyPatientsViewModel';
import {useStyles, useTheme} from 'src/hooks/useTheme';
import {makeStyles} from './styles';

// Artboards: doctor/DocPatients, DocPatientsUpcoming, DocPatientsAll (+ Part 2)
export const MyPatientsScreen = () => {
  const vm = useMyPatientsViewModel();
  const {colors} = useTheme();
  const styles = useStyles(makeStyles);

  return (
    <Screen>
      <DoctorHeader />

      <View style={styles.body}>
        <AppText variant="headline" accessibilityRole="header">
          My{' '}
          <AppText variant="headline" color="textLink">
            patients
          </AppText>
        </AppText>

        <View style={styles.stats}>
          <StatCard label="UNDER YOUR CARE" value={vm.totalPatients} />
          <StatCard label="TODAY" value={vm.todayCount} />
        </View>

        <View style={styles.tabs} accessibilityRole="tablist">
          {vm.tabs.map(tab => (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{selected: tab.selected}}
              onPress={() => vm.selectTab(tab.key)}
              style={[styles.tab, tab.selected && styles.tabOn]}>
              <AppText
                variant="label"
                color={tab.selected ? 'textInverse' : 'textSubtle'}>
                {tab.label}
              </AppText>
            </Pressable>
          ))}
        </View>

        <ScrollView
          style={styles.list}
          contentContainerStyle={[
            styles.listContent,
            vm.showAdd && styles.listContentWithAdd,
          ]}>
          {vm.groups.length === 0 && (
            <AppText variant="bodySmall">{vm.emptyText}</AppText>
          )}
          {vm.groups.map(group => (
            <View key={group.key}>
              <AppText variant="caption" style={styles.groupTitle}>
                {group.title}
              </AppText>
              <View style={styles.group}>
                {group.rows.map((row, i) => (
                  <PatientRow
                    key={row.appointmentId}
                    {...row}
                    divider={i < group.rows.length - 1}
                    onPress={() => vm.openPatient(row.patientId)}
                  />
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {vm.showAdd && (
        <Pressable
          accessibilityRole="button"
          onPress={vm.addAppointment}
          style={({pressed}) => [styles.add, pressed && styles.pressed]}>
          <Icon
            name="plus"
            size={22}
            strokeWidth={2}
            color={colors.textInverse}
          />
          <AppText variant="button" color="textInverse">
            Add appointment
          </AppText>
        </Pressable>
      )}
    </Screen>
  );
};
