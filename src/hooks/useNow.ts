import {useEffect, useState} from 'react';
import {AppState} from 'react-native';

const TICK_MS = 60_000;

// The current time, refreshed every minute and whenever the app comes back to
// the foreground, so "Today", "Yesterday" and the header date stay right across
// midnight (tab screens stay mounted, so nothing else would redraw them).
export const useNow = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const tick = () => setNow(new Date());
    const timer = setInterval(tick, TICK_MS);
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        tick();
      }
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, []);
  return now;
};
