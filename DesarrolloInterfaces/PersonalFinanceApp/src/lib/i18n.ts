import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = { // Español por defecto mejor
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
            "profile": "Perfil",
            "net_worth": "Patrimonio Neto",
            "budgets": "Presupuestos",
            "guild_tools": "Gremio de Herramientas",
            "market_data": "Datos de Mercado",
            "recent_scrolls": "Rollos Recientes",
            "login_welcome": "Bienvenido de Nuevo",
            "login_subtitle": "Gestiona tus finanzas con claridad y estilo",
            "email": "Correo Electrónico",
            "password": "Contraseña",
            "sign_in": "Entrar",
            "sign_up": "Registrarse",
            "processing": "Procesando...",
            "no_account": "¿No tienes cuenta? Registrate",
            "has_account": "¿Ya tienes cuenta? Entra",
            "oracle_visions": "Visiones del Oráculo",
            "current_net_worth": "Hoard Actual",
            "stealth_on": "Capa de Invisibilidad Activada",
            "stealth_off": "Revelar Pertenencias"
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
