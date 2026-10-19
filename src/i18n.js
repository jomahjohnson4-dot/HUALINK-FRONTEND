import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import sw from './locales/sw.json';
import zh from './locales/zh.json';
import fr from './locales/fr.json';

const resources = {
  en: { translation: en },
  sw: { translation: sw },
  zh: { translation: zh },
  fr: { translation: fr },
};

const savedLang = localStorage.getItem('hualink_lang') || 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: savedLang,
  fallbackLng: 'en',
  supportedLngs: ['en', 'sw', 'zh', 'fr'],
  interpolation: {
    escapeValue: false, // React already escapes by default
  },
});

// Keep <html lang> in sync with the active language for accessibility & SEO
if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language;
  i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng;
    localStorage.setItem('hualink_lang', lng);
  });
}

export default i18n;
