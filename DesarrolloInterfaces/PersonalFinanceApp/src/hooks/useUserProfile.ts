import { useState, useEffect } from 'react';
import { storageService, type UserProfile } from '../services/storageService';

export function useUserProfile() {
    const [profile, setProfile] = useState<UserProfile | null>(null);

    const refreshProfile = () => {
        setProfile(storageService.getUserProfile());
    };

    useEffect(() => {
        refreshProfile();
    }, []);

    return { profile, refreshProfile };
}
