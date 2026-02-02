import React, { useState, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { close, arrowBack, mailOutline, phonePortraitOutline, checkmarkCircle } from 'ionicons/icons';
import type { BankAccount } from '../ts/bankAccountService';
import { recoveryService, type RecoveryMethod } from '../ts/recoveryService';

interface RecoveryFlowProps {
    account: BankAccount;
    onSuccess: () => void;
    onBack: () => void;
    onClose: () => void;
}

const RecoveryFlow: React.FC<RecoveryFlowProps> = ({
    account,
    onSuccess,
    onBack,
    onClose,
}) => {
    const [step, setStep] = useState(1);
    const [methods, setMethods] = useState<RecoveryMethod[]>([]);
    const [selectedMethod, setSelectedMethod] = useState<RecoveryMethod | null>(null);
    const [inputToken, setInputToken] = useState('');
    const [newCode, setNewCode] = useState('');
    const [confirmCode, setConfirmCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadRecoveryMethods();
    }, []);

    const loadRecoveryMethods = async () => {
        try {
            const data = await recoveryService.getRecoveryMethods(account.id);
            setMethods(data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar métodos de recuperación');
        }
    };

    const handleSelectMethod = async (method: RecoveryMethod) => {
        try {
            setLoading(true);
            setError('');
            setSelectedMethod(method);

            const { token, contactValue } = await recoveryService.generateRecoveryToken(
                account.id,
                method.method_type
            );

            // Send token
            if (method.method_type === 'email') {
                await recoveryService.sendRecoveryEmail(contactValue, token);
            } else {
                await recoveryService.sendRecoverySMS(contactValue, token);
            }

            setStep(2);
        } catch (err: any) {
            setError(err.message || 'Error al enviar código de recuperación');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyToken = async () => {
        try {
            setLoading(true);
            setError('');

            const isValid = await recoveryService.verifyRecoveryToken(account.id, inputToken);

            if (isValid) {
                setStep(3);
            } else {
                setError('Código inválido o expirado');
            }
        } catch (err: any) {
            setError(err.message || 'Error al verificar el código');
        } finally {
            setLoading(false);
        }
    };

    const handleResetCode = async () => {
        try {
            setLoading(true);
            setError('');

            if (newCode.length < 4) {
                setError('El código debe tener al menos 4 dígitos');
                return;
            }

            if (newCode !== confirmCode) {
                setError('Los códigos no coinciden');
                return;
            }

            await recoveryService.resetSecurityCode(account.id, inputToken, newCode);
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Error al restablecer el código');
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

                {/* Back Button (only on step 1) */}
                {step === 1 && (
                    <button
                        onClick={onBack}
                        className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors"
                    >
                        <IonIcon icon={arrowBack} className="text-2xl" />
                    </button>
                )}

                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl text-[#d4af37] font-[Cinzel] font-bold tracking-wider mb-2">
                        Recuperar Código
                    </h2>
                    <p className="text-sm text-gray-400">
                        Paso {step} de 3
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Step 1: Select Method */}
                {step === 1 && (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-400 text-center mb-6">
                            Selecciona cómo deseas recibir el código de recuperación
                        </p>

                        {methods.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-400">
                                    No hay métodos de recuperación configurados
                                </p>
                            </div>
                        ) : (
                            methods.map(method => (
                                <button
                                    key={method.id}
                                    onClick={() => handleSelectMethod(method)}
                                    disabled={loading}
                                    className="w-full p-4 bg-[#0f0a0a] border-2 border-[#4a4e5a] rounded-lg hover:border-[#d4af37] transition-all text-left group disabled:opacity-50"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#d4af37]/10 rounded-full flex items-center justify-center group-hover:bg-[#d4af37]/20 transition-colors">
                                            <IonIcon
                                                icon={method.method_type === 'email' ? mailOutline : phonePortraitOutline}
                                                className="text-2xl text-[#d4af37]"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-semibold mb-1">
                                                {method.method_type === 'email' ? 'Email' : 'SMS'}
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                {method.contact_value}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                )}

                {/* Step 2: Verify Token */}
                {step === 2 && selectedMethod && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-[#d4af37]/10 rounded-full flex items-center justify-center">
                                <IonIcon
                                    icon={selectedMethod.method_type === 'email' ? mailOutline : phonePortraitOutline}
                                    className="text-4xl text-[#d4af37]"
                                />
                            </div>
                            <p className="text-sm text-gray-400 mb-2">
                                Hemos enviado un código de 6 dígitos a:
                            </p>
                            <p className="text-white font-semibold mb-4">
                                {selectedMethod.contact_value}
                            </p>
                            {/* Show token in console for testing */}
                            <p className="text-xs text-gray-600 italic">
                                (Revisa la consola del navegador para ver el código de prueba)
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2 text-center">
                                Ingresa el código recibido
                            </label>
                            <input
                                type="text"
                                value={inputToken}
                                onChange={(e) => setInputToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full bg-[#0f0a0a] border-2 border-[#4a4e5a] text-white px-4 py-4 rounded-lg focus:outline-none focus:border-[#d4af37] text-center text-3xl tracking-[0.8em] font-mono"
                                placeholder="••••••"
                                maxLength={6}
                                autoFocus
                            />
                        </div>

                        <button
                            onClick={handleVerifyToken}
                            disabled={loading || inputToken.length !== 6}
                            className="w-full py-3 bg-[#d4af37] text-[#0f0a0a] rounded-lg hover:bg-[#c5a059] transition-all font-[Cinzel] font-bold tracking-wider disabled:opacity-50"
                        >
                            {loading ? 'Verificando...' : 'Verificar'}
                        </button>

                        <button
                            onClick={() => setStep(1)}
                            className="w-full text-sm text-gray-400 hover:text-[#d4af37] transition-colors"
                        >
                            Usar otro método
                        </button>
                    </div>
                )}

                {/* Step 3: New Code */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-green-500/10 rounded-full flex items-center justify-center">
                                <IonIcon icon={checkmarkCircle} className="text-4xl text-green-400" />
                            </div>
                            <p className="text-sm text-gray-400">
                                Código verificado. Ahora establece un nuevo código de seguridad.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">
                                Nuevo Código (4-6 dígitos)
                            </label>
                            <input
                                type="password"
                                value={newCode}
                                onChange={(e) => setNewCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full bg-[#0f0a0a] border-2 border-[#4a4e5a] text-white px-4 py-4 rounded-lg focus:outline-none focus:border-[#d4af37] text-center text-3xl tracking-[0.8em] font-mono"
                                placeholder="••••"
                                maxLength={6}
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">
                                Confirmar Código
                            </label>
                            <input
                                type="password"
                                value={confirmCode}
                                onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full bg-[#0f0a0a] border-2 border-[#4a4e5a] text-white px-4 py-4 rounded-lg focus:outline-none focus:border-[#d4af37] text-center text-3xl tracking-[0.8em] font-mono"
                                placeholder="••••"
                                maxLength={6}
                            />
                        </div>

                        <button
                            onClick={handleResetCode}
                            disabled={loading || newCode.length < 4 || newCode !== confirmCode}
                            className="w-full py-3 bg-[#d4af37] text-[#0f0a0a] rounded-lg hover:bg-[#c5a059] transition-all font-[Cinzel] font-bold tracking-wider disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Establecer Nuevo Código'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecoveryFlow;
