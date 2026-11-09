import {create} from 'zustand';
import {
  api,
  toEntry,
  type ServerDoctor,
  type SyncPayload,
} from 'src/services/api';
import {
  EMPTY_PROFILE,
  fromServer,
  useDoctorStore,
} from 'src/store/useDoctorStore';
import {useClinicStore} from 'src/store/useClinicStore';
import {errorMessage} from 'src/utils/errors';
import {currentSession, endSession, savesSoFar} from './session';

// Nothing is saved on the phone: every screen shows what the server last sent,
// held in memory only. `status` covers the first load after launch or login,
// so screens never show "no patients" before the server has answered.
type SyncState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string; // why the first load failed, for the Retry screen
};

export const useSyncStore = create<SyncState>()(() => ({
  status: 'idle',
  error: '',
}));

export const applyDoctor = (doctor: ServerDoctor) =>
  useDoctorStore.setState({profile: fromServer(doctor)});

// Server items first, then any on screen the server copy doesn't have yet.
const withNewer = <T extends {id: string}>(server: T[], current: T[]) => {
  const ids = new Set(server.map(x => x.id));
  return [...server, ...current.filter(x => !ids.has(x.id))];
};

// Replaces everything in memory with the server's data. `keepNewer`: a save
// finished while this copy was on its way, so keep what was just saved (the
// app never deletes, so anything on screen but not in the copy is newer).
export const applySync = (payload: SyncPayload, keepNewer = false) => {
  if (!keepNewer) {
    applyDoctor(payload.doctor);
  }
  useClinicStore.setState(s => {
    const entries = payload.entries.map(e => toEntry(e));
    return keepNewer
      ? {
          patients: withNewer(payload.patients, s.patients),
          appointments: withNewer(payload.appointments, s.appointments),
          entries: withNewer(entries, s.entries),
        }
      : {
          patients: payload.patients,
          appointments: payload.appointments,
          entries,
        };
  });
};

let inFlight: Promise<void> | null = null;

// Pulls everything from the server. Concurrent calls share one run. A failed
// refresh keeps what is already on screen; a failed first load shows Retry.
export const syncAll = () => {
  inFlight ??= (async () => {
    const session = currentSession();
    const saves = savesSoFar();
    const first = useSyncStore.getState().status !== 'ready';
    if (first) {
      useSyncStore.setState({status: 'loading', error: ''});
    }
    try {
      const payload = await api.sync();
      // Logged out (or another doctor logged in) meanwhile: not theirs.
      if (session !== currentSession()) {
        return;
      }
      applySync(payload, saves !== savesSoFar());
      useSyncStore.setState({status: 'ready'});
    } catch (e) {
      if (first && session === currentSession()) {
        useSyncStore.setState({status: 'error', error: errorMessage(e)});
      }
      throw e;
    } finally {
      // After a logout this slot may already hold the next doctor's sync.
      if (session === currentSession()) {
        inFlight = null;
      }
    }
  })();
  return inFlight;
};

// Logging out (or another doctor logging in) drops everything held in memory,
// and any request still on its way is ignored when it lands.
export const clearData = () => {
  endSession();
  inFlight = null;
  useClinicStore.setState({patients: [], appointments: [], entries: []});
  useDoctorStore.setState({profile: EMPTY_PROFILE});
  useSyncStore.setState({status: 'idle', error: ''});
};
