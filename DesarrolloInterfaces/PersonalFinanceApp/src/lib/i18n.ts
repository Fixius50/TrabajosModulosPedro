import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            "welcome": "Welcome",
            "dashboard": "Dashboard",
            "transactions": "Transactions",
            "profile": "Profile",
            "net_worth": "Net Worth",
            "budgets": "Treasure Chests",
            "guild_tools": "Guild Tools",
            "market_data": "Market Data",
            "recent_scrolls": "Recent Scrolls",
            "login_welcome": "Welcome Back",
            "login_subtitle": "Manage your finances with clarity and style",
            "email": "Email",
            "password": "Password",
            "sign_in": "Enter",
            "sign_up": "Register",
            "processing": "Processing...",
            "no_account": "Don't have an account? Sign up",
            "has_account": "Already have an account? Sign in",
            "oracle_visions": "Oracle Visions",
            "current_net_worth": "Current Hoard",
            "stealth_on": "Invisibility Cloak Active",
            "stealth_off": "Reveal Belongings",
            "logout": "Flee (Logout)",
            "guild_id": "Guild ID",
            "rank": "Rank",
            "level_progress": "Level {{level}} Progress",
            "total_missions": "Total Quests",
            "guild_points": "Guild Points",
            "settings": "Guild Settings",
            "save_changes": "Save Changes",
            "full_name": "Full Name",
            "username": "Username",
            "avatar_url": "Avatar URL",
            "loading_license": "Loading License...",
            "language": "Language",
            "currency": "Currency",
            "summary": "Summary",
            "quests": "Quests",
            "marketplace": "Marketplace",
            "net_worth_label": "Current Net Worth",
            "balance": "Balance",
            "debts_to_collect": "Debts (Collect)",
            "debts_to_pay": "Debts (Pay)",
            "finances": "Finances",
            "my_household": "My Household",
            "management": "Management",
            "debts": "Debts",
            "pacts": "Pacts"
        }
    },
    es: {
        translation: {
            "welcome": "Bienvenido",
            "dashboard": "Panel Principal",
            "transactions": "Transacciones",
            "profile": "Perfil",
            "net_worth": "Patrimonio Neto",
            "budgets": "Cofres del Tesoro",
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
            "no_account": "¿No tienes cuenta? Regístrate",
            "has_account": "¿Ya tienes cuenta? Entra",
            "oracle_visions": "Visiones del Oráculo",
            "current_net_worth": "Hoard Actual",
            "stealth_on": "Capa de Invisibilidad Activada",
            "stealth_off": "Revelar Pertenencias",
            "logout": "Huir (Cerrar Sesión)",
            "guild_id": "ID de Gremio",
            "rank": "Rango",
            "level_progress": "Progreso Nivel {{level}}",
            "total_missions": "Misiones Totales",
            "guild_points": "Puntos de Gremio",
            "settings": "Configuración del Gremio",
            "save_changes": "Guardar Cambios",
            "full_name": "Nombre Completo",
            "username": "Usuario",
            "avatar_url": "URL de Avatar",
            "loading_license": "Cargando Licencia...",
            "language": "Idioma",
            "currency": "Moneda",
            "summary": "Resumen",
            "quests": "Misiones",
            "marketplace": "Mercado",
            "net_worth_label": "Valor Neto Actual",
            "balance": "Balance",
            "debts_to_collect": "Deudas (Cobrar)",
            "debts_to_pay": "Deudas (Pagar)",
            "finances": "Finanzas",
            "my_household": "Mi Hogar",
            "management": "Gestión",
            "debts": "Deudas",
            "pacts": "Pactos"
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
