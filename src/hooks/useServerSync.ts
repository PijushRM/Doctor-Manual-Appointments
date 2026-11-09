import {useEffect} from 'react';
import {AppState} from 'react-native';
import {useAuthStore} from 'src/store/useAuthStore';
import {syncAll} from 'src/store/sync';

// Pulls the latest from the server at launch and whenever the app comes back
// to the foreground (another phone, or the web, may have changed things).
// Failures are quiet: the cached data stays on screen.
export const useServerSync = () => {
  const isLoggedIn = useAuthStore(s => s.isLoggedIn);
  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
    syncAll().catch(() => {});
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        syncAll().catch(() => {});
      }
    });
    return () => sub.remove();
  }, [isLoggedIn]);
};
