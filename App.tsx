import React from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import {ErrorBoundary} from 'src/components/shared/ErrorBoundary';
import {useReminderSync} from 'src/hooks/useReminderSync';
import {useServerSync} from 'src/hooks/useServerSync';
import {useTheme} from 'src/hooks/useTheme';
import {RootNavigator} from 'src/navigation/RootNavigator';
import {installCrashHandler} from 'src/services/crashHandler';

installCrashHandler();

const App = () => {
  const theme = useTheme();
  useServerSync();
  useReminderSync();
  const base = theme.dark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: theme.colors.bg2,
      card: theme.colors.surface,
      text: theme.colors.textBase,
      border: theme.colors.border,
      primary: theme.colors.textBrand,
    },
  };
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.bg}
        />
        <ErrorBoundary>
          <NavigationContainer theme={navTheme}>
            <RootNavigator />
          </NavigationContainer>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({root: {flex: 1}});

export default App;
