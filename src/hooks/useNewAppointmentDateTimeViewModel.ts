import {useState} from 'react';
import {
  useNavigation,
  useRoute,
  type CompositeNavigationProp,
  type RouteProp,
} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {format, isSameDay, startOfDay} from 'date-fns';
import {busyDayKeys} from 'src/features/appointments/calendar';
import {
  atMinutes,
  bookedMinutes,
  clashes,
  dateStrip,
  formatTime,
  freeSoon,
  initialSlot,
  minutesOfDay,
} from 'src/features/appointments/schedule';
import type {
  AppointmentsStackParamList,
  RootStackParamList,
} from 'src/navigation/types';
import {useClinicStore} from 'src/store/useClinicStore';
import {useDoctorStore} from 'src/store/useDoctorStore';
import {showError} from 'src/utils/showError';

type Navigation = CompositeNavigationProp<
  StackNavigationProp<AppointmentsStackParamList, 'NewAppointmentDateTime'>,
  StackNavigationProp<RootStackParamList>
>;

export const useNewAppointmentDateTimeViewModel = () => {
  const navigation = useNavigation<Navigation>();
  const {patient} =
    useRoute<RouteProp<AppointmentsStackParamList, 'NewAppointmentDateTime'>>()
      .params;
  const appointments = useClinicStore(s => s.appointments);
  const addAppointment = useClinicStore(s => s.addAppointment);
  // "Free soon" stays inside the clinic hours set on Edit Profile.
  const opens = useDoctorStore(s => s.profile.opens);
  const closes = useDoctorStore(s => s.profile.closes);
  const workingDays = useDoctorStore(s => s.profile.workingDays);
  const hours = {opens, closes};

  const [slot, setSlot] = useState(() =>
    initialSlot(appointments, new Date(), hours, workingDays),
  );
  const {day, minutes} = slot;
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const now = new Date();
  const isToday = isSameDay(day, now);
  const booked = bookedMinutes(appointments, day);
  const inPast = isToday && minutes <= minutesOfDay(now);
  const clash = clashes(booked, minutes);
  // Booking a closed day stays possible (an emergency); it just says so.
  const closed = !workingDays[day.getDay()];
  const after = isToday ? Math.max(minutes, minutesOfDay(now)) : minutes;

  const note = (() => {
    if (inPast) {
      return `${formatTime(minutes)} has already passed — pick a later time.`;
    }
    if (clash) {
      return `${formatTime(minutes)} overlaps a booking — pick another time.`;
    }
    if (closed) {
      return `Clinic is closed on ${format(day, 'EEEE')}s.`;
    }
    return booked.length
      ? `Booked this day: ${booked.map(formatTime).join(', ')}`
      : 'No bookings yet this day.';
  })();

  return {
    monthLabel: format(day, 'MMMM yyyy'),
    calendarOpen,
    busyDays: busyDayKeys(appointments),
    selectedDay: day,
    openCalendar: () => setCalendarOpen(true),
    closeCalendar: () => setCalendarOpen(false),
    pickCalendarDay: (date: Date) => {
      setSlot(s => ({...s, day: startOfDay(date)}));
      setCalendarOpen(false);
    },
    dates: dateStrip(day, now).map(date => ({
      key: date.toISOString(),
      weekday: format(date, 'EEE'),
      dayOfMonth: format(date, 'd'),
      label: format(date, 'EEEE d MMMM'),
      selected: isSameDay(date, day),
      pick: () => setSlot(s => ({...s, day: startOfDay(date)})),
    })),
    minutes,
    setMinutes: (next: number) => setSlot(s => ({...s, minutes: next})),
    quickPicks: (closed ? [] : freeSoon(booked, after, hours)).map(t => ({
      label: formatTime(t),
      pick: () => setSlot(s => ({...s, minutes: t})),
    })),
    note,
    noteIsWarning: inPast || clash,
    summary: `${format(day, 'EEE, d MMM yyyy')} · ${formatTime(minutes)}`,
    back: navigation.goBack,
    saving,
    // Overlaps only warn: the doctor may double-book on purpose.
    save: () => {
      if (saving) {
        return;
      }
      setSaving(true);
      addAppointment(patient, atMinutes(day, minutes))
        .then(({id: appointmentId}) => {
          setSaving(false);
          navigation.navigate('AppointmentSaved', {appointmentId});
          // Fresh, empty Part 1 for "Add another appointment".
          navigation.reset({
            index: 0,
            routes: [{name: 'NewAppointmentDetails'}],
          });
        })
        .catch(e => {
          setSaving(false);
          showError('Couldn’t save the appointment', e);
        });
    },
  };
};
