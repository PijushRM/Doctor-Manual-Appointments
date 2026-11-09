import {useState} from 'react';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {appointmentMessage} from 'src/features/appointments/message';
import {formatTime, minutesOfDay} from 'src/features/appointments/schedule';
import {initials} from 'src/features/patients/patients';
import type {RootStackParamList} from 'src/navigation/types';
import {openWhatsApp, shareMessage} from 'src/services/shareService';
import {sendAppointmentSms} from 'src/services/appointmentSms';
import {useClinicStore} from 'src/store/useClinicStore';
import {useDoctorStore} from 'src/store/useDoctorStore';
import {showError} from 'src/utils/showError';
import {tr} from 'src/i18n';
import {formatDate} from 'src/i18n/format';
import {appointmentsText} from 'src/i18n/strings/appointments';

export type Channel = 'sms' | 'whatsapp' | 'facebook';
type Status = 'idle' | 'sending' | 'sent';

// WhatsApp and Messenger are switched off for now: shown, but greyed out
// and not tappable. Set `enabled: true` to bring one back.
const CHANNELS: {key: Channel; enabled: boolean}[] = [
  {key: 'sms', enabled: true},
  {key: 'whatsapp', enabled: false},
  {key: 'facebook', enabled: false},
];

// Label and failure message for each channel, in the current language.
const channelText = (channel: Channel) => {
  const t = tr(appointmentsText);
  return {
    sms: {label: t.channelSms, failed: t.smsFailed},
    whatsapp: {label: t.channelWhatsApp, failed: t.whatsAppFailed},
    facebook: {label: t.channelFacebook, failed: t.shareFailed},
  }[channel];
};

export const useAppointmentSavedViewModel = () => {
  const navigation =
    useNavigation<
      StackNavigationProp<RootStackParamList, 'AppointmentSaved'>
    >();
  const {appointmentId} =
    useRoute<RouteProp<RootStackParamList, 'AppointmentSaved'>>().params;
  const appointment = useClinicStore(s =>
    s.appointments.find(a => a.id === appointmentId),
  );
  const patient = useClinicStore(s =>
    s.patients.find(p => p.id === appointment?.patientId),
  );
  const doctor = useDoctorStore(s => s.profile);
  const [status, setStatus] = useState<Record<Channel, Status>>({
    sms: 'idle',
    whatsapp: 'idle',
    facebook: 'idle',
  });

  if (!appointment || !patient) {
    return null;
  }

  const startsAt = new Date(appointment.startsAt);
  const message = appointmentMessage({
    patientName: patient.name,
    startsAt,
    doctorName: doctor.name,
    clinicName: doctor.clinicName,
    clinicPhone: doctor.phone,
  });
  const mark = (channel: Channel, next: Status) =>
    setStatus(s => ({...s, [channel]: next}));

  const send = async (channel: Channel) => {
    mark(channel, 'sending');
    if (channel === 'sms') {
      const sent = await sendAppointmentSms(patient.phone, message, () =>
        mark(channel, 'sent'),
      );
      if (!sent) {
        mark(channel, 'idle');
        return;
      }
    } else if (channel === 'whatsapp') {
      await openWhatsApp(patient.phone, message);
    } else {
      await shareMessage(message);
    }
    mark(channel, 'sent');
  };

  const t = tr(appointmentsText);
  return {
    patientName: patient.name,
    patientInitials: initials(patient.name),
    patientAge: t.years(String(patient.age)),
    details: [
      {
        label: t.dateTime,
        value: `${formatDate(startsAt, 'EEE, d MMM yyyy')} · ${formatTime(
          minutesOfDay(startsAt),
        )}`,
      },
      {label: t.phoneLabel, value: patient.phone},
      {label: t.emailLabel, value: patient.email},
      {label: t.doctor, value: doctor.name},
    ].filter(row => row.value),
    message,
    channels: CHANNELS.map(c => {
      const {label, failed} = channelText(c.key);
      return {
        ...c,
        label,
        status: status[c.key],
        send: () => {
          send(c.key).catch(e => {
            mark(c.key, 'idle');
            showError(t.sendFailed(label), e, failed);
          });
        },
      };
    }),
    viewPatients: () =>
      navigation.navigate('Main', {
        screen: 'HomeTab',
        params: {screen: 'MyPatients'},
      }),
    addAnother: () =>
      navigation.navigate('Main', {
        screen: 'AppointmentsTab',
        params: {screen: 'NewAppointmentDetails'},
      }),
  };
};
