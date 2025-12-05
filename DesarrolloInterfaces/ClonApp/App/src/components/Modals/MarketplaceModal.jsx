import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Check, Download, Package, Upload, Image as ImageIcon, Type, Smile, Layout, Palette, X } from 'lucide-react';
import { clsx } from 'clsx';
import { Modal, FancyTabs } from '../UI';

export function MarketplaceModal({ isOpen, onClose, ui, setUi, loadingMarket, marketData, themes, fonts, actions, showNotify, activePageId, downloads }) {
    const [activeTab, setActiveTab] = useState('themes');
    const themeInputRef = useRef(null);
    const fontInputRef = useRef(null);
    const iconInputRef = useRef(null);
    const coverInputRef = useRef(null);

    // Reset tab when modal opens
    useEffect(() => {
        if (isOpen) setActiveTab('themes');
    }, [isOpen]);

    const tabs = [
        { id: 'themes', label: 'Temas', icon: Palette },
        { id: 'templates', label: 'Plantillas', icon: Layout },
        { id: 'icons', label: 'Iconos', icon: Smile },
        { id: 'covers', label: 'Portadas', icon: ImageIcon },
        { id: 'fonts', label: 'Tipografía', icon: Type },
        { id: 'import', label: 'Importar', icon: Upload },
    ];

    const handleImportClick = (type) => {
        if (type === 'theme') themeInputRef.current?.click();
        if (type === 'font') fontInputRef.current?.click();
        if (type === 'icon') iconInputRef.current?.click();
        if (type === 'cover') coverInputRef.current?.click();
    };

    const handleImportFile = async (e, type) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            if (type === 'theme') {
                // CSS files
                const reader = new FileReader();
                reader.onload = (e) => {
                    const themeName = file.name.split('.')[0];
                    const theme = {
                        id: themeName.toLowerCase().replace(/\s+/g, '-'),
                        name: themeName,
                        type: 'css',
                        author: 'Importado',
                        url: e.target.result,
                        colors: { bg: '#1a1a1a', text: '#ffffff' }
                    };
                    actions.addTheme(theme);
                    showNotify("Tema importado correctamente");
                    setActiveTab('themes');
                };
                reader.readAsDataURL(file);
            } else if (type === 'font') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const fontName = file.name.split('.')[0];
                    const font = {
                        id: fontName.toLowerCase().replace(/\s+/g, '-'),
                        name: fontName,
                        value: `url('${e.target.result}')`,
                        type: 'custom',
                        author: 'Importado',
                        preview: 'Aa'
                    };
                    actions.addFont(font);
                    showNotify("Fuente importada correctamente");
                    setActiveTab('fonts');
                };
                reader.readAsDataURL(file);
            } else if (type === 'icon') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    actions.addDownloadedIcon({
                        id: 'local-' + Date.now(),
                        data: e.target.result,
                        name: file.name,
                        source: 'local'
                    });
                    showNotify("Icon guardado en biblioteca");
                    setActiveTab('icons');
                };
                reader.readAsDataURL(file);
            } else if (type === 'cover') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    actions.addDownloadedCover({
                        id: 'local-' + Date.now(),
                        url: e.target.result,
                        name: file.name,
                        source: 'local'
                    });
                    showNotify("Portada guardada en biblioteca");
                    setActiveTab('covers');
                };
                reader.readAsDataURL(file);
            }
        } catch (error) {
            console.error("Import error:", error);
            showNotify("Error al importar: " + error.message);
        }
    };

    const handleGet = (item) => {
        if (activeTab === 'themes') {
            actions.addTheme(item);
            showNotify("Tema instalado");
        } else if (activeTab === 'fonts') {
            actions.addFont({ ...item, value: `url('${item.url}')` });
            showNotify("Fuente instalada");
        } else if (activeTab === 'icons') {
            actions.addDownloadedIcon({ id: item.id, data: item.url, name: item.name, source: 'marketplace' });
            showNotify("Icono guardado en biblioteca");
        } else if (activeTab === 'covers') {
            actions.addDownloadedCover({ id: item.id, url: item.preview, name: item.name, source: 'marketplace' });
            showNotify("Portada guardada en biblioteca");
        }
    };

    const handleInstallAll = () => {
        if (activeTab === 'themes') {
            const notInstalled = marketData.styles?.filter(item => !themes.some(th => th.id === item.id)) || [];
            notInstalled.forEach(item => actions.addTheme(item));
            showNotify(`${notInstalled.length} temas instalados`);
        } else if (activeTab === 'fonts') {
            const notInstalled = marketData.fonts?.filter(item => !fonts.some(f => f.id === item.id)) || [];
            notInstalled.forEach(item => actions.addFont({ ...item, value: `url('${item.url}')` }));
            showNotify(`${notInstalled.length} fuentes instaladas`);
        } else if (activeTab === 'icons') {
            const notDownloaded = marketData.icons?.filter(item => !actions.isDownloaded('icons', item.id)) || [];
            notDownloaded.forEach(item => actions.addDownloadedIcon({ id: item.id, data: item.url, name: item.name, source: 'marketplace' }));
            showNotify(`${notDownloaded.length} iconos guardados`);
        } else if (activeTab === 'covers') {
            const notDownloaded = marketData.covers?.filter(item => !actions.isDownloaded('covers', item.id)) || [];
            notDownloaded.forEach(item => actions.addDownloadedCover({ id: item.id, url: item.preview, name: item.name, source: 'marketplace' }));
            showNotify(`${notDownloaded.length} portadas guardadas`);
        }
    };

    const renderContent = () => {
        if (loadingMarket) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-3">
                    <Loader2 className="animate-spin" size={32} />
                    <p className="text-sm font-medium">Cargando marketplace...</p>
                </div>
            );
        }

        if (activeTab === 'import') {
            return (
                <div className="flex flex-col items-center justify-center h-full gap-6 p-10">
                    <div className="text-center space-y-2">
                        <h3 className="text-lg font-semibold text-zinc-900">Importar recursos locales</h3>
                        <p className="text-zinc-500 max-w-md mx-auto">Arrastra carpetas o archivos aquí para añadir tus propios temas, iconos o fuentes.</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
                        <div onClick={() => handleImportClick('icon')} className="border-2 border-dashed border-zinc-200 rounded-xl p-6 flex flex-col items-center gap-3 hover:border-zinc-400 hover:bg-zinc-50 transition-colors cursor-pointer group">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><Smile size={24} /></div>
                            <span className="font-medium text-sm">Iconos</span>
                            <span className="text-xs text-zinc-400">.svg, .png</span>
                        </div>
                        <div onClick={() => handleImportClick('cover')} className="border-2 border-dashed border-zinc-200 rounded-xl p-6 flex flex-col items-center gap-3 hover:border-zinc-400 hover:bg-zinc-50 transition-colors cursor-pointer group">
                            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><ImageIcon size={24} /></div>
                            <span className="font-medium text-sm">Portadas</span>
                            <span className="text-xs text-zinc-400">.jpg, .png</span>
                        </div>
                        <div onClick={() => handleImportClick('theme')} className="border-2 border-dashed border-zinc-200 rounded-xl p-6 flex flex-col items-center gap-3 hover:border-zinc-400 hover:bg-zinc-50 transition-colors cursor-pointer group">
                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><Palette size={24} /></div>
                            <span className="font-medium text-sm">Temas</span>
                            <span className="text-xs text-zinc-400">.css</span>
                        </div>
                        <div onClick={() => handleImportClick('font')} className="border-2 border-dashed border-zinc-200 rounded-xl p-6 flex flex-col items-center gap-3 hover:border-zinc-400 hover:bg-zinc-50 transition-colors cursor-pointer group">
                            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><Type size={24} /></div>
                            <span className="font-medium text-sm">Fuentes</span>
                            <span className="text-xs text-zinc-400">.woff2, .ttf</span>
                        </div>
                    </div>

                    {/* Hidden Inputs */}
                    <input type="file" ref={themeInputRef} accept=".css" onChange={(e) => handleImportFile(e, 'theme')} className="hidden" />
                    <input type="file" ref={fontInputRef} accept=".woff2,.ttf,.otf" onChange={(e) => handleImportFile(e, 'font')} className="hidden" />
                    <input type="file" ref={iconInputRef} accept=".svg,.png,.jpg,.jpeg,.gif" onChange={(e) => handleImportFile(e, 'icon')} className="hidden" />
                    <input type="file" ref={coverInputRef} accept=".jpg,.jpeg,.png,.gif,.webp" onChange={(e) => handleImportFile(e, 'cover')} className="hidden" />
                </div>
            );
        }

        const data = activeTab === 'themes' ? marketData.styles :
            activeTab === 'templates' ? marketData.templates :
                activeTab === 'icons' ? marketData.icons :
                    activeTab === 'covers' ? marketData.covers :
                        activeTab === 'fonts' ? marketData.fonts : [];

        if (!data || data.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-2">
                    <Package size={48} className="opacity-20" />
                    <p>No hay contenido disponible en esta sección</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {/* Delete All Button */}
                {(activeTab === 'themes' || activeTab === 'fonts' || activeTab === 'icons' || activeTab === 'covers') && (
                    <div className="flex justify-end">
                        <button
                            onClick={() => {
                                if (window.confirm('¿Estás seguro de eliminar todos los elementos de esta sección?')) {
                                    if (activeTab === 'themes') {
                                        const installedThemes = themes.filter(th => th.source === 'marketplace');
                                        installedThemes.forEach(item => actions.removeTheme(item.id));
                                        showNotify(`${installedThemes.length} temas eliminados`);
                                    } else if (activeTab === 'fonts') {
                                        const installedFonts = fonts.filter(f => f.source === 'marketplace');
                                        installedFonts.forEach(item => actions.removeFont(item.id));
                                        showNotify(`${installedFonts.length} fuentes eliminadas`);
                                    } else if (activeTab === 'icons') {
                                        const count = downloads.icons?.length || 0;
                                        if (actions.clearDownloadedIcons) {
                                            actions.clearDownloadedIcons();
                                            showNotify(`${count} iconos eliminados`);
                                        }
                                    } else if (activeTab === 'covers') {
                                        const count = downloads.covers?.length || 0;
                                        if (actions.clearDownloadedCovers) {
                                            actions.clearDownloadedCovers();
                                            showNotify(`${count} portadas eliminadas`);
                                        }
                                    }
                                }
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium"
                        >
                            <X size={16} />
                            Eliminar Todo
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.map(item => {
                        // Check if item is installed/downloaded
                        const isThemeInstalled = activeTab === 'themes' && themes.some(th => th.id === item.id);
                        const isFontInstalled = activeTab === 'fonts' && fonts.some(f => f.id === item.id);
                        const isIconDownloaded = activeTab === 'icons' && actions.isDownloaded('icons', item.id);
                        const isCoverDownloaded = activeTab === 'covers' && actions.isDownloaded('covers', item.id);
                        const isInstalled = isThemeInstalled || isFontInstalled || isIconDownloaded || isCoverDownloaded;

                        return (
                            <div
                                key={item.id}
                                className={clsx(
                                    "border rounded-xl p-4 transition-all group relative",
                                    isInstalled
                                        ? "border-green-300 bg-green-50 cursor-default"
                                        : "border-zinc-200 bg-white hover:shadow-lg hover:border-zinc-300 cursor-pointer"
                                )}
                                onClick={() => {
                                    if (activeTab === 'templates') {
                                        actions.addPage({ title: item.name, icon: item.icon, blocks: item.blocks });
                                        onClose();
                                        showNotify("Plantilla aplicada");
                                    } else if (!isInstalled) {
                                        handleGet(item);
                                    }
                                }}>



                                {/* Preview Area */}
                                <div className={clsx(
                                    "h-32 rounded-lg mb-4 flex items-center justify-center text-4xl font-bold shadow-sm relative overflow-hidden",
                                    isInstalled ? "bg-green-100" : "bg-zinc-50"
                                )}>
                                    {activeTab === 'themes' && (
                                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: item.colors?.bg || '#333', color: item.colors?.text || '#fff' }}>
                                            <Palette size={48} />
                                        </div>
                                    )}
                                    {activeTab === 'templates' && <span className="text-6xl">{item.icon}</span>}
                                    {activeTab === 'icons' && <img src={item.url} alt={item.name} className="w-16 h-16 object-contain" />}
                                    {activeTab === 'covers' && <img src={item.preview} alt={item.name} className="w-full h-full object-cover" />}
                                    {activeTab === 'fonts' && <span className="text-6xl" style={{ fontFamily: item.name }}>Aa</span>}

                                    {isInstalled && <div className="absolute inset-0 bg-green-600/20 flex items-center justify-center"><Check size={32} className="text-green-700 drop-shadow-md" /></div>}
                                </div>

                                {/* Info Area */}
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-zinc-900">{item.name}</div>
                                        <div className="text-xs text-zinc-500">Por {item.author || 'Comunidad'}</div>
                                        {item.count && <div className="text-xs text-zinc-400 mt-1">{item.count} elementos</div>}
                                        {item.type && <div className="text-xs text-zinc-400 mt-1">{item.type}</div>}
                                    </div>

                                    {isInstalled && <span className="text-xs bg-green-600 text-white px-2 py-1 rounded font-medium">Instalado</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Marketplace" className="max-w-5xl h-[85vh] flex flex-col">
            <div className="flex flex-col h-full">
                {/* Custom Tabs */}
                <div className="px-6 pt-2 border-b border-zinc-200 flex gap-6 overflow-x-auto no-scrollbar shrink-0">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={clsx(
                                    "pb-3 text-sm font-medium flex items-center gap-2 transition-colors relative",
                                    isActive ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
                                )}
                            >
                                <Icon size={16} />
                                {tab.label}
                                {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 rounded-t-full" />}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/50">
                    {renderContent()}
                </div>
            </div>
        </Modal>
    );
}
