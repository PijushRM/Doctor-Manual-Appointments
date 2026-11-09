import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {AppointmentSavedScreen} from 'src/screens/appointments/AppointmentSavedScreen';
import {LoadingDataScreen} from 'src/screens/auth/LoadingDataScreen';
import {LoginScreen} from 'src/screens/auth/LoginScreen';
import {useAuthStore} from 'src/store/useAuthStore';
import {useSyncStore} from 'src/store/sync';
import {MainTabs} from './MainTabs';
import type {RootStackParamList} from './types';

const Stack = createStackNavigator<RootStackParamList>();

// Auth gate: logged-out users only ever see Login; logging in swaps the tree.
// Logged in, the app waits for the server's data before showing any screen.
export const RootNavigator = () => {
  const isLoggedIn = useAuthStore(s => s.isLoggedIn);
  const loaded = useSyncStore(s => s.status === 'ready');
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {isLoggedIn && !loaded ? (
        <Stack.Screen name="LoadingData" component={LoadingDataScreen} />
      ) : isLoggedIn ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="AppointmentSaved"
            component={AppointmentSavedScreen}
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};
