import {useMemo} from 'react';
import {useColorScheme} from 'react-native';
import {darkTheme, lightTheme, type Theme} from 'src/configs/theme';

export const useTheme = (): Theme =>
  useColorScheme() === 'dark' ? darkTheme : lightTheme;

// `factory` must be defined at module level so the memo holds.
export const useStyles = <T>(factory: (theme: Theme) => T): T => {
  const theme = useTheme();
  return useMemo(() => factory(theme), [factory, theme]);
};
