import React, {useState} from 'react';
import {StyleSheet, TextInput, View, type TextInputProps} from 'react-native';
import type {Theme} from 'src/configs/theme';
import {useStyles, useTheme} from 'src/hooks/useTheme';
import {AppText} from './AppText';
import {Icon, type IconName} from './Icon';

type Props = TextInputProps & {
  label: string;
  // Required so no field is left blank: an example ("e.g. …") or an instruction.
  placeholder: string;
  hint?: string; // right of the label, e.g. "OPTIONAL"
  icon?: IconName;
  trailing?: React.ReactNode;
  error?: string;
  ref?: React.Ref<TextInput>;
};

// The artboards' `.lbl` + `.fld`/`.in`: label above a 56px sunken field,
// blue ring while focused, red border + message on error.
export const TextField = ({
  label,
  hint,
  icon,
  trailing,
  error,
  style,
  onFocus,
  onBlur,
  ...input
}: Props) => {
  const theme = useTheme();
  const styles = useStyles(makeStyles);
  const [focused, setFocused] = useState(false);
  return (
    <View>
      <View style={styles.labelRow}>
        <AppText variant="label">{label}</AppText>
        {hint && <AppText variant="caption">{hint}</AppText>}
      </View>
      <View
        style={[
          styles.field,
          !trailing && styles.fieldPlain,
          input.multiline && styles.fieldMultiline,
          focused && styles.focused,
          !!error && styles.invalid,
        ]}>
        {icon && <Icon name={icon} size={20} color={theme.colors.textSubtle} />}
        <TextInput
          accessibilityLabel={label}
          accessibilityHint={error}
          placeholderTextColor={theme.colors.textDim}
          {...input}
          onFocus={e => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            styles.input,
            input.multiline && styles.inputMultiline,
            {fontFamily: theme.bodyFont},
            style,
          ]}
        />
        {trailing}
      </View>
      {!!error && (
        <AppText
          variant="caption"
          color="textDanger"
          accessibilityLiveRegion="polite"
          style={styles.error}>
          {error}
        </AppText>
      )}
    </View>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    labelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      height: 56,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceSunken,
      paddingLeft: 16,
      paddingRight: 4,
    },
    fieldPlain: {paddingRight: 16},
    // The design's note textarea: 96 tall, text from the top.
    fieldMultiline: {height: 96, alignItems: 'flex-start', paddingVertical: 12},
    focused: {
      borderColor: theme.colors.focus,
      boxShadow: `0 0 0 3px ${theme.colors.focusRing}`,
    },
    invalid: {borderColor: theme.colors.textDanger},
    input: {
      flex: 1,
      minWidth: 0,
      height: '100%',
      padding: 0,
      fontSize: 16,
      color: theme.colors.textBase,
    },
    inputMultiline: {fontSize: 15, lineHeight: 20, textAlignVertical: 'top'},
    error: {marginTop: 6},
  });
