import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {AppText} from './shared/AppText';
import {Button} from './shared/Button';
import {Sheet} from './shared/Sheet';
import {TimeWheel} from './TimeWheel';

type Props = {
  title: string;
  minutes: number;
  onDone: (minutes: number) => void;
  onClose: () => void;
};

// The New Appointment time wheel in a bottom sheet (Edit Profile's Opens / Closes).
export const TimeSheet = ({title, minutes, onDone, onClose}: Props) => {
  const [value, setValue] = useState(minutes);
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
        Tap or swipe to roll
      </AppText>
      <Button title="Done" onPress={() => onDone(value)} />
    </Sheet>
  );
};

const styles = StyleSheet.create({
  title: {marginBottom: 12},
  hint: {textAlign: 'center', marginVertical: 12},
});
