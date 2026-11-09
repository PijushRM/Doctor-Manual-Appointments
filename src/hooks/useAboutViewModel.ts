import {Linking} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {APP_VERSION, BUILD_NUMBER, DEVELOPER} from 'src/constants/app';
import {useDoctorStore} from 'src/store/useDoctorStore';
import {useNow} from './useNow';
import {showError} from 'src/utils/showError';
import {tr} from 'src/i18n';
import {localDigits} from 'src/i18n/format';
import {profileText} from 'src/i18n/strings/profile';

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
  const t = tr(profileText);

  const link = (value: string, url: string) =>
    isPlaceholder(value)
      ? undefined
      : () => {
          Linking.openURL(url).catch(e =>
            showError(t.linkFailed, e, t.linkFallback),
          );
        };

  return {
    t,
    title: splitTitle(owner),
    version: t.versionLine(localDigits(APP_VERSION), localDigits(BUILD_NUMBER)),
    developer: [
      {icon: 'briefcase' as const, label: undefined, value: DEVELOPER.name},
      {
        icon: 'mail' as const,
        label: t.email,
        value: DEVELOPER.email,
        open: link(DEVELOPER.email, `mailto:${DEVELOPER.email}`),
      },
      {
        icon: 'phone' as const,
        label: t.phone,
        value: DEVELOPER.phone,
        open: link(
          DEVELOPER.phone,
          `tel:${DEVELOPER.phone.replace(/\s/g, '')}`,
        ),
      },
      {
        icon: 'globe' as const,
        label: t.website,
        value: DEVELOPER.website,
        open: link(DEVELOPER.website, `https://${DEVELOPER.website}`),
      },
    ],
    copyright: t.copyright(localDigits(year), owner),
    back: navigation.goBack,
  };
};
