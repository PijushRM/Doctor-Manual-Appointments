import {useCallback, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {addDays, startOfDay, startOfWeek} from 'date-fns';
import {api, type Counts} from 'src/services/api';
import {logger} from 'src/utils/logger';

// The Home badges and Profile cards read their numbers from /api/stats instead
// of the whole dataset. Boundaries are the phone's local day/week, so the counts
// match what the lists group by. Refreshes whenever the screen comes into focus.
export const useCounts = (): Counts | null => {
  const [counts, setCounts] = useState<Counts | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const now = new Date();
      const dayStart = startOfDay(now);
      const weekStart = startOfWeek(now, {weekStartsOn: 1});
      api
        .stats({
          dayStart,
          dayEnd: addDays(dayStart, 1),
          weekStart,
          weekEnd: addDays(weekStart, 7),
        })
        .then(r => {
          if (active) {setCounts(r.data);}
        })
        .catch(e => logger.warn('stats', 'Couldn’t load counts', e));
      return () => {
        active = false;
      };
    }, []),
  );

  return counts;
};
