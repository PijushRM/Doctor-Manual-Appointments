import {useEffect} from 'react';
import {AppState} from 'react-native';
import {useAuthStore} from 'src/store/useAuthStore';
import {syncAll} from 'src/store/sync';

// Loads everything from the server at launch and again whenever the app comes
// back to the foreground (another phone, or the web, may have changed things).
// A failed first load shows the "Couldn't load" screen; a failed refresh is
// quiet and keeps what is already on screen.
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
