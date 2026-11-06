import React from 'react';
import {StyleSheet, View} from 'react-native';
import {format} from 'date-fns';
import {useNow} from 'src/hooks/useNow';
import {useDoctorStore} from 'src/store/useDoctorStore';
import {AppText} from './AppText';

// Top of the Home and Patients tabs: today's date over the doctor's name.
export const DoctorHeader = () => {
  const name = useDoctorStore(s => s.profile.name);
  const now = useNow();
  return (
    <View style={styles.header}>
      <AppText variant="caption">
        {format(now, 'EEE, d MMM yyyy').toUpperCase()}
      </AppText>
      <AppText variant="bodyStrong" style={styles.name}>
        {name || 'Doctor'}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {paddingTop: 16, paddingHorizontal: 16},
  name: {marginTop: 4},
});
