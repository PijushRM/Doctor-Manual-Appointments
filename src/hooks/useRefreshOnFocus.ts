import {useCallback, useRef} from 'react';
import {useFocusEffect} from '@react-navigation/native';

// Reloads a list when its screen is returned to (e.g. after booking or editing
// elsewhere), so it isn't stale. Skips the first focus, since the list already
// loads on mount.
export const useRefreshOnFocus = (refresh: () => void) => {
  const first = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (first.current) {
        first.current = false;
        return;
      }
      refresh();
    }, [refresh]),
  );
};
