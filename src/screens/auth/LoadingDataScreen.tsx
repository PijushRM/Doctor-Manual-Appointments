import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {AppText} from 'src/components/shared/AppText';
import {Button} from 'src/components/shared/Button';
import {Screen} from 'src/components/shared/Screen';
import {useTheme} from 'src/hooks/useTheme';
import {useAuthStore} from 'src/store/useAuthStore';
import {syncAll, useSyncStore} from 'src/store/sync';

// Shown after launch or login until the server's data arrives: nothing is
// saved on the phone, so there is nothing to show before then.
export const LoadingDataScreen = () => {
  const {colors} = useTheme();
  const failed = useSyncStore(s => s.status === 'error');
  const reason = useSyncStore(s => s.error);
  const logOut = useAuthStore(s => s.logOut);

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.center}>
        {failed ? (
          <>
            <AppText variant="heading" style={styles.text}>
              Couldn’t load your clinic
            </AppText>
            <AppText color="textSubtle" style={styles.text}>
              {reason}
            </AppText>
          </>
        ) : (
          <>
            <ActivityIndicator size="large" color={colors.textBase} />
            <AppText color="textSubtle" style={styles.text}>
              Loading your clinic…
            </AppText>
          </>
        )}
      </View>
      {failed && (
        <View style={styles.actions}>
          <Button title="Try again" onPress={() => syncAll().catch(() => {})} />
          <Button title="Log out" variant="outline" onPress={logOut} />
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  text: {textAlign: 'center'},
  actions: {gap: 12, paddingHorizontal: 24, paddingBottom: 24},
});
