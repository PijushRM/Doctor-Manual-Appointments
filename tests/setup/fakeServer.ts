// A stand-in for the backend: replaces global fetch for one test.
export type Call = {
  method: string;
  path: string;
  json?: unknown;
  form?: Record<string, unknown>;
  auth?: string;
};
type Reply = {status?: number; json?: unknown} | 'offline';
type Handler = (call: Call) => Reply | undefined;

export const fakeServer = (handler: Handler) => {
  const calls: Call[] = [];
  globalThis.fetch = (async (url: string, init: RequestInit = {}) => {
    const headers = (init.headers ?? {}) as Record<string, string>;
    const call: Call = {
      method: init.method ?? 'GET',
      path: url.replace(/^https?:\/\/[^/]+/, ''),
      auth: headers.Authorization,
    };
    if (init.body instanceof FormData) {
      call.form = Object.fromEntries(init.body.entries());
    } else if (typeof init.body === 'string') {
      call.json = JSON.parse(init.body);
    }
    calls.push(call);
    const reply = handler(call) ?? {status: 404, json: {error: 'Not found'}};
    if (reply === 'offline') {
      throw new TypeError('Network request failed');
    }
    return new Response(JSON.stringify(reply.json ?? {}), {
      status: reply.status ?? 200,
      headers: {'Content-Type': 'application/json'},
    });
  }) as typeof fetch;
  return calls;
};

export const oid = (n: number) => n.toString(16).padStart(24, '0');

export const serverDoctor = (overrides: Record<string, unknown> = {}) => ({
  id: oid(1),
  identifier: 'dr@clinic.in',
  name: '',
  qualifications: '',
  speciality: '',
  email: 'dr@clinic.in',
  phone: '',
  clinicName: '',
  opens: 540,
  closes: 1080,
  workingDays: [false, true, true, true, true, true, true],
  photoUrl: '',
  alerts: false,
  ...overrides,
});

export const emptySync = (doctor = serverDoctor()) => ({
  doctor,
  patients: [],
  appointments: [],
  entries: [],
});
