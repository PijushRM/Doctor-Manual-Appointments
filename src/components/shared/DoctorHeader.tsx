import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useNow} from 'src/hooks/useNow';
import {tr} from 'src/i18n';
import {formatDate} from 'src/i18n/format';
import {homeText} from 'src/i18n/strings/home';
import {useDoctorStore} from 'src/store/useDoctorStore';
import {AppText} from './AppText';

// Top of the Home and Patients tabs: today's date over the doctor's name.
export const DoctorHeader = () => {
  const name = useDoctorStore(s => s.profile.name);
  const now = useNow();
  return (
    <View style={styles.header}>
      <AppText variant="caption">
        {formatDate(now, 'EEE, d MMM yyyy').toUpperCase()}
      </AppText>
      <AppText variant="bodyStrong" style={styles.name}>
        {name || tr(homeText).doctor}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {paddingTop: 16, paddingHorizontal: 16},
  name: {marginTop: 4},
});
