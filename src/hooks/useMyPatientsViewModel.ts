import {useState} from 'react';
import {useNavigation, type NavigationProp} from '@react-navigation/native';
import {
  countByTab,
  groupByDay,
  type HomeTab,
} from 'src/features/appointments/dayGroups';
import type {MainTabParamList} from 'src/navigation/types';
import {useClinicStore} from 'src/store/useClinicStore';
import {useNow} from './useNow';

const TAB_TITLES: Record<HomeTab, string> = {
  today: 'Today',
  upcoming: 'Upcoming',
  all: 'All',
};

const EMPTY_TEXT: Record<HomeTab, string> = {
  today: 'No appointments today.',
  upcoming: 'No upcoming appointments.',
  all: 'No appointments yet.',
};

export const useMyPatientsViewModel = () => {
  const navigation = useNavigation<NavigationProp<MainTabParamList>>();
  const patients = useClinicStore(s => s.patients);
  const appointments = useClinicStore(s => s.appointments);
  const [tab, setTab] = useState<HomeTab>('today');

  const now = useNow();
  const counts = countByTab(appointments, now);

  return {
    totalPatients: patients.length,
    todayCount: counts.today,
    tabs: (Object.keys(TAB_TITLES) as HomeTab[]).map(key => ({
      key,
      label: `${TAB_TITLES[key]} ${counts[key]}`,
      selected: key === tab,
    })),
    groups: groupByDay(appointments, patients, tab, now),
    emptyText: EMPTY_TEXT[tab],
    // The design puts "Add appointment" on the Today tab only.
    showAdd: tab === 'today',
    selectTab: setTab,
    openPatient: (patientId: string) =>
      navigation.navigate('PatientsTab', {
        screen: 'PatientProfile',
        params: {patientId},
        initial: false,
      }),
    addAppointment: () =>
      navigation.navigate('AppointmentsTab', {screen: 'NewAppointmentDetails'}),
  };
};
