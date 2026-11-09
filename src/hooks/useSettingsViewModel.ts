import {Alert, Linking} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {ProfileStackParamList} from 'src/navigation/types';
import {requestAlertPermission} from 'src/services/notificationService';
import {useAuthStore} from 'src/store/useAuthStore';
import {useDoctorStore} from 'src/store/useDoctorStore';
import {showError} from 'src/utils/showError';

export const useSettingsViewModel = () => {
  const navigation =
    useNavigation<StackNavigationProp<ProfileStackParamList, 'Settings'>>();
  const alerts = useDoctorStore(s => s.alerts);
  const setAlerts = useDoctorStore(s => s.setAlerts);
  const logOut = useAuthStore(s => s.logOut);

  const toggleAlerts = async () => {
    if (alerts) {
      setAlerts(false);
      return;
    }
    if (await requestAlertPermission()) {
      setAlerts(true);
      return;
    }
    Alert.alert(
      'Notifications are off',
      'Allow notifications for Smile Doctor in Settings to get a reminder 15 minutes before each appointment.',
      [
        {text: 'Not now', style: 'cancel'},
        {
          text: 'Open Settings',
          onPress: () => {
            Linking.openSettings().catch(e =>
              showError(
                'Couldn’t open Settings',
                e,
                'Open Settings › Apps › Smile Doctor on your phone.',
              ),
            );
          },
        },
      ],
      {cancelable: true},
    );
  };

  return {
    alerts,
    toggleAlerts: () => {
      toggleAlerts().catch(e =>
        showError('Couldn’t change appointment alerts', e),
      );
    },
    // Clinic hours and working days live on Edit Profile, part 2.
    openAvailability: () => navigation.navigate('EditProfileClinic'),
    changePassword: () => navigation.navigate('ChangePassword'),
    back: navigation.goBack,
    logOut: () =>
      Alert.alert(
        'Log out?',
        'Your patients and appointments are saved to your account. You’ll need your password to log back in.',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Log out', style: 'destructive', onPress: logOut},
        ],
        {cancelable: true},
      ),
  };
};
