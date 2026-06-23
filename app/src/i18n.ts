import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import commonEn from '../public/locales/en/common.json';
import commonTe from '../public/locales/te/common.json';

const getInitialLanguage = (): string => {
  if (typeof window !== 'undefined') {
    // 1. URL Parameter (e.g. ?lang=te)
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    if (langParam === 'en' || langParam === 'te') {
      localStorage.setItem('i18nextLng', langParam);
      return langParam;
    }
    
    // 2. LocalStorage
    const savedLang = localStorage.getItem('i18nextLng');
    if (savedLang === 'en' || savedLang === 'te') {
      return savedLang;
    }

    // 3. Browser Language
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'te') {
      return 'te';
    }
  }
  return 'en';
};

const initialLang = getInitialLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: commonEn },
      te: { common: commonTe }
    },
    lng: initialLang,
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false
    }
  });

if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLang;
}

export default i18n;
