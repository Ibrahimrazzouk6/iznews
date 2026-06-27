import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { resources } from './translations.js';

const i18n = i18next.createInstance();

await i18n
  .use(LanguageDetector)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'de', 'ar'],
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'news-dashboard-lang',
    },
    interpolation: {
      escapeValue: false,
    },
    debug: false,
  });

export default i18n;

/**
 * Returns locale config for NewsAPI based on current language.
 * @returns {{ country: string, language: string }}
 */
export function getLocaleConfig(lang) {
  const map = {
    de: { country: 'de', language: 'de' },
    ar: { country: 'ae', language: 'ar' },
    en: { country: 'us', language: 'en' },
  };
  return map[lang] || map.en;
}

/**
 * Returns true if the given language is RTL.
 */
export function isRTL(lang) {
  return lang === 'ar';
}
