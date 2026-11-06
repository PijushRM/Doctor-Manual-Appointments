import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {AppointmentSavedScreen} from 'src/screens/appointments/AppointmentSavedScreen';
import {LoginScreen} from 'src/screens/auth/LoginScreen';
import {useAuthStore} from 'src/store/useAuthStore';
import {MainTabs} from './MainTabs';
import type {RootStackParamList} from './types';

const Stack = createStackNavigator<RootStackParamList>();

// Auth gate: logged-out users only ever see Login; logging in swaps the tree.
export const RootNavigator = () => {
  const isLoggedIn = useAuthStore(s => s.isLoggedIn);
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {isLoggedIn ? (
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
