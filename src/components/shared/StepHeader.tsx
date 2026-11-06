import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {Theme} from 'src/configs/theme';
import {useStyles} from 'src/hooks/useTheme';
import {AppText} from './AppText';
import {BackHeader} from './BackHeader';

type Step = {part: number; total: number};

// Top row of multi-part screens: back button + "Part 1 of 2".
export const StepHeader = ({
  part,
  total,
  onBack,
  backLabel,
}: Step & {onBack: () => void; backLabel: string}) => (
  <BackHeader
    onBack={onBack}
    backLabel={backLabel}
    right={
      <AppText variant="caption">
        Part {part} of {total}
      </AppText>
    }
  />
);

// The artboards' `.prog`: one segment per part, filled up to the current one.
export const ProgressBar = ({part, total}: Step) => {
  const styles = useStyles(makeStyles);
  return (
    <View
      style={styles.progress}
      accessibilityRole="progressbar"
      accessibilityValue={{min: 0, max: total, now: part}}>
      {Array.from({length: total}, (_, i) => (
        <View key={i} style={[styles.segment, i < part && styles.segmentOn]} />
      ))}
    </View>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    progress: {flexDirection: 'row', gap: 4},
    segment: {
      flex: 1,
      height: 4,
      borderRadius: 4,
      backgroundColor: theme.colors.border,
    },
    segmentOn: {backgroundColor: theme.colors.textLink},
  });
