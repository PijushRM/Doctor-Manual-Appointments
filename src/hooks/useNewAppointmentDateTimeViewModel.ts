import {useState} from 'react';
import {Alert} from 'react-native';
import {
  useNavigation,
  useRoute,
  type CompositeNavigationProp,
  type RouteProp,
} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {isSameDay, startOfDay} from 'date-fns';
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
import {appointmentMessage} from 'src/features/appointments/message';
import {appointmentDayTime} from 'src/features/patients/activity';
import type {
  AppointmentsStackParamList,
  PatientsStackParamList,
  RootStackParamList,
} from 'src/navigation/types';
import {sendAppointmentSms} from 'src/services/appointmentSms';
import {useClinicStore} from 'src/store/useClinicStore';
import {useDoctorStore} from 'src/store/useDoctorStore';
import {showError} from 'src/utils/showError';
import {tr} from 'src/i18n';
import {formatDate} from 'src/i18n/format';
import {appointmentsText} from 'src/i18n/strings/appointments';
import {rescheduleText} from 'src/i18n/strings/reschedule';
import type {Appointment, Patient} from 'src/types/clinic';

type Navigation = CompositeNavigationProp<
  StackNavigationProp<AppointmentsStackParamList, 'NewAppointmentDateTime'>,
  StackNavigationProp<RootStackParamList>
>;

// The same screen books a new appointment (New Appointment, part 2), moves
// an existing one (Change time), or books the next one for a patient already
// on the list (Book next appointment), both from the patient's profile.
type Params =
  | AppointmentsStackParamList['NewAppointmentDateTime']
  | PatientsStackParamList['RescheduleAppointment']
  | PatientsStackParamList['BookAppointment'];

const slotOf = (appointment: Appointment) => {
  const at = new Date(appointment.startsAt);
  return {day: startOfDay(at), minutes: minutesOfDay(at)};
};

// After a time change: offer to text the patient the new time.
const offerSms = (
  patient: Patient,
  startsAt: Date,
  doctor: {name: string; clinicName: string; phone: string},
) => {
  const r = tr(rescheduleText);
  Alert.alert(
    r.movedTitle,
    r.movedBody(patient.name.split(' ')[0], appointmentDayTime(startsAt)),
    [
      {text: r.notNow, style: 'cancel'},
      {
        text: r.sendSms,
        onPress: () => {
          const message = appointmentMessage({
            patientName: patient.name,
            startsAt,
            doctorName: doctor.name,
            clinicName: doctor.clinicName,
            clinicPhone: doctor.phone,
            moved: true,
          });
          sendAppointmentSms(patient.phone, message, () => {}).catch(e =>
            showError(r.smsFailed, e),
          );
        },
      },
    ],
    {cancelable: true},
  );
};

export const useNewAppointmentDateTimeViewModel = () => {
  const navigation = useNavigation<Navigation>();
  const params = useRoute<RouteProp<{DateTime: Params}, 'DateTime'>>().params;
  const movingId = 'appointmentId' in params ? params.appointmentId : undefined;
  const allAppointments = useClinicStore(s => s.appointments);
  const moving = allAppointments.find(a => a.id === movingId);
  const forPatientId = 'patientId' in params ? params.patientId : undefined;
  const movingPatient = useClinicStore(s =>
    s.patients.find(p => p.id === (moving?.patientId ?? forPatientId)),
  );
  // Moving one: it mustn't count as a clash with itself.
  const appointments = movingId
    ? allAppointments.filter(a => a.id !== movingId)
    : allAppointments;
  const addAppointment = useClinicStore(s => s.addAppointment);
  const bookForPatient = useClinicStore(s => s.bookForPatient);
  const rescheduleAppointment = useClinicStore(s => s.rescheduleAppointment);
  const doctor = useDoctorStore(s => s.profile);
  // "Free soon" stays inside the clinic hours set on Edit Profile.
  const opens = useDoctorStore(s => s.profile.opens);
  const closes = useDoctorStore(s => s.profile.closes);
  const workingDays = useDoctorStore(s => s.profile.workingDays);
  const hours = {opens, closes};

  // Moving one starts at its current time; a new one at the first free slot.
  const [slot, setSlot] = useState(() =>
    moving
      ? slotOf(moving)
      : initialSlot(appointments, new Date(), hours, workingDays),
  );
  const {day, minutes} = slot;
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const now = new Date();
  const isToday = isSameDay(day, now);
  const booked = bookedMinutes(appointments, day);
  // A day before today counts too: the screen may stay open past midnight.
  const inPast =
    day < startOfDay(now) || (isToday && minutes <= minutesOfDay(now));
  const clash = clashes(booked, minutes);
  // Booking a closed day stays possible (an emergency); it just says so.
  const closed = !workingDays[day.getDay()];
  const after = isToday ? Math.max(minutes, minutesOfDay(now)) : minutes;
  const t = tr(appointmentsText);
  const r = tr(rescheduleText);

  const note = (() => {
    if (inPast) {
      return t.notePassed(formatTime(minutes));
    }
    if (clash) {
      return t.noteClash(formatTime(minutes));
    }
    if (closed) {
      return t.noteClosed(formatDate(day, 'EEEE'));
    }
    return booked.length
      ? t.noteBooked(booked.map(formatTime).join(', '))
      : t.noteNone;
  })();

  const saveNew = (
    patient: AppointmentsStackParamList['NewAppointmentDateTime']['patient'],
  ) =>
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
        showError(t.saveFailed, e);
      });

  const saveForPatient = (patientId: string) =>
    bookForPatient(patientId, atMinutes(day, minutes))
      .then(({id: appointmentId}) => {
        setSaving(false);
        // Back to the profile, then the usual "Appointment saved" (send SMS).
        navigation.goBack();
        navigation.navigate('AppointmentSaved', {appointmentId});
      })
      .catch(e => {
        setSaving(false);
        showError(t.saveFailed, e);
      });

  const saveMove = (appointment: Appointment) => {
    const startsAt = atMinutes(day, minutes);
    if (startsAt.getTime() === new Date(appointment.startsAt).getTime()) {
      navigation.goBack(); // nothing changed
      return;
    }
    rescheduleAppointment(appointment.id, startsAt)
      .then(() => {
        setSaving(false);
        navigation.goBack();
        if (movingPatient) {
          offerSms(movingPatient, startsAt, doctor);
        }
      })
      .catch(e => {
        setSaving(false);
        showError(r.saveFailed, e);
      });
  };

  return {
    mode: movingId
      ? ('move' as const)
      : forPatientId
      ? ('book' as const)
      : ('new' as const),
    // Its appointment or patient is no longer there (e.g. deleted): leave.
    gone: (!!movingId && !moving) || (!!forPatientId && !movingPatient),
    patientName: movingPatient?.name ?? '',
    currently: moving
      ? r.currentlyAt(appointmentDayTime(new Date(moving.startsAt)))
      : '',
    monthLabel: formatDate(day, 'MMMM yyyy'),
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
      weekday: formatDate(date, 'EEE'),
      dayOfMonth: formatDate(date, 'd'),
      label: formatDate(date, 'EEEE d MMMM'),
      selected: isSameDay(date, day),
      pick: () => setSlot(s => ({...s, day: startOfDay(date)})),
    })),
    minutes,
    setMinutes: (next: number) => setSlot(s => ({...s, minutes: next})),
    quickPicks: (closed ? [] : freeSoon(booked, after, hours)).map(free => ({
      label: formatTime(free),
      pick: () => setSlot(s => ({...s, minutes: free})),
    })),
    note,
    noteIsWarning: inPast || clash,
    summary: `${formatDate(day, 'EEE, d MMM yyyy')} · ${formatTime(minutes)}`,
    back: navigation.goBack,
    saving,
    // Overlaps only warn: the doctor may double-book on purpose.
    save: () => {
      if (saving) {
        return;
      }
      if ('patient' in params) {
        setSaving(true);
        saveNew(params.patient);
      } else if (forPatientId) {
        setSaving(true);
        saveForPatient(forPatientId);
      } else if (moving) {
        setSaving(true);
        saveMove(moving);
      }
    },
  };
};
