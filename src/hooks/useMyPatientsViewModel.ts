import {useMemo, useState} from 'react';
import {useNavigation, type NavigationProp} from '@react-navigation/native';
import {addDays, startOfDay} from 'date-fns';
import {groupByDay, type HomeTab} from 'src/features/appointments/dayGroups';
import type {MainTabParamList} from 'src/navigation/types';
import {tr} from 'src/i18n';
import {localDigits} from 'src/i18n/format';
import {homeText} from 'src/i18n/strings/home';
import {api, type Page, type ServerAppointmentWithPatient} from 'src/services/api';
import type {Appointment, Patient} from 'src/types/clinic';
import {useCounts} from './useCounts';
import {useInfiniteList} from './useInfiniteList';
import {useNow} from './useNow';
import {useRefreshOnFocus} from './useRefreshOnFocus';

const TABS: HomeTab[] = ['today', 'upcoming', 'all'];

// The "All" tab streams future (soonest first) then past (most recent first),
// in two phases carried in the cursor, so the one list scrolls through both.
type AllCursor = {phase: 'future' | 'past'; c: string | null};

const fetcherFor = (tab: HomeTab, dayStart: Date) => {
  const tomorrow = addDays(dayStart, 1);
  if (tab === 'today') {
    return (cursor: string | null) =>
      api.listAppointments({from: dayStart, to: tomorrow, order: 'asc', cursor});
  }
  if (tab === 'upcoming') {
    return (cursor: string | null) =>
      api.listAppointments({from: tomorrow, order: 'asc', cursor});
  }
  // "all": future (from today, ascending) first, then past (before today, descending).
  return async (
    cursor: string | null,
  ): Promise<Page<ServerAppointmentWithPatient>> => {
    const state: AllCursor = cursor
      ? (JSON.parse(cursor) as AllCursor)
      : {phase: 'future', c: null};
    if (state.phase === 'future') {
      const page = await api.listAppointments({from: dayStart, order: 'asc', cursor: state.c});
      // When the future runs out, hand over to the past phase (not end-of-list).
      const next: AllCursor = page.nextCursor
        ? {phase: 'future', c: page.nextCursor}
        : {phase: 'past', c: null};
      return {data: page.data, nextCursor: JSON.stringify(next)};
    }
    const page = await api.listAppointments({to: dayStart, order: 'desc', cursor: state.c});
    return {
      data: page.data,
      nextCursor: page.nextCursor
        ? JSON.stringify({phase: 'past', c: page.nextCursor} satisfies AllCursor)
        : null,
    };
  };
};

export const useMyPatientsViewModel = () => {
  const navigation = useNavigation<NavigationProp<MainTabParamList>>();
  const [tab, setTab] = useState<HomeTab>('today');
  const now = useNow();
  const counts = useCounts();

  // Stable within the day, so paging a tab doesn't shift its window mid-scroll.
  const dayStart = startOfDay(now);
  const dayKey = dayStart.toISOString();
  const fetchPage = useMemo(() => fetcherFor(tab, new Date(dayKey)), [tab, dayKey]);
  const list = useInfiniteList(fetchPage, [tab, dayKey]);
  useRefreshOnFocus(list.refresh);

  // groupByDay works off a patients array; the list rows carry their patient.
  const groups = useMemo(() => {
    const patients: Patient[] = [];
    const seen = new Set<string>();
    const appointments: Appointment[] = [];
    for (const {patient, ...appointment} of list.items) {
      appointments.push(appointment);
      if (patient && !seen.has(patient.id)) {
        seen.add(patient.id);
        patients.push(patient);
      }
    }
    return groupByDay(appointments, patients, tab, now);
  }, [list.items, tab, now]);

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
  const tabCount: Record<HomeTab, number> = {
    today: counts?.today ?? 0,
    upcoming: counts?.upcoming ?? 0,
    all: counts?.all ?? 0,
  };

  return {
    t,
    totalPatients: counts?.patients ?? 0,
    todayCount: counts?.today ?? 0,
    tabs: TABS.map(key => ({
      key,
      label: `${tabTitle[key]} ${localDigits(tabCount[key])}`,
      selected: key === tab,
    })),
    sections: groups.map(g => ({key: g.key, title: g.title, data: g.rows})),
    status: list.status,
    error: list.error,
    refreshing: list.refreshing,
    loadingMore: list.loadingMore,
    onEndReached: list.loadMore,
    onRefresh: list.refresh,
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
