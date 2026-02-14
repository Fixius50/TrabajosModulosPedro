import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../json/en.json';
import es from '../json/es.json';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            es: { translation: es }
        },
        lng: 'es', // Default language
        fallbackLng: 'es',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
