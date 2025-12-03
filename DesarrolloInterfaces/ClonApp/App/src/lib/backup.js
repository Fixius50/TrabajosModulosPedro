export const BackupService = {
    // Keys to persist
    STORAGE_KEYS: [
        'notion_v82_ws',
        'notion_v82_profile',
        'notion_v82_themes',
        'notion_v82_fonts',
        'notion_v82_active_id',
        'notion_v82_active_theme'
    ],

    saveBackup: (userId) => {
        if (!userId) return;
        const backup = {};
        BackupService.STORAGE_KEYS.forEach(key => {
            const data = localStorage.getItem(key);
            if (data) backup[key] = JSON.parse(data);
        });
        // Simulate saving to "backups/" folder by using a prefixed localStorage key
        const backupKey = `notion_backup_${userId}`;
        localStorage.setItem(backupKey, JSON.stringify(backup));
        console.log(`[Backup] Saved data for ${userId} to ${backupKey}`);
    },

    restoreBackup: (userId) => {
        if (!userId) return false;
        const backupKey = `notion_backup_${userId}`;
        const backupData = localStorage.getItem(backupKey);

        if (backupData) {
            const backup = JSON.parse(backupData);
            Object.keys(backup).forEach(key => {
                localStorage.setItem(key, JSON.stringify(backup[key]));
            });
            console.log(`[Backup] Restored data for ${userId}`);
            return true;
        }
        return false;
    },

    clearLocalData: () => {
        BackupService.STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
        console.log("[Backup] Local data cleared");
    }
};
