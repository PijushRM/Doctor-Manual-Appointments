import React from 'react';
import {StyleSheet, View} from 'react-native';
import {AppText} from './AppText';
import {Button} from './Button';
import {tr} from 'src/i18n';
import {errorText} from 'src/i18n/strings/errors';
import {Screen} from './Screen';
import {logger} from 'src/utils/logger';

type Props = {
  children: React.ReactNode;
  // Runs before "Try again" redraws, e.g. to leave the screen that crashed.
  onReset?: () => void;
};
type State = {error: Error | null};

// Catches a bug while drawing any screen, so the doctor sees a way back
// instead of a blank screen or the app closing. Nothing is lost: all data
// is on the server, and "Try again" draws the app afresh.
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {error: null};

  static getDerivedStateFromError(error: Error): State {
    return {error};
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error('error', 'Screen crashed', {
      error,
      stack: info.componentStack,
    });
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }
    return (
      <CrashScreen
        onRetry={() => {
          this.props.onReset?.();
          this.setState({error: null});
        }}
      />
    );
  }
}

const CrashScreen = ({onRetry}: {onRetry: () => void}) => {
  const t = tr(errorText);
  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.center}>
        <AppText variant="heading" style={styles.text}>
          {t.crashTitle}
        </AppText>
        <AppText color="textSubtle" style={styles.text}>
          {t.crashScreenBody}
        </AppText>
      </View>
      <View style={styles.actions}>
        <Button title={t.tryAgain} onPress={onRetry} />
      </View>
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
  actions: {paddingHorizontal: 24, paddingBottom: 24},
});
