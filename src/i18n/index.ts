import {getLanguage} from './language';

export {
  LANGUAGES,
  getLanguage,
  useLanguage,
  useLanguageStore,
  type Language,
} from './language';

export type Strings<T> = {en: T; bn: T};

// Text for one part of the app in every language. Curried so the English
// object fixes the shape and the Bengali one must match it key for key
// (a missing or extra key fails the type check):
//   export const settingsText = defineStrings({title: 'Settings'})({title: 'সেটিংস'});
// Values can be functions for text with blanks: (name: string) => `Hi ${name}`.
export const defineStrings =
  <T>(en: T) =>
  (bn: T): Strings<T> => ({en, bn});

// The text in the current language. Call it when the text is needed (in
// render, or when an alert opens), never at module level: the app redraws
// everything when the language changes, and module-level values wouldn't.
export const tr = <T>(strings: Strings<T>): T => strings[getLanguage()];
