import {addDays, setHours, setMinutes, startOfDay, subDays} from 'date-fns';
import type {Appointment, Patient} from 'src/types/clinic';
import {useClinicStore} from './useClinicStore';
import {useDoctorStore} from './useDoctorStore';

// The canvas's sample patients, dated relative to `now`. Debug builds only.
const DEMO: [
  name: string,
  age: number,
  dayOffset: number,
  time: string,
  isNew?: boolean,
][] = [
  ['Rahul Saha', 32, 0, '09:00'],
  ['Sreya Roy', 27, 0, '10:00'],
  ['Amit Das', 45, 0, '11:30'],
  ['Pooja Ghosh', 38, 0, '13:00'],
  ['Arindam Pal', 51, 0, '16:00'],
  ['Ankita Bose', 29, 1, '10:30', true],
  ['Sourav Mitra', 41, 1, '12:00'],
  ['Priya Sen', 34, 3, '09:30'],
  ['Debasish Roy', 60, -2, '17:00'],
  ['Moumita Dey', 23, -2, '11:00'],
];

export const buildDemoData = (now: Date) => {
  const patients: Patient[] = [];
  const appointments: Appointment[] = [];
  DEMO.forEach(([name, age, dayOffset, time, isNew], i) => {
    const id = `demo-${i}`;
    const [h, m] = time.split(':').map(Number);
    const day = addDays(startOfDay(now), dayOffset);
    const createdAt = (isNew ? now : subDays(now, 30)).toISOString();
    patients.push({
      id,
      name,
      age,
      phone: `+91 98300 000${String(i).padStart(2, '0')}`,
      email: `${name.split(' ')[0].toLowerCase()}@example.com`,
      createdAt,
    });
    appointments.push({
      id: `demo-appt-${i}`,
      patientId: id,
      startsAt: setMinutes(setHours(day, h), m).toISOString(),
      createdAt,
    });
  });
  const doctor = {
    name: 'Dr. Subhas Middya',
    qualifications: 'BDS, MDS',
    speciality: 'Conservative Dentistry',
    email: 'dr.subhas@smiledental.in',
    phone: '+91 98765 00000',
    clinicName: 'Smile Dental Clinic',
  };
  return {patients, appointments, doctor};
};

export const seedDemoDataIfEmpty = (now = new Date()) => {
  if (useClinicStore.getState().patients.length) {
    return;
  }
  const {patients, appointments, doctor} = buildDemoData(now);
  useClinicStore.setState({patients, appointments});
  useDoctorStore.setState(s => ({profile: {...s.profile, ...doctor}}));
};
