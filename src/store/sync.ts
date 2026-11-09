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

// Replaces everything in memory with the server's data.
export const applySync = (payload: SyncPayload) => {
  applyDoctor(payload.doctor);
  useClinicStore.setState({
    patients: payload.patients,
    appointments: payload.appointments,
    entries: payload.entries.map(e => toEntry(e)),
  });
};

let inFlight: Promise<void> | null = null;

// Pulls everything from the server. Concurrent calls share one run. A failed
// refresh keeps what is already on screen; a failed first load shows Retry.
export const syncAll = () => {
  inFlight ??= (async () => {
    const first = useSyncStore.getState().status !== 'ready';
    if (first) {
      useSyncStore.setState({status: 'loading', error: ''});
    }
    try {
      applySync(await api.sync());
      useSyncStore.setState({status: 'ready'});
    } catch (e) {
      if (first) {
        useSyncStore.setState({status: 'error', error: errorMessage(e)});
      }
      throw e;
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
};

// Logging out (or another doctor logging in) drops everything held in memory.
export const clearData = () => {
  useClinicStore.setState({patients: [], appointments: [], entries: []});
  useDoctorStore.setState({profile: EMPTY_PROFILE});
  useSyncStore.setState({status: 'idle', error: ''});
};
