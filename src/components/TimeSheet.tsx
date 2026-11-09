import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {AppText} from './shared/AppText';
import {Button} from './shared/Button';
import {Sheet} from './shared/Sheet';
import {TimeWheel} from './TimeWheel';
import {tr} from 'src/i18n';
import {appointmentsText} from 'src/i18n/strings/appointments';

type Props = {
  title: string;
  minutes: number;
  onDone: (minutes: number) => void;
  onClose: () => void;
};

// The New Appointment time wheel in a bottom sheet (Edit Profile's Opens / Closes).
export const TimeSheet = ({title, minutes, onDone, onClose}: Props) => {
  const [value, setValue] = useState(minutes);
  const t = tr(appointmentsText);
  return (
    <Sheet label={title} onClose={onClose}>
      <AppText
        variant="heading"
        accessibilityRole="header"
        style={styles.title}>
        {title}
      </AppText>
      <TimeWheel minutes={value} onChange={setValue} />
      <AppText variant="caption" style={styles.hint}>
        {t.scrollOrTapTime}
      </AppText>
      <Button title={t.done} onPress={() => onDone(value)} />
    </Sheet>
  );
};

const styles = StyleSheet.create({
  title: {marginBottom: 12},
  hint: {textAlign: 'center', marginVertical: 12},
});
