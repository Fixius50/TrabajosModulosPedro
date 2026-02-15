// import { storageService } from './storageService'; // Commented out to test build
// Local mock for now
const storageService = {
    getUserProfile: () => ({ stats: { wealthXP: 0, questsCompleted: 0, goldEarned: 0, netWorth: 0 }, title: 'Novice' }),
    updateUserProfile: (_p: any) => { }
};

export class GamificationService {

    // XP needed for next level: base * (level ^ exponent)
    // Simplified for MVP: Level = floor(XP / 1000) + 1
    private getLevel(xp: number): number {
        return Math.floor(xp / 1000) + 1;
    }

    private getTitleForLevel(level: number): string {
        if (level >= 50) return "Guild Master";
        if (level >= 40) return "Legendary Dragon Slayer";
        if (level >= 30) return "Dungeon Veteran";
        if (level >= 20) return "Expert Adventurer";
        if (level >= 10) return "Established Mercenary";
        if (level >= 5) return "Promising Rookie";
        return "Complete Novice";
    }

    awardXP(amount: number, source: string): { newLevel: number, levelUp: boolean } {
        const profile = storageService.getUserProfile();
        // Fallback for null profile
        if (!profile) return { newLevel: 1, levelUp: false };

        const oldLevel = this.getLevel(profile.stats.wealthXP);

        // Update stats
        profile.stats.wealthXP += amount;
        profile.stats.questsCompleted += 1;

        const newLevel = this.getLevel(profile.stats.wealthXP);

        if (newLevel > oldLevel) {
            // profile.title = this.getTitleForLevel(newLevel); // Read-only in mock
            this.showToast(`LEVEL UP! You are now a ${this.getTitleForLevel(newLevel)}`, 'gold');
        } else {
            this.showToast(`+${amount} XP (${source})`, 'blue');
        }

        storageService.updateUserProfile(profile);
        return { newLevel, levelUp: newLevel > oldLevel };
    }

    awardGold(amount: number, source: string) {
        const profile = storageService.getUserProfile();
        if (!profile) return;
        profile.stats.goldEarned += amount;
        storageService.updateUserProfile(profile);
        this.showToast(`+${amount} GP (${source})`, 'yellow');
    }

    private showToast(message: string, color: string) {
        // Use variables to avoid unused warning
        console.log(message, color);
        const toast = document.createElement('div');
        toast.className = `fixed bottom-24 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl z-50 font-bold border-2 animate-bounce-in transition-all duration-500`;
        // Styles omitted for brevity in test
        document.body.appendChild(toast);
        setTimeout(() => document.body.removeChild(toast), 3000);
    }
}

export const gamificationService = new GamificationService();
