import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { add, lockClosed, lockOpen, trash, create } from 'ionicons/icons';
import type { BankAccount } from '../ts/bankAccountService';
import AccountUnlockModal from './AccountUnlockModal.tsx';
import EditAccountModal from './EditAccountModal.tsx';

interface BankAccountDashboardProps {
    accounts: BankAccount[];
    onRefresh: () => void;
    onAddAccount: () => void;
    onUnlock: () => void;
}

const BankAccountDashboard: React.FC<BankAccountDashboardProps> = ({
    accounts,
    onRefresh,
    onAddAccount,
    onUnlock,
}) => {
    const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [unlockedAccounts, setUnlockedAccounts] = useState<Set<string>>(new Set());

    const handleUnlockSuccess = (accountId: string) => {
        setUnlockedAccounts(prev => new Set(prev).add(accountId));
        setShowUnlockModal(false);
        onUnlock(); // Signal spatial navigation to show up
    };

    const handleAccountClick = (account: BankAccount) => {
        if (unlockedAccounts.has(account.id)) {
            // Already unlocked, show details
            return;
        }

        setSelectedAccount(account);
        setShowUnlockModal(true);
    };

    const handleEdit = (account: BankAccount) => {
        setSelectedAccount(account);
        setShowEditModal(true);
    };

    const getBankEmoji = (bankId: string): string => {
        const emojiMap: Record<string, string> = {
            gringotts: '🏛️',
            ironvault: '⚔️',
            dragonhoard: '🐉',
            elvenleaf: '🍃',
            dwarvenforge: '🔨',
            arcanetreasury: '✨',
            goldencrown: '👑',
            shadowvault: '🌑',
            phoenixfeather: '🔥',
            kraken: '🦑',
        };
        return emojiMap[bankId] || '🏦';
    };

    return (
        <div className="min-h-screen bg-[#0f0a0a] p-6 font-[Cinzel]">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-90"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl text-[#d4af37] font-bold tracking-[0.2em] uppercase mb-2">
                            Arcas del Reino
                        </h1>
                        <p className="text-sm text-gray-400 tracking-widest">
                            Gestiona tus tesoros con sabiduría
                        </p>
                    </div>
                    <button
                        onClick={onAddAccount}
                        className="flex items-center gap-2 px-6 py-3 bg-[#d4af37] text-[#0f0a0a] rounded hover:bg-[#c5a059] transition-all font-bold"
                    >
                        <IonIcon icon={add} className="text-xl" />
                        Nueva Cuenta
                    </button>
                </div>

                {/* Accounts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {accounts.map(account => {
                        const isUnlocked = unlockedAccounts.has(account.id);

                        return (
                            <div
                                key={account.id}
                                className="bg-[#1a1616]/95 border-2 border-[#4a4e5a] rounded-xl p-6 backdrop-blur-md hover:border-[#d4af37] transition-all cursor-pointer group relative overflow-hidden"
                                onClick={() => !isUnlocked && handleAccountClick(account)}
                            >
                                {/* Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/0 to-[#d4af37]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="relative z-10">
                                    {/* Bank Icon & Status */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="text-4xl">
                                            {getBankEmoji(account.bank_id)}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {account.is_locked ? (
                                                <div className="flex items-center gap-1 text-red-400">
                                                    <IonIcon icon={lockClosed} className="text-sm" />
                                                    <span className="text-xs">Bloqueada</span>
                                                </div>
                                            ) : isUnlocked ? (
                                                <div className="flex items-center gap-1 text-green-400">
                                                    <IonIcon icon={lockOpen} className="text-sm" />
                                                    <span className="text-xs">Desbloqueada</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-gray-400">
                                                    <IonIcon icon={lockClosed} className="text-sm" />
                                                    <span className="text-xs">Bloqueada</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Account Name */}
                                    <h3 className="text-xl text-[#d4af37] font-bold mb-2 truncate">
                                        {account.account_name}
                                    </h3>

                                    {/* Bank Name */}
                                    <p className="text-sm text-gray-400 mb-4 truncate">
                                        {account.bank_name} - {account.branch_name}
                                    </p>

                                    {/* Balance */}
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-500 mb-1">Balance</p>
                                        <p className="text-2xl text-white font-bold">
                                            {isUnlocked ? (
                                                `${account.balance.toFixed(2)} ${account.currency}`
                                            ) : (
                                                '••••••'
                                            )}
                                        </p>
                                    </div>

                                    {/* IBAN */}
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-500 mb-1">IBAN</p>
                                        <p className="text-xs text-gray-400 font-mono">
                                            {isUnlocked ? account.iban : '•••• •••• •••• •••• •••• ••••'}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    {isUnlocked && (
                                        <div className="flex gap-2 mt-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(account);
                                                }}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#0f0a0a] border border-[#4a4e5a] text-gray-400 rounded hover:border-[#d4af37] hover:text-[#d4af37] transition-all text-sm"
                                            >
                                                <IonIcon icon={create} />
                                                Editar
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // TODO: Delete confirmation
                                                }}
                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0f0a0a] border border-red-500/50 text-red-400 rounded hover:bg-red-900/20 transition-all text-sm"
                                            >
                                                <IonIcon icon={trash} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {accounts.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg mb-4">
                            No tienes cuentas bancarias registradas
                        </p>
                        <button
                            onClick={onAddAccount}
                            className="px-6 py-3 bg-[#d4af37] text-[#0f0a0a] rounded hover:bg-[#c5a059] transition-all font-bold"
                        >
                            Crear Primera Cuenta
                        </button>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showUnlockModal && selectedAccount && (
                <AccountUnlockModal
                    account={selectedAccount}
                    onSuccess={() => handleUnlockSuccess(selectedAccount.id)}
                    onClose={() => setShowUnlockModal(false)}
                />
            )}

            {showEditModal && selectedAccount && (
                <EditAccountModal
                    account={selectedAccount}
                    onSuccess={() => {
                        setShowEditModal(false);
                        onRefresh();
                    }}
                    onClose={() => setShowEditModal(false)}
                />
            )}
        </div>
    );
};

export default BankAccountDashboard;
