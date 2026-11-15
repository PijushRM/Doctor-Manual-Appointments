import {useCallback, useEffect, useState} from 'react';
import {Linking} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {APP_VERSION, BUILD_NUMBER} from 'src/constants/app';
import {api} from 'src/services/api';
import {logger} from 'src/utils/logger';
import {useDoctorStore} from 'src/store/useDoctorStore';
import {useNow} from './useNow';
import {showError} from 'src/utils/showError';
import {tr} from 'src/i18n';
import {localDigits} from 'src/i18n/format';
import {profileText} from 'src/i18n/strings/profile';

type Developer = Awaited<ReturnType<typeof api.about>>['developer'];

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

  // Developed by: loaded from the server each time About opens (nothing is
  // saved on the phone).
  const [developer, setDeveloper] = useState<Developer | 'loading' | 'failed'>(
    'loading',
  );
  const load = useCallback(() => {
    setDeveloper('loading');
    api
      .about()
      .then(r => setDeveloper(r.developer))
      .catch(e => {
        logger.warn('api', 'About details failed', e);
        setDeveloper('failed');
      });
  }, []);
  useEffect(load, [load]);

  const link = (url: string) => () => {
    Linking.openURL(url).catch(e => showError(t.linkFailed, e, t.linkFallback));
  };
  const d = typeof developer === 'object' ? developer : undefined;
  // Only the details set on the server; an empty one is hidden.
  const rows = d
    ? [
        {icon: 'briefcase' as const, label: undefined, value: d.name},
        {
          icon: 'mail' as const,
          label: t.email,
          value: d.email,
          open: link(`mailto:${d.email}`),
        },
        {
          icon: 'phone' as const,
          label: t.phone,
          value: d.phone,
          open: link(`tel:${d.phone.replace(/[^\d+]/g, '')}`),
        },
        {
          icon: 'globe' as const,
          label: t.website,
          value: d.website,
          open: link(`https://${d.website}`),
        },
      ].filter(row => row.value)
    : [];

  return {
    t,
    title: splitTitle(owner),
    version: t.versionLine(localDigits(APP_VERSION), localDigits(BUILD_NUMBER)),
    developer: rows,
    developerLoading: developer === 'loading',
    developerFailed: developer === 'failed',
    retryDeveloper: load,
    copyright: t.copyright(localDigits(year), owner),
    back: navigation.goBack,
  };
};
