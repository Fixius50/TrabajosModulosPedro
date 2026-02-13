import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile, uploadAvatar } from '../ts/profileService';
import { useTranslation } from 'react-i18next';

const ProfilePage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [website, setWebsite] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const profile = await getProfile();
            if (profile) {
                setUsername(profile.username || '');
                setWebsite(profile.website || '');
                setAvatarUrl(profile.avatar_url || '');
            }
        } catch (error: any) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateProfile({ username, website, avatar_url: avatarUrl } as any); // Cast to handle id missing in partial
            setToastMessage(t('profile.saved'));
            setShowToast(true);
        } catch (error: any) {
            setToastMessage(t('profile.error') + ': ' + error.message);
            setShowToast(true);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }
        setLoading(true);
        try {
            const file = event.target.files[0];
            // Note: We need to create 'avatars' bucket or verify it exists. 
            // For now assuming we might fail if bucket missing.
            const publicUrl = await uploadAvatar(file);
            setAvatarUrl(publicUrl);
            await updateProfile({ avatar_url: publicUrl } as any);
        } catch (error: any) {
            setToastMessage('Error: ' + error.message);
            setShowToast(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full bg-dungeon-bg bg-wood-texture p-4 overflow-y-auto">
            <div className="max-w-md mx-auto space-y-6">

                {/* Avatar Section */}
                <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 rounded-full border-4 border-gold-coin shadow-coin overflow-hidden bg-black mb-4 group cursor-pointer">
                        <img
                            src={avatarUrl || 'https://ionicframework.com/docs/img/demos/avatar.svg'}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-bold font-dungeon-header">CHANGE</span>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>
                    <h2 className="font-dungeon-header text-parchment text-xl tracking-widest">{username || 'Unknown Hero'}</h2>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-parchment font-dungeon-header text-sm ml-1">Hero Name</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="w-full bg-parchment-texture border-2 border-iron-border rounded p-3 text-ink font-dungeon-body focus:border-gold-coin outline-none"
                            placeholder="Entus Username"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-parchment font-dungeon-header text-sm ml-1">Guild Website</label>
                        <input
                            type="text"
                            value={website}
                            onChange={e => setWebsite(e.target.value)}
                            className="w-full bg-parchment-texture border-2 border-iron-border rounded p-3 text-ink font-dungeon-body focus:border-gold-coin outline-none"
                            placeholder="https://..."
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full bg-gold-coin text-ink font-dungeon-header font-bold py-3 rounded border-2 border-amber-600 shadow-md hover:brightness-110 active:scale-95 transition-all"
                    >
                        {loading ? 'Inscribing...' : 'Save Changes'}
                    </button>
                </div>

                {/* Toast Notification (Simple HTML fallback for Dungeon Theme) */}
                {showToast && (
                    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-black/90 text-gold-coin border border-gold-coin px-6 py-3 rounded-full shadow-lg font-dungeon-header z-50 animate-bounce">
                        {toastMessage}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
