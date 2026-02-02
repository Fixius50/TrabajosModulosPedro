import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { close, keyOutline, helpCircleOutline } from 'ionicons/icons';
import { bankAccountService, type BankAccount } from '../ts/bankAccountService';
import RecoveryFlow from './RecoveryFlow.tsx';

interface AccountUnlockModalProps {
    account: BankAccount;
    onSuccess: () => void;
    onClose: () => void;
}

const AccountUnlockModal: React.FC<AccountUnlockModalProps> = ({
    account,
    onSuccess,
    onClose,
}) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showRecovery, setShowRecovery] = useState(false);
    const [shake, setShake] = useState(false);

    const maxAttempts = 3;
    const remainingAttempts = maxAttempts - account.failed_attempts;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (code.length < 4) {
            setError('El código debe tener al menos 4 dígitos');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const isValid = await bankAccountService.verifySecurityCode(account.id, code);

            if (isValid) {
                onSuccess();
            } else {
                setError(`Código incorrecto. Te quedan ${remainingAttempts - 1} intentos.`);
                setShake(true);
                setTimeout(() => setShake(false), 500);
                setCode('');
            }
        } catch (err: any) {
            setError(err.message || 'Error al verificar el código');
            setShake(true);
            setTimeout(() => setShake(false), 500);
            setCode('');
        } finally {
            setLoading(false);
        }
    };

    if (showRecovery) {
        return (
            <RecoveryFlow
                account={account}
                onSuccess={onSuccess}
                onBack={() => setShowRecovery(false)}
                onClose={onClose}
            />
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div
                className={`relative w-full max-w-md bg-[#1a1616] border-2 border-[#d4af37]/30 rounded-xl p-8 shadow-[0_0_50px_rgba(212,175,55,0.3)] ${shake ? 'animate-shake' : ''
                    }`}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <IonIcon icon={close} className="text-2xl" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-[#d4af37]/10 rounded-full flex items-center justify-center">
                        <IonIcon icon={keyOutline} className="text-4xl text-[#d4af37]" />
                    </div>
                    <h2 className="text-2xl text-[#d4af37] font-[Cinzel] font-bold tracking-wider mb-2">
                        Desbloquear Cuenta
                    </h2>
                    <p className="text-sm text-gray-400">
                        {account.account_name}
                    </p>
                </div>

                {/* Locked Warning */}
                {account.is_locked && (
                    <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded text-red-400 text-sm text-center">
                        Esta cuenta está bloqueada. Usa el método de recuperación.
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                {/* PIN Input */}
                {!account.is_locked && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2 text-center">
                                Ingresa tu código de seguridad
                            </label>
                            <input
                                type="password"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full bg-[#0f0a0a] border-2 border-[#4a4e5a] text-white px-4 py-4 rounded-lg focus:outline-none focus:border-[#d4af37] text-center text-3xl tracking-[0.8em] font-mono"
                                placeholder="••••"
                                maxLength={6}
                                autoFocus
                                disabled={loading}
                            />
                        </div>

                        {/* Remaining Attempts */}
                        <div className="text-center">
                            <p className="text-xs text-gray-500">
                                Intentos restantes: <span className={remainingAttempts <= 1 ? 'text-red-400' : 'text-gray-400'}>{remainingAttempts}</span>
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full py-3 bg-[#d4af37] text-[#0f0a0a] rounded-lg hover:bg-[#c5a059] transition-all font-[Cinzel] font-bold tracking-wider disabled:opacity-50"
                            disabled={loading || code.length < 4}
                        >
                            {loading ? 'Verificando...' : 'Desbloquear'}
                        </button>
                    </form>
                )}

                {/* Recovery Link */}
                <button
                    onClick={() => setShowRecovery(true)}
                    className="w-full mt-4 flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-[#d4af37] transition-colors"
                >
                    <IonIcon icon={helpCircleOutline} />
                    ¿Olvidaste tu código?
                </button>
            </div>

            <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
        </div>
    );
};

export default AccountUnlockModal;
