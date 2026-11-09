import {
  ApiError,
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
import type {Appointment, RecordEntry} from 'src/types/clinic';

// Server ids are MongoDB ObjectIds. Anything else was made on this phone
// before it talked to the server and still needs uploading.
export const isServerId = (id: string) => /^[a-f0-9]{24}$/.test(id);
const isDemo = (id: string) => id.startsWith('demo-');
const isPending = (id: string) => !isServerId(id) && !isDemo(id);

export const applyDoctor = (doctor: ServerDoctor) =>
  useDoctorStore.setState(s => ({
    // Keep the local photo copy only while it is still the server's photo
    // (or a local-only photo when the server has none).
    profile: fromServer(
      doctor,
      s.profile.photoUrl === doctor.photoUrl ? s.profile.photoUri : '',
    ),
  }));

// Replaces the cache with the server's data, keeping local file copies and
// anything not uploaded yet.
export const applySync = (payload: SyncPayload) => {
  applyDoctor(payload.doctor);
  useClinicStore.setState(s => {
    const localUri = new Map(
      s.entries.filter(e => e.file?.uri).map(e => [e.id, e.file!.uri]),
    );
    return {
      patients: [
        ...payload.patients,
        ...s.patients.filter(p => isPending(p.id)),
      ],
      appointments: [
        ...payload.appointments,
        ...s.appointments.filter(a => isPending(a.id)),
      ],
      entries: [
        ...payload.entries.map(e => toEntry(e, localUri.get(e.id))),
        ...s.entries.filter(e => isPending(e.id)),
      ],
    };
  });
};

let inFlight: Promise<void> | null = null;

// Uploads anything made offline, then pulls everything. Concurrent calls share one run.
export const syncAll = () => {
  inFlight ??= (async () => {
    try {
      await uploadLocalData();
      applySync(await api.sync());
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
};

// keepPending: records made before the server was used and not uploaded yet
// stay on the phone for the next login (the same doctor's data).
export const clearCache = ({keepPending = false} = {}) => {
  useClinicStore.setState(s => ({
    patients: keepPending ? s.patients.filter(p => isPending(p.id)) : [],
    appointments: keepPending
      ? s.appointments.filter(a => isPending(a.id))
      : [],
    entries: keepPending ? s.entries.filter(e => isPending(e.id)) : [],
  }));
  useDoctorStore.setState({profile: EMPTY_PROFILE});
};

// A 4xx means the server will never accept this item: drop it rather than
// retrying forever. No response (offline, 5xx) stops the run; it retries next sync.
const rejected = (e: unknown) =>
  e instanceof ApiError && e.status >= 400 && e.status < 500 && e.status !== 401;

const replace = <T extends {id: string}>(list: T[], oldId: string, item: T) =>
  list.map(x => (x.id === oldId ? item : x));

// One-time move of data saved before this app used the server.
export async function uploadLocalData() {
  const {patients, appointments, entries} = useClinicStore.getState();
  const set = useClinicStore.setState;

  for (const patient of patients.filter(p => isPending(p.id))) {
    try {
      const {data} = await api.addPatient(patient);
      set(s => ({
        // The server may match an existing patient: avoid a duplicate row.
        patients: s.patients.some(p => p.id === data.id)
          ? s.patients.filter(p => p.id !== patient.id)
          : replace(s.patients, patient.id, data),
        appointments: s.appointments.map(a =>
          a.patientId === patient.id ? {...a, patientId: data.id} : a,
        ),
        entries: s.entries.map(e =>
          e.patientId === patient.id ? {...e, patientId: data.id} : e,
        ),
      }));
    } catch (e) {
      if (!rejected(e)) {
        throw e;
      }
      set(s => ({patients: s.patients.filter(p => p.id !== patient.id)}));
    }
  }

  const pendingAppointments = appointments.filter(a => isPending(a.id));
  for (const old of pendingAppointments) {
    const patientId = useClinicStore
      .getState()
      .appointments.find(a => a.id === old.id)?.patientId;
    if (!patientId || !isServerId(patientId)) {
      continue; // its patient wasn't uploaded; nothing to attach it to
    }
    try {
      const {data} = await api.bookAppointment(new Date(old.startsAt), {
        patientId,
      });
      set(s => ({
        appointments: replace<Appointment>(
          s.appointments,
          old.id,
          data.appointment,
        ),
      }));
    } catch (e) {
      if (!rejected(e)) {
        throw e;
      }
      set(s => ({appointments: s.appointments.filter(a => a.id !== old.id)}));
    }
  }

  for (const old of entries.filter(e => isPending(e.id))) {
    const current = useClinicStore
      .getState()
      .entries.find(e => e.id === old.id);
    if (!current || !isServerId(current.patientId)) {
      continue;
    }
    try {
      const {data} = await api.addRecord(current.patientId, current);
      set(s => ({
        entries: replace<RecordEntry>(
          s.entries,
          old.id,
          toEntry(data, current.file?.uri),
        ),
      }));
    } catch (e) {
      if (!rejected(e)) {
        throw e;
      }
      set(s => ({entries: s.entries.filter(x => x.id !== old.id)}));
    }
  }
}

// First login after upgrading: a profile filled in on this phone moves to the
// server, unless the server already has one. Returns the doctor to apply.
export async function uploadLocalProfile(
  doctor: ServerDoctor,
): Promise<ServerDoctor> {
  const {photoUri, ...rest} = useDoctorStore.getState().profile;
  const local: Partial<typeof rest> = {...rest};
  delete local.photoUrl;
  if (doctor.name || !rest.name) {
    return doctor;
  }
  try {
    let updated = (await api.updateProfile(local)).doctor;
    if (photoUri) {
      updated = (
        await api.uploadPhoto({
          uri: photoUri,
          name: 'profile.jpg',
          size: 0,
          mimeType: 'image/jpeg',
        })
      ).doctor;
    }
    return updated;
  } catch {
    return doctor; // the local profile stays cached; edit it again to save
  }
}
