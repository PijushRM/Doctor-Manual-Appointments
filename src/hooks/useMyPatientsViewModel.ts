import {useState} from 'react';
import {useNavigation, type NavigationProp} from '@react-navigation/native';
import {
  countByTab,
  groupByDay,
  type HomeTab,
} from 'src/features/appointments/dayGroups';
import type {MainTabParamList} from 'src/navigation/types';
import {tr} from 'src/i18n';
import {localDigits} from 'src/i18n/format';
import {homeText} from 'src/i18n/strings/home';
import {useClinicStore} from 'src/store/useClinicStore';
import {useNow} from './useNow';

const TABS: HomeTab[] = ['today', 'upcoming', 'all'];

export const useMyPatientsViewModel = () => {
  const navigation = useNavigation<NavigationProp<MainTabParamList>>();
  const patients = useClinicStore(s => s.patients);
  const appointments = useClinicStore(s => s.appointments);
  const [tab, setTab] = useState<HomeTab>('today');

  const now = useNow();
  const counts = countByTab(appointments, now);
  const t = tr(homeText);
  const tabTitle: Record<HomeTab, string> = {
    today: t.tabToday,
    upcoming: t.tabUpcoming,
    all: t.tabAll,
  };
  const emptyText: Record<HomeTab, string> = {
    today: t.emptyToday,
    upcoming: t.emptyUpcoming,
    all: t.emptyAll,
  };

  return {
    t,
    totalPatients: patients.length,
    todayCount: counts.today,
    tabs: TABS.map(key => ({
      key,
      label: `${tabTitle[key]} ${localDigits(counts[key])}`,
      selected: key === tab,
    })),
    groups: groupByDay(appointments, patients, tab, now),
    emptyText: emptyText[tab],
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
