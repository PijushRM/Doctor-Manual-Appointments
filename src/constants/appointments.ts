// Minutes from midnight.
export type ClinicHours = {opens: number; closes: number};

// A new doctor's clinic hours until they change them on Edit Profile.
export const DEFAULT_CLINIC_HOURS: ClinicHours = {
  opens: 9 * 60,
  closes: 18 * 60,
};

// Two bookings closer than this overlap (the design's red warning).
export const CLASH_WINDOW_MINUTES = 30;

// "Free soon" chips: the next few open quarter-hours.
export const QUICK_PICK_STEP_MINUTES = 15;
export const QUICK_PICK_COUNT = 3;

export const DATE_STRIP_DAYS = 7;
