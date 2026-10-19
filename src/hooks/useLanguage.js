import { useTranslation } from 'react-i18next';

/**
 * Hook that exposes the current translation function, active language,
 * and a language changer that persists the choice to localStorage.
 */
export const useLanguage = () => {
  const { t, i18n: i18nInstance } = useTranslation();

  const changeLanguage = (lng) => {
    i18nInstance.changeLanguage(lng);
  };

  return {
    t,
    currentLang: i18nInstance.language,
    changeLanguage,
  };
};

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'sw', label: 'Kiswahili', flag: '🇹🇿' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'fr', label: 'Français (French)', flag: '🇫🇷' },
];
