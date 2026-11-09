import {Linking} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {APP_VERSION, BUILD_NUMBER, DEVELOPER} from 'src/constants/app';
import {useDoctorStore} from 'src/store/useDoctorStore';
import {useNow} from './useNow';
import {showError} from 'src/utils/showError';

const isPlaceholder = (value: string) => value.startsWith('[');

// "Smile Dental Clinic" → the design colours the middle: "Smile [Dental] Clinic".
const splitTitle = (title: string) => {
  const words = title.split(' ');
  if (words.length < 3) {
    return {
      before: words.slice(0, -1).join(' '),
      accent: words.at(-1)!,
      after: '',
    };
  }
  return {
    before: words[0],
    accent: words.slice(1, -1).join(' '),
    after: words.at(-1)!,
  };
};

export const useAboutViewModel = () => {
  const navigation = useNavigation();
  const clinicName = useDoctorStore(s => s.profile.clinicName);
  const year = useNow().getFullYear();
  const owner = clinicName || 'Smile Doctor';

  const link = (value: string, url: string) =>
    isPlaceholder(value)
      ? undefined
      : () => {
          Linking.openURL(url).catch(e =>
            showError(
              'Couldn’t open this link',
              e,
              'No app on this phone can open it.',
            ),
          );
        };

  return {
    title: splitTitle(owner),
    version: `DOCTOR APP · VERSION ${APP_VERSION} (BUILD ${BUILD_NUMBER})`,
    developer: [
      {icon: 'briefcase' as const, label: undefined, value: DEVELOPER.name},
      {
        icon: 'mail' as const,
        label: 'EMAIL',
        value: DEVELOPER.email,
        open: link(DEVELOPER.email, `mailto:${DEVELOPER.email}`),
      },
      {
        icon: 'phone' as const,
        label: 'PHONE',
        value: DEVELOPER.phone,
        open: link(
          DEVELOPER.phone,
          `tel:${DEVELOPER.phone.replace(/\s/g, '')}`,
        ),
      },
      {
        icon: 'globe' as const,
        label: 'WEBSITE',
        value: DEVELOPER.website,
        open: link(DEVELOPER.website, `https://${DEVELOPER.website}`),
      },
    ],
    copyright: `© ${year} ${owner}. All rights reserved.`,
    back: navigation.goBack,
  };
};
