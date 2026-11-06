import {Linking, Share} from 'react-native';
import {whatsAppNumber} from 'src/features/appointments/message';

// Opens the patient's WhatsApp chat with the message typed in; the doctor taps send.
// wa.me falls back to the browser when WhatsApp isn't installed.
export const openWhatsApp = (phone: string, message: string) =>
  Linking.openURL(
    `https://wa.me/${whatsAppNumber(phone)}?text=${encodeURIComponent(
      message,
    )}`,
  );

// Facebook can't message a phone number, so hand the text to the share sheet
// (Messenger, Facebook, or anything else the doctor picks).
export const shareMessage = (message: string) => Share.share({message});
