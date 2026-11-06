import {useState} from 'react';
import {Alert, Linking} from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {format} from 'date-fns';
import {appointmentMessage} from 'src/features/appointments/message';
import {formatTime, minutesOfDay} from 'src/features/appointments/schedule';
import {initials} from 'src/features/patients/patients';
import type {RootStackParamList} from 'src/navigation/types';
import {openWhatsApp, shareMessage} from 'src/services/shareService';
import {openSmsApp, sendSms} from 'src/services/smsService';
import {useClinicStore} from 'src/store/useClinicStore';
import {useDoctorStore} from 'src/store/useDoctorStore';

export type Channel = 'sms' | 'whatsapp' | 'facebook';
type Status = 'idle' | 'sending' | 'sent';

const CHANNELS: {key: Channel; label: string}[] = [
  {key: 'sms', label: 'SMS'},
  {key: 'whatsapp', label: 'WhatsApp'},
  {key: 'facebook', label: 'Facebook'},
];

const SMS_ALERTS = {
  failed: {
    title: 'SMS not sent',
    body: 'The phone couldn’t send the text. Check the SIM and signal, or send it from Messages.',
  },
  // Android stops asking after the doctor denies twice; only Settings can undo it.
  blocked: {
    title: 'SMS permission is off',
    body: 'Turn on SMS for Smile Doctor in Settings to send texts automatically, or send this one from Messages.',
  },
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
      const result = await sendSms(patient.phone, message);
      if (result === 'failed' || result === 'blocked') {
        mark(channel, 'idle');
        const {title, body} = SMS_ALERTS[result];
        Alert.alert(
          title,
          body,
          [
            result === 'blocked'
              ? {
                  text: 'Open Settings',
                  onPress: () => {
                    Linking.openSettings().catch(() => {});
                  },
                }
              : {text: 'Cancel', style: 'cancel'},
            {
              text: 'Open Messages',
              onPress: () => {
                openSmsApp(patient.phone, message)
                  .then(() => mark(channel, 'sent'))
                  .catch(() => {});
              },
            },
          ],
          {cancelable: true}, // Back or a tap outside just closes it
        );
        return;
      }
    } else if (channel === 'whatsapp') {
      await openWhatsApp(patient.phone, message);
    } else {
      await shareMessage(message);
    }
    mark(channel, 'sent');
  };

  return {
    patientName: patient.name,
    patientInitials: initials(patient.name),
    patientAge: `${patient.age} years`,
    details: [
      {
        label: 'Date & time',
        value: `${format(startsAt, 'EEE, d MMM yyyy')} · ${formatTime(
          minutesOfDay(startsAt),
        )}`,
      },
      {label: 'Phone', value: patient.phone},
      {label: 'Email', value: patient.email},
      {label: 'Doctor', value: doctor.name},
    ].filter(row => row.value),
    message,
    channels: CHANNELS.map(c => ({
      ...c,
      status: status[c.key],
      send: () => {
        send(c.key).catch(() => mark(c.key, 'idle'));
      },
    })),
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
