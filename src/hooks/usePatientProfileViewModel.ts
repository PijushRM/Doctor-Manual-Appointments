import {useCallback, useState} from 'react';
import {Alert} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {appointmentMessage} from 'src/features/appointments/message';
import {
  appointmentDayTime,
  formatWhen,
  nextVisit,
  patientEvents,
} from 'src/features/patients/activity';
import {initials, splitSurname} from 'src/features/patients/patients';
import {addedMessage} from 'src/features/patients/recordEntry';
import type {PatientsStackParamList} from 'src/navigation/types';
import {sendAppointmentSms} from 'src/services/appointmentSms';
import {openFile} from 'src/services/fileService';
import {tr} from 'src/i18n';
import {formatDate, localDigits} from 'src/i18n/format';
import {patientsText} from 'src/i18n/strings/patients';
import {useClinicStore} from 'src/store/useClinicStore';
import {useDoctorStore} from 'src/store/useDoctorStore';
import type {StoredFile} from 'src/types/clinic';
import {useNow} from './useNow';
import {showError} from 'src/utils/showError';
import {patientActionsText} from 'src/i18n/strings/patientActions';

type Route = RouteProp<PatientsStackParamList, 'PatientProfile'>;

export const usePatientProfileViewModel = () => {
  const navigation =
    useNavigation<
      StackNavigationProp<PatientsStackParamList, 'PatientProfile'>
    >();
  const {patientId, addedEntryId} = useRoute<Route>().params;
  const patient = useClinicStore(s => s.patients.find(p => p.id === patientId));
  const allAppointments = useClinicStore(s => s.appointments);
  const allEntries = useClinicStore(s => s.entries);
  const doctor = useDoctorStore(s => s.profile);
  const now = useNow();
  // Per appointment, while this screen is open: an SMS on its way or sent.
  const [sms, setSms] = useState<Record<string, 'sending' | 'sent'>>({});
  // The appointment whose options sheet is open, and one being updated.
  const [menuKey, setMenuKey] = useState<string>();
  const [updating, setUpdating] = useState<string>();
  const setAbsent = useClinicStore(s => s.setAbsent);

  // The banner and "New" tag last until the doctor leaves the profile. Kept as
  // local state: clearing the route param would fail once the screen is popped.
  const [dismissedId, setDismissedId] = useState<string>();
  useFocusEffect(
    useCallback(() => () => setDismissedId(addedEntryId), [addedEntryId]),
  );
  const freshId = addedEntryId !== dismissedId ? addedEntryId : undefined;

  if (!patient) {
    return null;
  }

  const appointments = allAppointments.filter(a => a.patientId === patientId);
  const entries = allEntries.filter(e => e.patientId === patientId);
  const added = entries.find(e => e.id === freshId);
  const next = nextVisit(appointments, now);
  const t = tr(patientsText);

  const markSms = (id: string, status?: 'sending' | 'sent') =>
    setSms(({[id]: _, ...rest}) => (status ? {...rest, [id]: status} : rest));

  const sendSms = async (appointmentId: string) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) {
      return;
    }
    const message = appointmentMessage({
      patientName: patient.name,
      startsAt: new Date(appointment.startsAt),
      doctorName: doctor.name,
      clinicName: doctor.clinicName,
      clinicPhone: doctor.phone,
    });
    markSms(appointmentId, 'sending');
    const sent = await sendAppointmentSms(patient.phone, message, () =>
      markSms(appointmentId, 'sent'),
    );
    markSms(appointmentId, sent ? 'sent' : undefined);
  };

  // A real SMS goes out from the doctor's SIM, so a small icon asks first.
  const confirmSms = (appointmentId: string, when: string) =>
    Alert.alert(
      t.smsConfirmTitle(patient.name.split(' ')[0]),
      t.smsConfirmBody(when, patient.phone),
      [
        {text: t.cancel, style: 'cancel'},
        {
          text: t.sendSms,
          onPress: () => {
            sendSms(appointmentId).catch(e => {
              markSms(appointmentId);
              showError(t.smsFailed, e);
            });
          },
        },
      ],
      {cancelable: true},
    );

  const a = tr(patientActionsText);
  const toggleAbsent = (appointmentId: string, absent: boolean) => {
    setUpdating(appointmentId);
    setAbsent(appointmentId, absent)
      .catch(e => showError(a.absentFailed, e))
      .finally(() => setUpdating(undefined));
  };

  const events = patientEvents(patient, appointments, entries, now).map(e => ({
    ...e,
    when: e.key === freshId ? t.justNow : formatWhen(e.at, now),
    isNew: e.key === freshId,
    sms: e.appointmentId
      ? {
          status: sms[e.appointmentId] ?? ('idle' as const),
          send: () => {
            const x = appointments.find(y => y.id === e.appointmentId);
            if (x) {
              confirmSms(x.id, appointmentDayTime(new Date(x.startsAt)));
            }
          },
        }
      : undefined,
    // Upcoming bookings can be moved to another time.
    changeTime: e.appointmentId
      ? () =>
          navigation.navigate('RescheduleAppointment', {
            appointmentId: e.appointmentId!,
          })
      : undefined,
    // Appointment rows (upcoming, visit or absent) have an options sheet.
    busy: !!e.attendance && updating === e.attendance.appointmentId,
    openMenu: e.attendance ? () => setMenuKey(e.key) : undefined,
    toggleAbsent: e.attendance
      ? () => toggleAbsent(e.attendance!.appointmentId, !e.attendance!.absent)
      : undefined,
  }));

  // The open options sheet: what can be done with that appointment.
  const menuEvent = events.find(e => e.key === menuKey && e.attendance);
  const close = () => setMenuKey(undefined);
  const menu = menuEvent?.attendance && {
    title: menuEvent.detail ?? menuEvent.title,
    options: [
      ...(menuEvent.changeTime
        ? [
            {
              key: 'time',
              label: a.changeTime,
              hint: '',
              danger: false,
              run: menuEvent.changeTime,
            },
          ]
        : []),
      menuEvent.attendance.absent
        ? {
            key: 'came',
            label: a.undoAbsent,
            hint: a.undoAbsentHint,
            danger: false,
            run: menuEvent.toggleAbsent!,
          }
        : {
            key: 'absent',
            label: a.markAbsent,
            hint: a.markAbsentHint,
            danger: true,
            run: menuEvent.toggleAbsent!,
          },
    ].map(o => ({
      ...o,
      run: () => {
        close();
        o.run();
      },
    })),
    close,
  };

  return {
    t,
    a,
    menu,
    editPatient: () => navigation.navigate('EditPatient', {patientId}),
    bookNext: () => navigation.navigate('BookAppointment', {patientId}),
    initials: initials(patient.name),
    firstName: patient.name.split(' ')[0],
    // The design colours the surname: "Amit [Das]".
    ...splitSurname(patient.name),
    // Gender isn't collected on New Appointment, so it's left out here.
    facts: t.facts(
      localDigits(patient.age),
      formatDate(new Date(patient.createdAt), 'MMM yyyy'),
    ),
    phone: patient.phone,
    email: patient.email,
    nextVisit: next ? appointmentDayTime(next) : t.noneBooked,
    addedBanner: added && addedMessage(added, patient.name),
    events,
    open: (file: StoredFile) =>
      openFile(file).catch(e => showError(t.openFileFailed, e)),
    back: navigation.goBack,
    upload: () =>
      navigation.navigate('UploadNote', {patientId, mode: 'upload'}),
    addNote: () => navigation.navigate('UploadNote', {patientId, mode: 'note'}),
  };
};
