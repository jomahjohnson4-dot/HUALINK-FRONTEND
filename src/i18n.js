import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import sw from './locales/sw.json';
import zh from './locales/zh.json';
import fr from './locales/fr.json';

/**
 * The four languages Hualink Distribution ships with.
 *
 * `code` is the i18next locale code, `label` is the *endonym* (the language
 * written in itself) so a shopper always recognises their own language in
 * the switcher, and `flag` is the badge shown next to it.
 */
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'sw', label: 'Kiswahili', flag: '🇹🇿' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

export const LANGUAGE_CODES = SUPPORTED_LANGUAGES.map((language) => language.code);
export const DEFAULT_LANGUAGE = 'en';

/** localStorage key that remembers the shopper's language choice. */
export const LANGUAGE_STORAGE_KEY = 'hualink_lang';

const resources = {
  en: { translation: en },
  sw: { translation: sw },
  zh: { translation: zh },
  fr: { translation: fr },
};

/**
 * Reads the persisted language choice.
 *
 * The stored value is validated against the supported list, so a stale or
 * hand-edited entry (e.g. "de") can never leave the app without a working
 * dictionary. When nothing valid is stored the browser language is used as a
 * hint, and English remains the final fallback.
 */
export const resolveStoredLanguage = (storage, navigatorLanguage) => {
  let stored;
  try {
    stored = storage?.getItem(LANGUAGE_STORAGE_KEY) || null;
  } catch {
    stored = null;
  }

  if (stored && LANGUAGE_CODES.includes(stored)) {
    return stored;
  }
  const hinted = String(navigatorLanguage || '').slice(0, 2).toLowerCase();
  if (hinted && LANGUAGE_CODES.includes(hinted)) {
    return hinted;
  }

  return DEFAULT_LANGUAGE;
};

/**
 * Persists the language choice so it survives a refresh and every route
 * change. Storage failures (private mode, disabled cookies) are ignored —
 * the in-memory language still applies for the current session.
 */
export const persistLanguage = (language) => {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    /* storage unavailable — the choice only lasts for this session */
  }
};

const initialLanguage = resolveStoredLanguage(
  typeof localStorage !== 'undefined' ? localStorage : null,
  typeof navigator !== 'undefined' ? navigator.language : null
);

i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: LANGUAGE_CODES,
  // Missing keys must not silently render as empty strings.
  parseMissingKeyHandler: (key) => key,
  interpolation: {
    escapeValue: false, // React already escapes by default
  },
});

// Keep <html lang> in sync with the active language for accessibility & SEO,
// and remember the choice for the next visit.
if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language;
  i18n.on('languageChanged', (lng) => {
    const normalized = LANGUAGE_CODES.includes(lng) ? lng : DEFAULT_LANGUAGE;
    document.documentElement.lang = normalized;
    persistLanguage(normalized);
  });
}

// Persist the very first resolved language as well, so the choice is stored
// even when it came from the browser hint rather than an explicit pick.
persistLanguage(i18n.language);

export default i18n;
