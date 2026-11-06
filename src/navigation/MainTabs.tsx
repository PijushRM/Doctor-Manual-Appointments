import React from 'react';
import {StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Icon, type IconName} from 'src/components/shared/Icon';
import {FontFamily} from 'src/configs/fonts';
import {useTheme} from 'src/hooks/useTheme';
import {NewAppointmentDateTimeScreen} from 'src/screens/appointments/NewAppointmentDateTimeScreen';
import {NewAppointmentDetailsScreen} from 'src/screens/appointments/NewAppointmentDetailsScreen';
import {MyPatientsScreen} from 'src/screens/home/MyPatientsScreen';
import {PatientListScreen} from 'src/screens/patients/PatientListScreen';
import {PatientProfileScreen} from 'src/screens/patients/PatientProfileScreen';
import {UploadNoteScreen} from 'src/screens/patients/UploadNoteScreen';
import {AboutScreen} from 'src/screens/profile/AboutScreen';
import {ChangePasswordScreen} from 'src/screens/profile/ChangePasswordScreen';
import {EditProfileClinicScreen} from 'src/screens/profile/EditProfileClinicScreen';
import {EditProfileDetailsScreen} from 'src/screens/profile/EditProfileDetailsScreen';
import {ProfileScreen} from 'src/screens/profile/ProfileScreen';
import {SettingsScreen} from 'src/screens/profile/SettingsScreen';
import type {
  AppointmentsStackParamList,
  HomeStackParamList,
  MainTabParamList,
  PatientsStackParamList,
  ProfileStackParamList,
} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const AppointmentsStack = createStackNavigator<AppointmentsStackParamList>();
const PatientsStack = createStackNavigator<PatientsStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

const stackOptions = {headerShown: false};

const HomeTab = () => (
  <HomeStack.Navigator screenOptions={stackOptions}>
    <HomeStack.Screen name="MyPatients" component={MyPatientsScreen} />
  </HomeStack.Navigator>
);

const AppointmentsTab = () => (
  <AppointmentsStack.Navigator screenOptions={stackOptions}>
    <AppointmentsStack.Screen
      name="NewAppointmentDetails"
      component={NewAppointmentDetailsScreen}
    />
    <AppointmentsStack.Screen
      name="NewAppointmentDateTime"
      component={NewAppointmentDateTimeScreen}
    />
  </AppointmentsStack.Navigator>
);

const PatientsTab = () => (
  <PatientsStack.Navigator screenOptions={stackOptions}>
    <PatientsStack.Screen name="PatientList" component={PatientListScreen} />
    <PatientsStack.Screen
      name="PatientProfile"
      component={PatientProfileScreen}
    />
    <PatientsStack.Screen name="UploadNote" component={UploadNoteScreen} />
  </PatientsStack.Navigator>
);

const ProfileTab = () => (
  <ProfileStack.Navigator screenOptions={stackOptions}>
    <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    <ProfileStack.Screen
      name="ChangePassword"
      component={ChangePasswordScreen}
    />
    <ProfileStack.Screen name="About" component={AboutScreen} />
    <ProfileStack.Screen
      name="EditProfileDetails"
      component={EditProfileDetailsScreen}
    />
    <ProfileStack.Screen
      name="EditProfileClinic"
      component={EditProfileClinicScreen}
    />
  </ProfileStack.Navigator>
);

const tabIcon =
  (name: IconName) =>
  ({color}: {color: string}) =>
    <Icon name={name} color={color} />;

const TABS: {
  name: keyof MainTabParamList;
  label: string;
  icon: ReturnType<typeof tabIcon>;
  component: React.ComponentType;
}[] = [
  {name: 'HomeTab', label: 'Home', icon: tabIcon('home'), component: HomeTab},
  {
    name: 'AppointmentsTab',
    label: 'Appointments',
    icon: tabIcon('calendar'),
    component: AppointmentsTab,
  },
  {
    name: 'PatientsTab',
    label: 'Patients',
    icon: tabIcon('patients'),
    component: PatientsTab,
  },
  {
    name: 'ProfileTab',
    label: 'Profile',
    icon: tabIcon('profile'),
    component: ProfileTab,
  },
];

// Bottom nav = the artboards' `.nav`.
export const MainTabs = () => {
  const {colors} = useTheme();
  const {bottom} = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.textBrand,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: BAR_HEIGHT + bottom,
          paddingTop: 8,
          paddingBottom: BAR_PADDING_BOTTOM + bottom,
        },
        tabBarLabelStyle: styles.label,
      }}>
      {TABS.map(tab => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarLabel: tab.label,
            tabBarAccessibilityLabel: tab.label,
            tabBarIcon: tab.icon,
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

const BAR_HEIGHT = 68;
const BAR_PADDING_BOTTOM = 12;

const styles = StyleSheet.create({
  label: {fontFamily: FontFamily.semibold, fontSize: 12, lineHeight: 17},
});
