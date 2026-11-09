import {API_TIMEOUT_MS, API_URL, UPLOAD_TIMEOUT_MS} from 'src/configs/api';
import {tr} from 'src/i18n';
import {errorText} from 'src/i18n/strings/errors';
import {AppError} from 'src/utils/errors';
import type {
  Appointment,
  DocType,
  NewPatient,
  Patient,
  RecordEntry,
  StoredFile,
} from 'src/types/clinic';

// Field-level messages from the server, e.g. {"patient.phone": "Enter a valid…"}.
export type FieldErrors = Record<string, string>;

// `message` is always written for the doctor (see messageFor), so screens can
// show it as is.
export class ApiError extends AppError {
  constructor(
    // 0 = no response (offline, timeout, server down).
    public status: number,
    message: string,
    public details?: FieldErrors,
  ) {
    super(message);
    this.name = 'ApiError';
  }
  get offline() {
    return this.status === 0;
  }
}

// Set by the auth store, so this module doesn't import it (no cycle).
let getToken: () => string | null = () => null;
let onUnauthorized: () => void = () => {};
export const configureApi = (config: {
  getToken: () => string | null;
  onUnauthorized: () => void;
}) => {
  getToken = config.getToken;
  onUnauthorized = config.onUnauthorized;
};

export const authHeader = (): Record<string, string> => {
  const token = getToken();
  return token ? {Authorization: `Bearer ${token}`} : {};
};

type Options = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  json?: unknown;
  form?: FormData;
  auth?: boolean;
  timeoutMs?: number;
};

export async function request<T>(path: string, options: Options = {}) {
  const {method = 'GET', json, form, auth = true} = options;
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? API_TIMEOUT_MS,
  );
  // Typed loosely: React Native's and Bun's (tests) fetch types disagree.
  const init = {
    method,
    headers: {
      Accept: 'application/json',
      ...(json !== undefined && {'Content-Type': 'application/json'}),
      ...(auth ? authHeader() : {}),
    },
    body: form ?? (json !== undefined ? JSON.stringify(json) : undefined),
    signal: controller.signal,
  } as RequestInit;
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, init);
  } catch {
    // Aborted = our own timeout; anything else = no connection.
    const t = tr(errorText);
    throw new ApiError(0, controller.signal.aborted ? t.timeout : t.offline);
  } finally {
    clearTimeout(timer);
  }

  // Only JSON is read: a proxy, tunnel or crashed server can answer with an
  // HTML page, which must not reach the screens.
  const isJson = response.headers
    .get('content-type')
    ?.includes('application/json');
  const body = (isJson ? await response.json().catch(() => null) : null) as {
    error?: string;
    details?: FieldErrors;
  } | null;
  if (!response.ok) {
    if (response.status === 401 && auth) {
      onUnauthorized();
    }
    throw new ApiError(
      response.status,
      messageFor(response.status, body, auth),
      body?.details,
    );
  }
  if (body === null) {
    throw new ApiError(response.status, tr(errorText).unexpected);
  }
  return body as unknown as T;
}

// The doctor-facing message for a failed request. The server's own message
// is used for problems with what was sent (4xx); server faults (5xx) get a
// plain message instead of the server's technical text.
export const messageFor = (
  status: number,
  body: {error?: string; details?: FieldErrors} | null,
  auth = true,
): string => {
  const t = tr(errorText);
  // Field messages come from the server, which writes them in English.
  const fromServer =
    Object.values(body?.details ?? {})[0] || body?.error || undefined;
  if (status === 401 && auth) {
    return t.sessionExpired;
  }
  if (status === 403) {
    return t.forbidden;
  }
  if (status === 404) {
    return fromServer ?? t.notFound;
  }
  if (status === 408 || status === 504) {
    return t.timeout;
  }
  if (status === 415) {
    return t.unsupportedFile;
  }
  if (status === 413) {
    return t.tooLargeForServer;
  }
  if (status === 429) {
    return t.tooManyAttempts;
  }
  if (status === 502 || status === 503) {
    return t.unavailable;
  }
  if (status >= 500) {
    return t.server;
  }
  return fromServer ?? t.checkDetails;
};

// ---- Server shapes (see the backend's src/models) ----

export type ServerFile = {
  fileId: string;
  name: string;
  size: number;
  mimeType: string;
  url: string;
};
export type ServerEntry = Omit<RecordEntry, 'file'> & {file: ServerFile | null};
export type ServerDoctor = {
  id: string;
  identifier: string;
  name: string;
  qualifications: string;
  speciality: string;
  email: string;
  phone: string;
  clinicName: string;
  opens: number;
  closes: number;
  workingDays: boolean[];
  photoUrl: string;
  alerts: boolean;
};
export type SyncPayload = {
  doctor: ServerDoctor;
  patients: Patient[];
  appointments: Appointment[];
  entries: ServerEntry[];
};

// A server file as the app's StoredFile. `uri` is only set on a file picked for
// upload; server files open through `fileId`.
export const toStoredFile = (file: ServerFile): StoredFile => ({
  uri: '',
  name: file.name,
  size: file.size,
  mimeType: file.mimeType,
  fileId: file.fileId,
});

export const toEntry = (entry: ServerEntry): RecordEntry => ({
  ...entry,
  file: entry.file && toStoredFile(entry.file),
});

// React Native's FormData takes {uri, name, type} for a file part.
const filePart = (file: StoredFile) =>
  ({uri: file.uri, name: file.name, type: file.mimeType} as unknown as Blob);

// ---- Endpoints ----

type Session = {token: string; doctor: ServerDoctor};

export const api = {
  login: (identifier: string, password: string) =>
    request<Session>('/api/auth/login', {
      method: 'POST',
      json: {identifier, password},
      auth: false,
    }),
  register: (identifier: string, password: string) =>
    request<Session>('/api/auth/register', {
      method: 'POST',
      json: {identifier, password},
      auth: false,
    }),
  changePassword: (current: string, next: string, confirm: string) =>
    request<{ok: true; token: string}>('/api/auth/change-password', {
      method: 'POST',
      json: {current, next, confirm},
    }),

  sync: () => request<SyncPayload>('/api/sync'),

  addPatient: (patient: NewPatient) =>
    request<{data: Patient; created: boolean}>('/api/patients', {
      method: 'POST',
      json: {
        name: patient.name,
        age: patient.age,
        phone: patient.phone,
        email: patient.email,
      },
    }),

  updateProfile: (changes: Partial<Omit<ServerDoctor, 'id' | 'photoUrl'>>) =>
    request<{doctor: ServerDoctor}>('/api/doctor/profile', {
      method: 'PATCH',
      json: changes,
    }),
  uploadPhoto: (photo: StoredFile) => {
    const form = new FormData();
    form.append('photo', filePart(photo));
    return request<{doctor: ServerDoctor}>('/api/doctor/photo', {
      method: 'PUT',
      form,
      timeoutMs: UPLOAD_TIMEOUT_MS,
    });
  },

  bookAppointment: (
    startsAt: Date,
    who: {patientId: string} | {patient: NewPatient},
  ) =>
    request<{
      data: {
        appointment: Appointment;
        patient: Patient;
        patientCreated: boolean;
      };
      warnings: {overlaps: string[]; inPast: boolean};
    }>('/api/appointments', {
      method: 'POST',
      json: {startsAt: startsAt.toISOString(), ...who},
    }),

  addRecord: (
    patientId: string,
    entry: {docType: DocType | null; file: StoredFile | null; note: string},
  ) => {
    const form = new FormData();
    form.append('type', entry.docType ?? 'note');
    form.append('note', entry.note);
    if (entry.file) {
      form.append('file', filePart(entry.file));
    }
    return request<{data: ServerEntry}>(
      `/api/patients/${encodeURIComponent(patientId)}/records`,
      {method: 'POST', form, timeoutMs: UPLOAD_TIMEOUT_MS},
    );
  },

  // A 5-minute link that opens the file without a login header.
  fileLink: async (fileId: string) => {
    const {url} = await request<{url: string}>(
      `/api/files/${encodeURIComponent(fileId)}/link`,
    );
    return `${API_URL}${url}`;
  },
};

// For <Image source>: a server file with the login header attached.
export const serverImage = (path: string) => ({
  uri: `${API_URL}${path}`,
  headers: authHeader(),
});
