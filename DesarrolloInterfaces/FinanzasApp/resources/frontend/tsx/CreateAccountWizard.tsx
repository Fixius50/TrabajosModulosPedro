import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { arrowBack, arrowForward, checkmarkCircle } from 'ionicons/icons';
import {
    MOCK_BANKS,
    getCountriesForBank,
    getBranchesForBankAndCountry,
    generateIBAN,
} from '../ts/mockBankData';
import { bankAccountService, type CreateAccountData } from '../ts/bankAccountService';

interface CreateAccountWizardProps {
    onComplete: () => void;
    onCancel: () => void;
}

const CreateAccountWizard: React.FC<CreateAccountWizardProps> = ({ onComplete, onCancel }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form data
    const [formData, setFormData] = useState({
        account_name: '',
        bank_id: '',
        country_code: '',
        branch_id: '',
        account_type: 'checking' as 'checking' | 'savings' | 'credit',
        security_code: '',
        security_code_confirm: '',
        recovery_email: '',
        recovery_sms: '',
        use_email: false,
        use_sms: false,
    });

    const selectedBank = MOCK_BANKS.find(b => b.id === formData.bank_id);
    const availableCountries = selectedBank ? getCountriesForBank(formData.bank_id) : [];
    const availableBranches = getBranchesForBankAndCountry(formData.bank_id, formData.country_code);
    const selectedBranch = availableBranches.find(b => b.id === formData.branch_id);

    const handleNext = () => {
        setError('');

        // Validation for each step
        if (step === 1) {
            if (!formData.account_name || !formData.bank_id || !formData.country_code || !formData.branch_id) {
                setError('Por favor completa todos los campos');
                return;
            }
        } else if (step === 2) {
            if (!formData.security_code || formData.security_code.length < 4) {
                setError('El código debe tener al menos 4 dígitos');
                return;
            }
            if (formData.security_code !== formData.security_code_confirm) {
                setError('Los códigos no coinciden');
                return;
            }
        } else if (step === 3) {
            if (!formData.use_email && !formData.use_sms) {
                setError('Debes seleccionar al menos un método de recuperación');
                return;
            }
            if (formData.use_email && !formData.recovery_email) {
                setError('Ingresa un email válido');
                return;
            }
            if (formData.use_sms && !formData.recovery_sms) {
                setError('Ingresa un número de teléfono válido');
                return;
            }
        }

        setStep(step + 1);
    };

    const handleBack = () => {
        setError('');
        setStep(step - 1);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError('');

            if (!selectedBank || !selectedBranch) {
                setError('Datos de banco incompletos');
                return;
            }

            const iban = generateIBAN(
                formData.country_code,
                selectedBank.code,
                selectedBranch.branchCode
            );

            const recovery_methods: { type: 'sms' | 'email'; value: string }[] = [];
            if (formData.use_email) {
                recovery_methods.push({ type: 'email', value: formData.recovery_email });
            }
            if (formData.use_sms) {
                recovery_methods.push({ type: 'sms', value: formData.recovery_sms });
            }

            const accountData: CreateAccountData = {
                account_name: formData.account_name,
                bank_id: formData.bank_id,
                bank_name: selectedBank.name,
                country_code: formData.country_code,
                branch_id: formData.branch_id,
                branch_name: selectedBranch.name,
                iban,
                account_type: formData.account_type,
                security_code: formData.security_code,
                recovery_methods,
            };

            await bankAccountService.createAccount(accountData);
            onComplete();
        } catch (err: any) {
            setError(err.message || 'Error al crear la cuenta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0a0a] flex items-center justify-center p-4 font-[Cinzel]">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-90"></div>
            </div>

            {/* Wizard Card */}
            <div className="relative z-10 w-full max-w-2xl bg-[#1a1616]/95 border-2 border-[#d4af37]/30 rounded-xl p-8 backdrop-blur-md shadow-[0_0_50px_rgba(212,175,55,0.2)]">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl text-[#d4af37] font-bold tracking-[0.2em] uppercase mb-2">
                        Nueva Cuenta Bancaria
                    </h1>
                    <p className="text-sm text-gray-400 tracking-widest">
                        Paso {step} de 4
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-[#0f0a0a] rounded-full mb-8 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-[#d4af37] to-[#c5a059] transition-all duration-500"
                        style={{ width: `${(step / 4) * 100}%` }}
                    ></div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Step Content */}
                <div className="min-h-[400px]">
                    {/* Step 1: Basic Information */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-xl text-[#d4af37] mb-4">Información Básica</h2>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Nombre de la Cuenta</label>
                                <input
                                    type="text"
                                    value={formData.account_name}
                                    onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                                    className="w-full bg-[#0f0a0a] border border-[#4a4e5a] text-white px-4 py-3 rounded focus:outline-none focus:border-[#d4af37]"
                                    placeholder="Mi Cuenta Principal"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Banco</label>
                                <select
                                    value={formData.bank_id}
                                    onChange={(e) => setFormData({ ...formData, bank_id: e.target.value, country_code: '', branch_id: '' })}
                                    className="w-full bg-[#0f0a0a] border border-[#4a4e5a] text-white px-4 py-3 rounded focus:outline-none focus:border-[#d4af37]"
                                >
                                    <option value="">Selecciona un banco...</option>
                                    {MOCK_BANKS.map(bank => (
                                        <option key={bank.id} value={bank.id}>{bank.name}</option>
                                    ))}
                                </select>
                            </div>

                            {formData.bank_id && (
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">País</label>
                                    <select
                                        value={formData.country_code}
                                        onChange={(e) => setFormData({ ...formData, country_code: e.target.value, branch_id: '' })}
                                        className="w-full bg-[#0f0a0a] border border-[#4a4e5a] text-white px-4 py-3 rounded focus:outline-none focus:border-[#d4af37]"
                                    >
                                        <option value="">Selecciona un país...</option>
                                        {availableCountries.map(country => (
                                            <option key={country.code} value={country.code}>{country.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {formData.country_code && (
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Sucursal</label>
                                    <select
                                        value={formData.branch_id}
                                        onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                                        className="w-full bg-[#0f0a0a] border border-[#4a4e5a] text-white px-4 py-3 rounded focus:outline-none focus:border-[#d4af37]"
                                    >
                                        <option value="">Selecciona una sucursal...</option>
                                        {availableBranches.map(branch => (
                                            <option key={branch.id} value={branch.id}>
                                                {branch.name} - {branch.city}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Tipo de Cuenta</label>
                                <select
                                    value={formData.account_type}
                                    onChange={(e) => setFormData({ ...formData, account_type: e.target.value as any })}
                                    className="w-full bg-[#0f0a0a] border border-[#4a4e5a] text-white px-4 py-3 rounded focus:outline-none focus:border-[#d4af37]"
                                >
                                    <option value="checking">Cuenta Corriente</option>
                                    <option value="savings">Cuenta de Ahorro</option>
                                    <option value="credit">Tarjeta de Crédito</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Security Code */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-xl text-[#d4af37] mb-4">Código de Seguridad</h2>
                            <p className="text-sm text-gray-400 mb-6">
                                Este código protegerá el acceso a tu cuenta. Recuérdalo bien.
                            </p>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Código (4-6 dígitos)</label>
                                <input
                                    type="password"
                                    value={formData.security_code}
                                    onChange={(e) => setFormData({ ...formData, security_code: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                    className="w-full bg-[#0f0a0a] border border-[#4a4e5a] text-white px-4 py-3 rounded focus:outline-none focus:border-[#d4af37] text-center text-2xl tracking-[0.5em]"
                                    placeholder="••••"
                                    maxLength={6}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Confirmar Código</label>
                                <input
                                    type="password"
                                    value={formData.security_code_confirm}
                                    onChange={(e) => setFormData({ ...formData, security_code_confirm: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                    className="w-full bg-[#0f0a0a] border border-[#4a4e5a] text-white px-4 py-3 rounded focus:outline-none focus:border-[#d4af37] text-center text-2xl tracking-[0.5em]"
                                    placeholder="••••"
                                    maxLength={6}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Recovery Methods */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-xl text-[#d4af37] mb-4">Métodos de Recuperación</h2>
                            <p className="text-sm text-gray-400 mb-6">
                                Selecciona al menos un método para recuperar tu código si lo olvidas.
                            </p>

                            <div className="space-y-4">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.use_email}
                                        onChange={(e) => setFormData({ ...formData, use_email: e.target.checked })}
                                        className="w-5 h-5 text-[#d4af37] bg-[#0f0a0a] border-[#4a4e5a] rounded focus:ring-[#d4af37]"
                                    />
                                    <span className="text-white">Email</span>
                                </label>
                                {formData.use_email && (
                                    <input
                                        type="email"
                                        value={formData.recovery_email}
                                        onChange={(e) => setFormData({ ...formData, recovery_email: e.target.value })}
                                        className="w-full bg-[#0f0a0a] border border-[#4a4e5a] text-white px-4 py-3 rounded focus:outline-none focus:border-[#d4af37]"
                                        placeholder="tu@email.com"
                                    />
                                )}
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.use_sms}
                                        onChange={(e) => setFormData({ ...formData, use_sms: e.target.checked })}
                                        className="w-5 h-5 text-[#d4af37] bg-[#0f0a0a] border-[#4a4e5a] rounded focus:ring-[#d4af37]"
                                    />
                                    <span className="text-white">SMS</span>
                                </label>
                                {formData.use_sms && (
                                    <input
                                        type="tel"
                                        value={formData.recovery_sms}
                                        onChange={(e) => setFormData({ ...formData, recovery_sms: e.target.value })}
                                        className="w-full bg-[#0f0a0a] border border-[#4a4e5a] text-white px-4 py-3 rounded focus:outline-none focus:border-[#d4af37]"
                                        placeholder="+34 600 000 000"
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Confirmation */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <h2 className="text-xl text-[#d4af37] mb-4">Confirmación</h2>

                            <div className="bg-[#0f0a0a] border border-[#4a4e5a] rounded p-6 space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Nombre:</span>
                                    <span className="text-white">{formData.account_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Banco:</span>
                                    <span className="text-white">{selectedBank?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Sucursal:</span>
                                    <span className="text-white">{selectedBranch?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Tipo:</span>
                                    <span className="text-white">
                                        {formData.account_type === 'checking' && 'Cuenta Corriente'}
                                        {formData.account_type === 'savings' && 'Cuenta de Ahorro'}
                                        {formData.account_type === 'credit' && 'Tarjeta de Crédito'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">IBAN:</span>
                                    <span className="text-white font-mono text-sm">
                                        {selectedBank && selectedBranch && generateIBAN(
                                            formData.country_code,
                                            selectedBank.code,
                                            selectedBranch.branchCode
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Recuperación:</span>
                                    <span className="text-white text-sm">
                                        {formData.use_email && formData.recovery_email}
                                        {formData.use_email && formData.use_sms && ', '}
                                        {formData.use_sms && formData.recovery_sms}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                    <button
                        onClick={step === 1 ? onCancel : handleBack}
                        className="flex items-center gap-2 px-6 py-3 bg-[#0f0a0a] border border-[#4a4e5a] text-gray-400 rounded hover:border-[#d4af37] hover:text-[#d4af37] transition-all"
                        disabled={loading}
                    >
                        <IonIcon icon={arrowBack} />
                        {step === 1 ? 'Cancelar' : 'Atrás'}
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-6 py-3 bg-[#d4af37] text-[#0f0a0a] rounded hover:bg-[#c5a059] transition-all font-bold"
                            disabled={loading}
                        >
                            Siguiente
                            <IonIcon icon={arrowForward} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="flex items-center gap-2 px-6 py-3 bg-[#d4af37] text-[#0f0a0a] rounded hover:bg-[#c5a059] transition-all font-bold"
                            disabled={loading}
                        >
                            {loading ? 'Creando...' : 'Crear Cuenta'}
                            <IonIcon icon={checkmarkCircle} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateAccountWizard;
