import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_CODES,
  SUPPORTED_LANGUAGES,
  persistLanguage,
} from '../i18n';

/**
 * Hook that exposes the current translation function, active language,
 * and a language changer that persists the choice to localStorage.
 *
 * The selection survives a page refresh and every route change, because the
 * choice is written to `localStorage` on each switch *and* re-applied from
 * storage when i18next boots.
 */
export const useLanguage = () => {
  const { t, i18n: i18nInstance } = useTranslation();

  const changeLanguage = useCallback(
    (lng) => {
      const next = LANGUAGE_CODES.includes(lng) ? lng : DEFAULT_LANGUAGE;

      // Persist first so a route change (or an immediate refresh) can never
      // lose the selection.
      persistLanguage(next);
      i18nInstance.changeLanguage(next);
    },
    [i18nInstance]
  );

  return {
    t,
    currentLang: i18nInstance.language,
    changeLanguage,
    languages: SUPPORTED_LANGUAGES,
  };
};

export const LANGUAGES = SUPPORTED_LANGUAGES;
export { SUPPORTED_LANGUAGES, LANGUAGE_CODES, DEFAULT_LANGUAGE };
export default useLanguage;
