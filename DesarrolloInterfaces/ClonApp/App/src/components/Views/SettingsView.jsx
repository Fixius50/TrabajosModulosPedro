import React, { useRef } from 'react';
import { Camera, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { BackupService } from '../../lib/backup';
import { AuthService } from '../../lib/supabase';

export function SettingsView({ ui, setUi, userProfile, actions, themes, activeThemeId, fonts, activeFontId, fetchMarketData, activeWorkspaceId }) {
    const fileInputRef = useRef(null);

    const triggerUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Implement file upload logic here or call an action
            // For now, we'll just simulate it or use a placeholder
            // You might need to pass a handleUpload prop if the logic is complex and depends on App.jsx state
            console.log("File selected:", file);
            // actions.uploadAvatar(file); // Example
        }
    };

    return (
        <div className="flex h-full">
            <div className="w-48 bg-[var(--sidebar-bg)] border-r border-[rgba(0,0,0,0.05)] pt-8 px-2 space-y-1">
                <div className="px-3 py-2 text-xs font-bold opacity-50 uppercase mb-2">Cuenta</div>
                <button onClick={() => setUi(p => ({ ...p, settingsSection: 'account' }))} className={clsx("w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors", ui.settingsSection === 'account' ? "bg-[rgba(0,0,0,0.05)] font-medium" : "opacity-70 hover:opacity-100 hover:bg-[rgba(0,0,0,0.02)]")}>Mi Perfil</button>
                <button onClick={() => { setUi(p => ({ ...p, settingsSection: 'themes' })); fetchMarketData(); }} className={clsx("w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors", ui.settingsSection === 'themes' ? "bg-[rgba(0,0,0,0.05)] font-medium" : "opacity-70 hover:opacity-100 hover:bg-[rgba(0,0,0,0.02)]")}>Temas & Apariencia</button>
            </div>
            <div className="flex-1 overflow-y-auto px-12 py-12">
                {ui.settingsSection === 'account' && (
                    <div className="max-w-2xl animate-in fade-in duration-300">
                        <h1 className="text-xl font-bold mb-6 pb-2 border-b border-[rgba(0,0,0,0.1)]">Mi Perfil</h1>
                        <div className="flex items-start gap-6 mb-8">
                            <div onClick={triggerUpload} className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity overflow-hidden border border-zinc-200 shrink-0">
                                {userProfile.avatar ? <img src={userProfile.avatar} className="w-full h-full object-cover" /> : <Camera size={32} className="text-zinc-300" />}
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
                            </div>
                            <div className="flex-1 space-y-4">
                                <div>
                                    <label className="text-xs font-bold opacity-50 uppercase block mb-1">Nombre preferido</label>
                                    <input value={userProfile.name} onChange={e => actions.setUserProfile(p => ({ ...p, name: e.target.value }))} className="w-full p-2 border border-zinc-200 rounded text-sm outline-none focus:border-zinc-400 bg-transparent transition-colors" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold opacity-50 uppercase block mb-1">Correo electrónico</label>
                                    <input value={userProfile.email} disabled className="w-full p-2 border border-zinc-200 rounded text-sm bg-[rgba(0,0,0,0.02)] opacity-60 cursor-not-allowed" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3 pt-4 border-t border-zinc-200">
                            <button onClick={async () => { BackupService.saveBackup(userProfile.email); await AuthService.logout(); BackupService.clearLocalData(); window.location.reload(); }} className="text-red-600 border border-red-200 px-4 py-2 rounded hover:bg-red-50 text-sm font-medium flex items-center gap-2"><LogOut size={16} /> Cerrar Sesión</button>
                            <button onClick={() => { if (confirm("¿Estás seguro de que quieres borrar todas las páginas del workspace actual? Esta acción no se puede deshacer.")) { actions.deleteAllPages(); } }} className="text-orange-600 border border-orange-200 px-4 py-2 rounded hover:bg-orange-50 text-sm font-medium w-full">Borrar todas las páginas</button>
                            <button onClick={() => { if (confirm("¿Estás seguro de que quieres borrar todas las bases de datos del workspace actual? Esta acción no se puede deshacer.")) { actions.deleteAllDatabases(); } }} className="text-orange-600 border border-orange-200 px-4 py-2 rounded hover:bg-orange-50 text-sm font-medium w-full">Borrar todas las bases de datos</button>
                            <button onClick={() => { if (confirm("¿Estás seguro de que quieres eliminar este workspace? Esta acción no se puede deshacer.")) { if (actions.removeWorkspace(activeWorkspaceId)) { window.location.reload(); } else { alert("No puedes eliminar el último workspace"); } } }} className="text-red-600 border border-red-200 px-4 py-2 rounded hover:bg-red-50 text-sm font-medium w-full">Eliminar Workspace</button>
                        </div>
                    </div>
                )}
                {ui.settingsSection === 'themes' && (
                    <div className="max-w-2xl animate-in fade-in duration-300">
                        <h1 className="text-xl font-bold mb-6 pb-2 border-b border-[rgba(0,0,0,0.1)]">Apariencia</h1>

                        {/* Fonts Section */}
                        <div className="mb-8">
                            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Tipografía</h2>
                            <div className="grid grid-cols-3 gap-3">
                                {fonts.map(font => (
                                    <button key={font.id} onClick={() => actions.setActiveFontId(font.id)} className={clsx("p-3 border rounded-lg text-left transition-all", activeFontId === font.id ? "border-zinc-900 ring-1 ring-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50")}>
                                        <div className="text-2xl mb-2" style={{ fontFamily: font.value }}>{font.preview || 'Aa'}</div>
                                        <div className="text-sm font-medium text-zinc-900">{font.name}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Temas Instalados</h2>
                        <div className="space-y-3">
                            <div className="p-4 border border-zinc-200 rounded-lg flex justify-between items-center bg-white shadow-sm"><div className="flex items-center gap-3"><div className="w-12 h-12 bg-white border border-zinc-200 rounded-md flex items-center justify-center text-lg font-serif">Aa</div><div><div className="font-bold text-sm text-zinc-900">stylessApp (Default)</div><div className="text-xs text-zinc-500">Tema original (Claro)</div></div></div><button onClick={() => actions.setActiveThemeId('default')} disabled={activeThemeId === 'default'} className={clsx("px-3 py-1.5 rounded text-xs transition-colors", activeThemeId === 'default' ? "bg-green-100 text-green-700 cursor-default font-medium" : "bg-zinc-900 text-white hover:bg-black")}>{activeThemeId === 'default' ? "Activo" : "Aplicar"}</button></div>
                            {themes.filter(t => t.id !== 'default').map(t => (<div key={t.id} className="p-4 border border-zinc-200 rounded-lg flex justify-between items-center bg-white shadow-sm"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-md flex items-center justify-center text-lg font-bold text-white shadow-inner" style={{ backgroundColor: t.colors?.bg || '#333', color: t.colors?.text || '#fff' }}>Aa</div><div><div className="font-bold text-sm text-zinc-900">{t.name}</div><div className="text-xs text-zinc-500">Por {t.author}</div></div></div><div className="flex gap-2"><button onClick={() => actions.removeTheme(t.id)} className="px-3 py-1.5 rounded text-xs transition-colors bg-red-50 text-red-600 hover:bg-red-100">Desinstalar</button><button onClick={() => actions.setActiveThemeId(t.id)} disabled={activeThemeId === t.id} className={clsx("px-3 py-1.5 rounded text-xs transition-colors", activeThemeId === t.id ? "bg-green-100 text-green-700 cursor-default font-medium" : "bg-zinc-900 text-white hover:bg-black")}>{activeThemeId === t.id ? "Activo" : "Aplicar"}</button></div></div>))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
