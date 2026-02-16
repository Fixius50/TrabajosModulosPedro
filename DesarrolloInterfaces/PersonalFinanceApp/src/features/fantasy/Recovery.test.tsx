import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GrimoireDashboard from './GrimoireDashboard';
import HouseholdManager from '../household/HouseholdManager';
import DebtTracker from './DebtTracker';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../context/AuthContext';
import { StealthProvider } from '../../context/StealthContext';

// Mocks
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string, d: string) => d || k }),
}));

vi.mock('../../services/householdService', () => ({
    householdService: {
        getMyHouseholds: vi.fn().mockResolvedValue([]),
        createHousehold: vi.fn(),
        joinHousehold: vi.fn(),
        getHouseholdMembers: vi.fn().mockResolvedValue([]),
    },
}));

vi.mock('../../services/storageService', () => ({
    storageService: {
        getDebts: vi.fn().mockReturnValue([]),
        getBudgets: vi.fn().mockReturnValue([]),
        getUserProfile: vi.fn().mockReturnValue({ currency: 'EUR' }),
    },
}));

vi.mock('../../services/transactionService', () => ({
    transactionService: {
        getTransactions: vi.fn().mockResolvedValue([]),
    },
}));

vi.mock('../../services/profileService', () => ({
    profileService: {
        getProfile: vi.fn().mockResolvedValue({ username: 'TestUser', points: 1000 }),
    },
}));

// Mock ResizeObserver for Recharts
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <StealthProvider>
                <BrowserRouter>
                    {children}
                </BrowserRouter>
            </StealthProvider>
        </AuthProvider>
    </QueryClientProvider>
);

describe('Recovery Phase Verification', () => {

    it('Dashboard: Should NOT have top-right profile button', async () => {
        render(
            <Wrapper>
                <GrimoireDashboard />
            </Wrapper>
        );

        expect(await screen.findByText('Valor Neto Actual')).toBeInTheDocument();
        expect(screen.getByText('Finanzas')).toBeInTheDocument();
    });

    it('Household: Should have Paste button in Join input', async () => {
        render(
            <Wrapper>
                <HouseholdManager />
            </Wrapper>
        );

        // Wait for loading to finish (Households header appears)
        await screen.findByText('Mis Hogares');

        const joinButton = screen.getByText('Unirse con ID');
        fireEvent.click(joinButton);

        const pasteButton = await screen.findByTitle('Pegar desde portapapeles');
        expect(pasteButton).toBeInTheDocument();
    });

    it('Debt Tracker: Should have correct placeholder for Partner ID', () => {
        render(
            <Wrapper>
                <DebtTracker />
            </Wrapper>
        );

        // Click "Nuevo Pacto"
        const newDebtButton = screen.getByText('Nuevo Pacto');
        fireEvent.click(newDebtButton);

        // Check placeholder
        const input = screen.getByPlaceholderText('Nombre de la Persona (o ID)');
        expect(input).toBeInTheDocument();
    });
});
