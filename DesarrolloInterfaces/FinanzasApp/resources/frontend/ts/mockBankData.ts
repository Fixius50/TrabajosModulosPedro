// Mock Bank Data for Simulated API (Real + Fantasy/D&D Banks)
export interface BankInfo {
    id: string;
    name: string;
    code: string; // For IBAN generation
    countries: string[];
}

export interface CountryInfo {
    code: string; // ISO 3166-1 alpha-2
    name: string;
    ibanPrefix: string; // First 2 chars of IBAN
}

export interface BranchInfo {
    id: string;
    bankId: string;
    countryCode: string;
    name: string;
    city: string;
    branchCode: string; // 4 digits for IBAN
}

export const MOCK_BANKS: BankInfo[] = [
    // === BANCOS REALES ===
    { id: 'ing', name: 'ING', code: '80', countries: ['ES', 'FR', 'DE'] },
    { id: 'bbva', name: 'BBVA', code: '18', countries: ['ES', 'MX'] },
    { id: 'santander', name: 'Santander', code: '49', countries: ['ES', 'UK', 'BR'] },
    { id: 'caixabank', name: 'CaixaBank', code: '21', countries: ['ES'] },

    // === BANCOS DE FANTASÍA / D&D ===
    { id: 'gringotts', name: '🏛️ Gringotts Wizarding Bank', code: 'GR', countries: ['UK', 'FR'] },
    { id: 'ironvault', name: '⚔️ Iron Vault of Moria', code: 'MO', countries: ['DE', 'ES'] },
    { id: 'dragonhoard', name: '🐉 Dragon\'s Hoard Treasury', code: 'DH', countries: ['ES', 'IT', 'FR'] },
    { id: 'elvenleaf', name: '🍃 Elven Leaf Bank of Rivendell', code: 'EL', countries: ['ES', 'FR', 'PT'] },
    { id: 'dwarvenforge', name: '🔨 Dwarven Forge & Mint', code: 'DF', countries: ['DE', 'ES'] },
    { id: 'arcanetreasury', name: '✨ Arcane Treasury of Waterdeep', code: 'AT', countries: ['ES', 'UK', 'FR'] },
    { id: 'goldencrown', name: '👑 Golden Crown Royal Bank', code: 'GC', countries: ['ES', 'UK'] },
    { id: 'shadowvault', name: '🌑 Shadow Vault of Neverwinter', code: 'SV', countries: ['ES', 'DE', 'FR'] },
    { id: 'phoenixfeather', name: '🔥 Phoenix Feather Financial', code: 'PF', countries: ['ES', 'IT'] },
    { id: 'kraken', name: '🦑 Kraken\'s Deep Sea Deposits', code: 'KR', countries: ['ES', 'PT', 'UK'] },
];

export const MOCK_COUNTRIES: CountryInfo[] = [
    { code: 'ES', name: 'España', ibanPrefix: 'ES' },
    { code: 'FR', name: 'Francia', ibanPrefix: 'FR' },
    { code: 'DE', name: 'Alemania', ibanPrefix: 'DE' },
    { code: 'IT', name: 'Italia', ibanPrefix: 'IT' },
    { code: 'PT', name: 'Portugal', ibanPrefix: 'PT' },
    { code: 'UK', name: 'Reino Unido', ibanPrefix: 'GB' },
    { code: 'BE', name: 'Bélgica', ibanPrefix: 'BE' },
    { code: 'MX', name: 'México', ibanPrefix: 'MX' },
    { code: 'BR', name: 'Brasil', ibanPrefix: 'BR' },
];

export const MOCK_BRANCHES: BranchInfo[] = [
    // === BANCOS REALES ===
    // ING España
    { id: 'ing-es-mad', bankId: 'ing', countryCode: 'ES', name: 'ING Madrid Centro', city: 'Madrid', branchCode: '0001' },
    { id: 'ing-es-bcn', bankId: 'ing', countryCode: 'ES', name: 'ING Barcelona', city: 'Barcelona', branchCode: '0002' },

    // BBVA España
    { id: 'bbva-es-mad', bankId: 'bbva', countryCode: 'ES', name: 'BBVA Gran Vía', city: 'Madrid', branchCode: '0182' },
    { id: 'bbva-es-sev', bankId: 'bbva', countryCode: 'ES', name: 'BBVA Sevilla', city: 'Sevilla', branchCode: '0183' },

    // Santander España
    { id: 'sant-es-mad', bankId: 'santander', countryCode: 'ES', name: 'Santander Castellana', city: 'Madrid', branchCode: '4900' },
    { id: 'sant-es-bil', bankId: 'santander', countryCode: 'ES', name: 'Santander Bilbao', city: 'Bilbao', branchCode: '4901' },

    // CaixaBank España
    { id: 'caix-es-bcn', bankId: 'caixabank', countryCode: 'ES', name: 'CaixaBank Diagonal', city: 'Barcelona', branchCode: '2100' },
    { id: 'caix-es-mad', bankId: 'caixabank', countryCode: 'ES', name: 'CaixaBank Alcalá', city: 'Madrid', branchCode: '2101' },

    // === BANCOS DE FANTASÍA ===
    // Gringotts
    { id: 'grin-uk-lon', bankId: 'gringotts', countryCode: 'UK', name: 'Gringotts Diagon Alley', city: 'London', branchCode: 'GR01' },
    { id: 'grin-fr-par', bankId: 'gringotts', countryCode: 'FR', name: 'Gringotts Rue de la Magie', city: 'Paris', branchCode: 'GR02' },

    // Iron Vault of Moria
    { id: 'iron-de-ber', bankId: 'ironvault', countryCode: 'DE', name: 'Moria Hauptkammer', city: 'Berlin', branchCode: 'MO01' },
    { id: 'iron-es-mad', bankId: 'ironvault', countryCode: 'ES', name: 'Bóveda de Khazad-dûm', city: 'Madrid', branchCode: 'MO02' },

    // Dragon's Hoard
    { id: 'drag-es-mad', bankId: 'dragonhoard', countryCode: 'ES', name: 'Tesoro del Dragón Rojo', city: 'Madrid', branchCode: 'DH01' },
    { id: 'drag-es-bcn', bankId: 'dragonhoard', countryCode: 'ES', name: 'Guarida de Smaug', city: 'Barcelona', branchCode: 'DH02' },
    { id: 'drag-it-rom', bankId: 'dragonhoard', countryCode: 'IT', name: 'Tesoro di Drago', city: 'Roma', branchCode: 'DH03' },

    // Elven Leaf Bank
    { id: 'elve-es-mad', bankId: 'elvenleaf', countryCode: 'ES', name: 'Banco Élfico de Lothlórien', city: 'Madrid', branchCode: 'EL01' },
    { id: 'elve-fr-par', bankId: 'elvenleaf', countryCode: 'FR', name: 'Banque Elfique de Rivendell', city: 'Paris', branchCode: 'EL02' },

    // Dwarven Forge
    { id: 'dwar-de-mun', bankId: 'dwarvenforge', countryCode: 'DE', name: 'Schmiede der Zwerge', city: 'München', branchCode: 'DF01' },
    { id: 'dwar-es-bil', bankId: 'dwarvenforge', countryCode: 'ES', name: 'Forja Enana de Erebor', city: 'Bilbao', branchCode: 'DF02' },

    // Arcane Treasury
    { id: 'arca-es-mad', bankId: 'arcanetreasury', countryCode: 'ES', name: 'Tesorería Arcana Central', city: 'Madrid', branchCode: 'AT01' },
    { id: 'arca-uk-lon', bankId: 'arcanetreasury', countryCode: 'UK', name: 'Waterdeep Arcane Vault', city: 'London', branchCode: 'AT02' },

    // Golden Crown
    { id: 'gold-es-mad', bankId: 'goldencrown', countryCode: 'ES', name: 'Corona Dorada Real', city: 'Madrid', branchCode: 'GC01' },
    { id: 'gold-uk-lon', bankId: 'goldencrown', countryCode: 'UK', name: 'Royal Golden Crown', city: 'London', branchCode: 'GC02' },

    // Shadow Vault
    { id: 'shad-es-bcn', bankId: 'shadowvault', countryCode: 'ES', name: 'Bóveda de las Sombras', city: 'Barcelona', branchCode: 'SV01' },
    { id: 'shad-de-ber', bankId: 'shadowvault', countryCode: 'DE', name: 'Schattentresor', city: 'Berlin', branchCode: 'SV02' },

    // Phoenix Feather
    { id: 'phoe-es-val', bankId: 'phoenixfeather', countryCode: 'ES', name: 'Pluma del Fénix', city: 'Valencia', branchCode: 'PF01' },
    { id: 'phoe-it-mil', bankId: 'phoenixfeather', countryCode: 'IT', name: 'Piuma della Fenice', city: 'Milano', branchCode: 'PF02' },

    // Kraken's Deep
    { id: 'krak-es-mad', bankId: 'kraken', countryCode: 'ES', name: 'Depósitos del Kraken', city: 'Madrid', branchCode: 'KR01' },
    { id: 'krak-pt-lis', bankId: 'kraken', countryCode: 'PT', name: 'Cofres do Kraken', city: 'Lisboa', branchCode: 'KR02' },
];

/**
 * Generate IBAN based on country, bank, and branch
 * Format: CC## BBBB SSSS AAAA AAAA AAAA (varies by country)
 * CC = Country Code
 * ## = Check digits (mock: always "76")
 * BBBB = Bank Code
 * SSSS = Branch Code
 * AAAA... = Account Number (random)
 */
export function generateIBAN(countryCode: string, bankCode: string, branchCode: string): string {
    const country = MOCK_COUNTRIES.find(c => c.code === countryCode);
    if (!country) return '';

    const checkDigits = '76'; // Mock check digits
    const accountNumber = Math.random().toString().slice(2, 14).padEnd(12, '0');

    // Format: ES76 BBBB SSSS AAAA AAAA AAAA
    const iban = `${country.ibanPrefix}${checkDigits}${bankCode}${branchCode}${accountNumber}`;

    // Add spaces for readability
    return iban.match(/.{1,4}/g)?.join(' ') || iban;
}

/**
 * Get available countries for a specific bank
 */
export function getCountriesForBank(bankId: string): CountryInfo[] {
    const bank = MOCK_BANKS.find(b => b.id === bankId);
    if (!bank) return [];

    return MOCK_COUNTRIES.filter(c => bank.countries.includes(c.code));
}

/**
 * Get available branches for a bank in a specific country
 */
export function getBranchesForBankAndCountry(bankId: string, countryCode: string): BranchInfo[] {
    return MOCK_BRANCHES.filter(b => b.bankId === bankId && b.countryCode === countryCode);
}
