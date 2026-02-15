import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            "welcome": "Welcome",
            "dashboard": "Dashboard",
            "transactions": "Transactions",
            "profile": "Profile"
        }
    },
    es: {
        translation: {
            "welcome": "Bienvenido",
            "dashboard": "Panel Principal",
            "transactions": "Transacciones",
            "profile": "Perfil"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "es", // Default language Spanish as per context
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
