import {useState} from 'react';
import {Alert, Linking} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {
  LANGUAGES,
  tr,
  useLanguage,
  useLanguageStore,
  type Language,
} from 'src/i18n';
import {settingsText} from 'src/i18n/strings/settings';
import type {ProfileStackParamList} from 'src/navigation/types';
import {requestAlertPermission} from 'src/services/notificationService';
import {useAuthStore} from 'src/store/useAuthStore';
import {useDoctorStore} from 'src/store/useDoctorStore';
import {showError} from 'src/utils/showError';
import {logger} from 'src/utils/logger';

export const useSettingsViewModel = () => {
  const navigation =
    useNavigation<StackNavigationProp<ProfileStackParamList, 'Settings'>>();
  const alerts = useDoctorStore(s => s.alerts);
  const setAlerts = useDoctorStore(s => s.setAlerts);
  const logOut = useAuthStore(s => s.logOut);
  const language = useLanguage();
  const setLanguage = useLanguageStore(s => s.setLanguage);
  const [languageOpen, setLanguageOpen] = useState(false);
  const t = tr(settingsText);

  const toggleAlerts = async () => {
    if (alerts) {
      setAlerts(false);
      logger.info('settings', 'Appointment alerts off');
      return;
    }
    if (await requestAlertPermission()) {
      setAlerts(true);
      logger.info('settings', 'Appointment alerts on');
      return;
    }
    Alert.alert(
      t.notificationsOffTitle,
      t.notificationsOffBody,
      [
        {text: t.notNow, style: 'cancel'},
        {
          text: t.openSettings,
          onPress: () => {
            Linking.openSettings().catch(e =>
              showError(t.openSettingsFailed, e, t.openSettingsFallback),
            );
          },
        },
      ],
      {cancelable: true},
    );
  };

  return {
    t,
    alerts,
    toggleAlerts: () => {
      toggleAlerts().catch(e => showError(t.alertsFailed, e));
    },
    languageName: LANGUAGES.find(l => l.key === language)!.name,
    languageOpen,
    openLanguage: () => setLanguageOpen(true),
    closeLanguage: () => setLanguageOpen(false),
    languages: LANGUAGES.map(l => ({
      ...l,
      selected: l.key === language,
      pick: () => {
        setLanguageOpen(false);
        // The whole app redraws in the new language, staying on this screen.
        logger.info('settings', `Language → ${l.key}`);
        setLanguage(l.key as Language);
      },
    })),
    // Clinic hours and working days live on Edit Profile, part 2.
    openAvailability: () => navigation.navigate('EditProfileClinic'),
    changePassword: () => navigation.navigate('ChangePassword'),
    back: navigation.goBack,
    logOut: () =>
      Alert.alert(
        t.logOutTitle,
        t.logOutBody,
        [
          {text: t.cancel, style: 'cancel'},
          {text: t.logOut, style: 'destructive', onPress: logOut},
        ],
        {cancelable: true},
      ),
  };
};
