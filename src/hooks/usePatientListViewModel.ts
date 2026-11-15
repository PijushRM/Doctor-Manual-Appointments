import {useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {patientRowFromServer} from 'src/features/patients/activity';
import type {PatientsStackParamList} from 'src/navigation/types';
import {tr} from 'src/i18n';
import {localDigits} from 'src/i18n/format';
import {patientsText} from 'src/i18n/strings/patients';
import {api} from 'src/services/api';
import {useCounts} from './useCounts';
import {useInfiniteList} from './useInfiniteList';
import {useNow} from './useNow';
import {useRefreshOnFocus} from './useRefreshOnFocus';

// Typing pauses this long before the server is searched, so a fast typist makes
// one request, not one per keystroke.
const SEARCH_DEBOUNCE_MS = 300;

export const usePatientListViewModel = () => {
  const navigation =
    useNavigation<StackNavigationProp<PatientsStackParamList, 'PatientList'>>();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const now = useNow();
  const counts = useCounts();
  const t = tr(patientsText);

  useEffect(() => {
    const q = query.trim();
    const id = setTimeout(() => setDebounced(q), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [query]);

  // One page (10) of patients from the server, re-fetched when the search changes.
  const fetchPage = useCallback(
    (cursor: string | null) => api.listPatients({q: debounced, cursor}),
    [debounced],
  );
  const list = useInfiniteList(fetchPage, [debounced]);
  useRefreshOnFocus(list.refresh);

  const rows = useMemo(
    () => list.items.map(p => patientRowFromServer(p, now)),
    [list.items, now],
  );

  const total = counts?.patients ?? 0;
  return {
    t,
    // Until the first count arrives, show the number loaded so far.
    countLabel: t.patientCount(
      localDigits(counts ? total : rows.length),
      total === 1,
    ),
    query,
    setQuery,
    rows,
    status: list.status,
    error: list.error,
    refreshing: list.refreshing,
    loadingMore: list.loadingMore,
    onEndReached: list.loadMore,
    onRefresh: list.refresh,
    emptyText: debounced ? t.noMatch(debounced) : t.noPatients,
    openPatient: (patientId: string) =>
      navigation.navigate('PatientProfile', {patientId}),
  };
};
