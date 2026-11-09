import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {zustandStorage} from 'src/configs/storage';

export type Language = 'en' | 'bn';

// Settings › Language. Each name is written in its own language.
export const LANGUAGES: {key: Language; name: string}[] = [
  {key: 'en', name: 'English'},
  {key: 'bn', name: 'বাংলা'},
];

type LanguageState = {
  language: Language;
  setLanguage: (language: Language) => void;
};

// A setting for this phone (like Appointment alerts), so it is saved here,
// not on the server. It also sets the language of the patient SMS.
export const useLanguageStore = create<LanguageState>()(
  persist(
    set => ({
      language: 'en',
      setLanguage: language => set({language}),
    }),
    {
      name: 'language-settings',
      storage: zustandStorage,
      partialize: s => ({language: s.language}),
    },
  ),
);

export const getLanguage = () => useLanguageStore.getState().language;
export const useLanguage = () => useLanguageStore(s => s.language);
