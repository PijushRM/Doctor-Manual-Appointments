import React from 'react';
import {Modal, Pressable, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {Theme} from 'src/configs/theme';
import {useStyles} from 'src/hooks/useTheme';
import {tr} from 'src/i18n';
import {commonText} from 'src/i18n/strings/common';

type Props = {label: string; onClose: () => void; children: React.ReactNode};

// The artboards' `.back` + `.sheet`: bottom sheet over a light backdrop.
// Mount it only while open; tapping the backdrop or Back closes it.
export const Sheet = ({label, onClose, children}: Props) => {
  const styles = useStyles(makeStyles);
  const {bottom} = useSafeAreaInsets();
  return (
    <Modal
      transparent
      visible
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          style={StyleSheet.absoluteFill}
          accessibilityRole="button"
          accessibilityLabel={tr(commonText).closeSheet(label)}
          onPress={onClose}>
          <View style={styles.backdrop} />
        </Pressable>
        <View
          style={[styles.sheet, {paddingBottom: 32 + bottom}]}
          accessibilityViewIsModal
          accessibilityLabel={label}>
          <View style={styles.grab} />
          {children}
        </View>
      </View>
    </Modal>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {flex: 1, justifyContent: 'flex-end'},
    backdrop: {flex: 1, backgroundColor: theme.colors.overlay},
    sheet: {
      backgroundColor: theme.colors.sheet,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 8,
      paddingHorizontal: 16,
      boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
    },
    grab: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 4,
      backgroundColor: theme.colors.grab,
      marginBottom: 12,
    },
  });
