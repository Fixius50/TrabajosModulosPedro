import React, { useState, useEffect } from 'react';
import { bankAccountService, type BankAccount } from '../ts/bankAccountService';
import CreateAccountWizard from './CreateAccountWizard.tsx';
import BankAccountDashboard from './BankAccountDashboard.tsx';

interface BankAccountManagerProps {
    onUnlock: () => void;
}

const BankAccountManager: React.FC<BankAccountManagerProps> = ({ onUnlock }) => {
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [showWizard, setShowWizard] = useState(false);

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        try {
            setLoading(true);
            const data = await bankAccountService.getUserAccounts();
            setAccounts(data);

            // Show wizard if no accounts
            if (data.length === 0) {
                setShowWizard(true);
            }
        } catch (error) {
            console.error('Error loading accounts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccountCreated = () => {
        setShowWizard(false);
        loadAccounts();

        // Redirect to spatial navigation dashboard (center position)
        // This enables the multi-screen layout with smooth spatial transitions
        window.location.href = '/app/dashboard';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0a0a] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#d4af37] mx-auto mb-4"></div>
                    <p className="text-[#d4af37] font-[Cinzel] tracking-widest">
                        Consultando el Oráculo...
                    </p>
                </div>
            </div>
        );
    }

    if (showWizard || accounts.length === 0) {
        return (
            <CreateAccountWizard
                onComplete={handleAccountCreated}
                onCancel={() => accounts.length > 0 && setShowWizard(false)}
            />
        );
    }

    return (
        <BankAccountDashboard
            accounts={accounts}
            onRefresh={loadAccounts}
            onAddAccount={() => setShowWizard(true)}
            onUnlock={onUnlock}
        />
    );
};

export default BankAccountManager;
