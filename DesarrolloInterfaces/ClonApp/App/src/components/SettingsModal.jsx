import React, { useState, useRef } from 'react';
import { Modal } from './UI';
import { clsx } from 'clsx';
import {
    User, Settings, Bell, Monitor, Globe, Moon, Sun,
    Check, ChevronRight, Camera, LogOut, Upload, Mail
} from 'lucide-react';
import { AuthService } from '../lib/supabase';
import { BackupService } from '../lib/backup';

export const SettingsModal = ({ isOpen, onClose, userProfile, actions, themes, activeThemeId, activeFontId }) => {
    const [activeTab, setActiveTab] = useState('my-account');
    const fileInputRef = useRef(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                actions.setUserProfile(p => ({ ...p, avatar: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const tabs = [
        {
            id: 'account', label: 'Cuenta', items: [
                { id: 'my-account', label: 'Mi cuenta', icon: <User size={16} /> },
                { id: 'notifications', label: 'Notificaciones', icon: <Bell size={16} /> },
            ]
        },
        {
            id: 'preferences', label: 'Preferencias', items: [
                { id: 'appearance', label: 'Apariencia', icon: <Monitor size={16} /> },
                { id: 'language', label: 'Idioma y región', icon: <Globe size={16} /> },
            ]
        }
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl h-[80vh] flex overflow-hidden" title="">
            <div className="flex h-full">
                {/* Sidebar */}
                <div className="w-64 bg-zinc-50 border-r border-zinc-200 flex-shrink-0 flex flex-col">
                    <div className="p-4 pt-6">
                        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 px-2">{userProfile.email}</div>

                        <div className="space-y-6">
                            {tabs.map(section => (
                                <div key={section.id}>
                                    <div className="px-2 text-xs font-semibold text-zinc-400 mb-1">{section.label}</div>
                                    <div className="space-y-0.5">
                                        {section.items.map(item => (
                                            <button
                                                key={item.id}
                                                onClick={() => setActiveTab(item.id)}
                                                className={clsx(
                                                    "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors",
                                                    activeTab === item.id
                                                        ? "bg-zinc-200 text-zinc-900 font-medium"
                                                        : "text-zinc-600 hover:bg-zinc-100"
                                                )}
                                            >
                                                {item.icon}
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-white">
                    {activeTab === 'my-account' && (
                        <div className="max-w-2xl">
                            <h2 className="text-xl font-bold text-zinc-900 mb-6 pb-4 border-b border-zinc-100">Mi perfil</h2>

                            <div className="flex items-start gap-8 mb-8">
                                <div className="group relative">
                                    <div
                                        onClick={handleAvatarClick}
                                        className="w-24 h-24 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                                    >
                                        {userProfile.avatar ? (
                                            <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-2xl font-bold text-zinc-400">{userProfile.name?.[0]?.toUpperCase()}</span>
                                        )}
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-xs text-white font-medium">Cambiar</span>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Nombre preferido</label>
                                        <input
                                            value={userProfile.name}
                                            onChange={(e) => actions.setUserProfile(p => ({ ...p, name: e.target.value }))}
                                            className="w-full p-2 border border-zinc-200 rounded text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Correo electrónico</label>
                                        <div className="flex items-center gap-2 text-zinc-600 text-sm p-2 bg-zinc-50 rounded border border-zinc-200">
                                            <Mail size={14} />
                                            {userProfile.email}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-zinc-100">
                                <h3 className="text-sm font-bold text-zinc-900 mb-4">Zona de peligro</h3>
                                <button
                                    onClick={async () => {
                                        BackupService.saveBackup(userProfile.email);
                                        await AuthService.logout();
                                        BackupService.clearLocalData();
                                        window.location.reload();
                                    }}
                                    className="text-red-600 hover:bg-red-50 px-4 py-2 rounded border border-red-200 text-sm font-medium flex items-center gap-2 transition-colors"
                                >
                                    <LogOut size={16} /> Cerrar sesión
                                </button>
                                <p className="text-xs text-zinc-400 mt-2">Se guardará una copia de seguridad local antes de salir.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'appearance' && (
                        <div className="max-w-2xl">
                            <h2 className="text-xl font-bold text-zinc-900 mb-6 pb-4 border-b border-zinc-100">Apariencia</h2>

                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-zinc-500 uppercase mb-3">Tema de la aplicación</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <button className="p-3 border border-zinc-200 rounded-lg text-left hover:bg-zinc-50 flex flex-col gap-2">
                                        <div className="w-full h-20 bg-zinc-100 rounded border border-zinc-200 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1/3 h-full bg-zinc-200"></div>
                                        </div>
                                        <span className="text-sm font-medium text-zinc-700">Claro</span>
                                    </button>
                                    <button className="p-3 border border-zinc-200 rounded-lg text-left hover:bg-zinc-50 flex flex-col gap-2">
                                        <div className="w-full h-20 bg-zinc-800 rounded border border-zinc-700 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1/3 h-full bg-zinc-700"></div>
                                        </div>
                                        <span className="text-sm font-medium text-zinc-700">Oscuro</span>
                                    </button>
                                </div>
                                <p className="text-xs text-zinc-400 mt-2">Actualmente ClonApp usa el tema definido por el sistema o el seleccionado en el Marketplace.</p>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-zinc-500 uppercase mb-3">Tipografía</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'sans', name: 'Sans Serif', value: 'ui-sans-serif, system-ui, sans-serif', preview: 'Aa' },
                                        { id: 'serif', name: 'Serif', value: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif', preview: 'Aa' },
                                        { id: 'mono', name: 'Mono', value: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', preview: 'Aa' }
                                    ].map(font => (
                                        <button
                                            key={font.id}
                                            onClick={() => actions.setActiveFontId(font.id)}
                                            className={clsx(
                                                "p-3 border rounded-lg text-left transition-all",
                                                activeFontId === font.id ? "border-zinc-900 ring-1 ring-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                                            )}
                                        >
                                            <div className="text-2xl mb-2" style={{ fontFamily: font.value }}>{font.preview}</div>
                                            <div className="text-sm font-medium text-zinc-900">{font.name}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'language' && (
                        <div className="max-w-2xl">
                            <h2 className="text-xl font-bold text-zinc-900 mb-6 pb-4 border-b border-zinc-100">Idioma y región</h2>
                            <div className="p-4 bg-zinc-50 rounded border border-zinc-200 text-zinc-500 text-sm">
                                Actualmente solo disponible en Español (España).
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="max-w-2xl">
                            <h2 className="text-xl font-bold text-zinc-900 mb-6 pb-4 border-b border-zinc-100">Notificaciones</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium text-zinc-900">Notificaciones de escritorio</div>
                                        <div className="text-xs text-zinc-500">Recibe alertas cuando la app esté cerrada</div>
                                    </div>
                                    <div className="w-10 h-6 bg-zinc-200 rounded-full relative cursor-pointer"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div></div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium text-zinc-900">Correo electrónico</div>
                                        <div className="text-xs text-zinc-500">Resumen semanal de actividad</div>
                                    </div>
                                    <div className="w-10 h-6 bg-indigo-500 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};
