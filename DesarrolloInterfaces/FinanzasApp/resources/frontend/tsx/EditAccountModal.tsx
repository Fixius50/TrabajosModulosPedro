import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { close, save } from 'ionicons/icons';
import { bankAccountService, type BankAccount } from '../ts/bankAccountService';

interface EditAccountModalProps {
    account: BankAccount;
    onSuccess: () => void;
    onClose: () => void;
}

const EditAccountModal: React.FC<EditAccountModalProps> = ({
    account,
    onSuccess,
    onClose,
}) => {
    const [accountName, setAccountName] = useState(account.account_name);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!accountName.trim()) {
            setError('El nombre de la cuenta no puede estar vacío');
            return;
        }

        try {
            setLoading(true);
            setError('');

            await bankAccountService.updateAccount(account.id, {
                account_name: accountName,
            });

            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Error al actualizar la cuenta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-[#1a1616] border-2 border-[#d4af37]/30 rounded-xl p-8 shadow-[0_0_50px_rgba(212,175,55,0.3)]">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <IonIcon icon={close} className="text-2xl" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl text-[#d4af37] font-[Cinzel] font-bold tracking-wider mb-2">
                        Editar Cuenta
                    </h2>
                    <p className="text-sm text-gray-400">
                        {account.bank_name}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Nombre de la Cuenta
                        </label>
                        <input
                            type="text"
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value)}
                            className="w-full bg-[#0f0a0a] border-2 border-[#4a4e5a] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#d4af37]"
                            placeholder="Mi Cuenta Principal"
                            autoFocus
                        />
                    </div>

                    {/* Read-only info */}
                    <div className="space-y-3 p-4 bg-[#0f0a0a] border border-[#4a4e5a] rounded-lg">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Banco:</span>
                            <span className="text-white">{account.bank_name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Sucursal:</span>
                            <span className="text-white">{account.branch_name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">IBAN:</span>
                            <span className="text-white font-mono text-xs">{account.iban}</span>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-[#0f0a0a] border border-[#4a4e5a] text-gray-400 rounded-lg hover:border-[#d4af37] hover:text-[#d4af37] transition-all"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#d4af37] text-[#0f0a0a] rounded-lg hover:bg-[#c5a059] transition-all font-[Cinzel] font-bold disabled:opacity-50"
                            disabled={loading}
                        >
                            <IonIcon icon={save} />
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditAccountModal;
