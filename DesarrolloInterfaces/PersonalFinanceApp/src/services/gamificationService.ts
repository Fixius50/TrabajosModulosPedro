
import { supabase } from '../lib/supabase';
import { profileService } from './profileService';

export interface Mission {
    id: string;
    title: string;
    description: string;
    reward_points: number;
    type: 'daily' | 'weekly' | 'achievement' | 'main';
    icon: string;
    condition?: any;
}

export interface UserMission {
    user_id: string;
    mission_id: string;
    status: 'active' | 'completed' | 'claimed';
    progress: number;
    completed_at?: string;
    mission?: Mission; // Joined data
}

class GamificationService {

    async getMissions(): Promise<Mission[]> {
        const { data, error } = await supabase
            .from('missions')
            .select('*')
            .order('reward_points', { ascending: true });

        if (error) {
            console.error('Error fetching missions:', error);
            return [];
        }
        return data as Mission[];
    }

    async getUserMissions(userId: string): Promise<UserMission[]> {
        const { data, error } = await supabase
            .from('user_missions')
            .select('*, mission:missions(*)')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching user missions:', error);
            return [];
        }
        return data as UserMission[];
    }

    async startMission(userId: string, missionId: string) {
        const { error } = await supabase
            .from('user_missions')
            .insert({ user_id: userId, mission_id: missionId, status: 'active', progress: 0 })
            .select()
            .single();

        if (error && error.code !== '23505') { // Ignore duplicate key error (already started)
            console.error('Error starting mission:', error);
        }
    }

    async initializeDailyMissions(userId: string) {
        // Fetch all daily missions
        const { data: dailies } = await supabase
            .from('missions')
            .select('id')
            .eq('type', 'daily');

        if (!dailies) return;

        // Insert into user_missions if not exists
        const missionsToInsert = dailies.map(m => ({
            user_id: userId,
            mission_id: m.id,
            status: 'active',
            progress: 0
        }));

        const { error } = await supabase
            .from('user_missions')
            .upsert(missionsToInsert, { onConflict: 'user_id, mission_id', ignoreDuplicates: true });

        if (error) console.error('Error initializing dailies:', error);
    }

    async claimReward(userId: string, missionId: string): Promise<boolean> {
        // Fetch User Mission to check status/reward
        const { data: userMission, error: fetchError } = await supabase
            .from('user_missions')
            .select('*, mission:missions(reward_points)')
            .eq('user_id', userId)
            .eq('mission_id', missionId)
            .single();

        if (fetchError || !userMission) return false;
        if (userMission.status === 'claimed') return false; // Already claimed

        // Add Points
        const points = userMission.mission?.reward_points || 0;
        await profileService.addPoints(userId, points);

        // Update Status to 'claimed'
        const { error: updateError } = await supabase
            .from('user_missions')
            .update({ status: 'claimed', completed_at: new Date().toISOString() })
            .eq('user_id', userId)
            .eq('mission_id', missionId);

        if (updateError) return false;

        this.showToast(`Misión Completada! +${points} XP`, 'gold');
        return true;
    }

    // Helper for manual completion (dev testing or logic trigger)
    async completeMission(userId: string, missionId: string) {
        await supabase
            .from('user_missions')
            .update({ status: 'completed', progress: 100 })
            .eq('user_id', userId)
            .eq('mission_id', missionId);
    }

    private showToast(message: string, color: string) {
        const toast = document.createElement('div');
        toast.className = `fixed bottom-24 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl z-50 font-bold border-2 animate-bounce-in transition-all duration-500`;

        if (color === 'gold') {
            toast.style.background = 'linear-gradient(to right, #b8860b, #f4c025)';
            toast.style.color = '#1a0f0a';
            toast.style.borderColor = '#fff';
            toast.innerHTML = `<span class="material-icons align-middle mr-2">stars</span> ${message}`;
        } else if (color === 'yellow') {
            toast.style.background = '#1a0f0a';
            toast.style.color = '#f4c025';
            toast.style.borderColor = '#f4c025';
            toast.innerHTML = `<span class="material-icons align-middle mr-2">monetization_on</span> ${message}`;
        } else if (color === 'blue') {
            toast.style.background = '#1a0f0a';
            toast.style.color = '#60a5fa';
            toast.style.borderColor = '#60a5fa';
            toast.innerHTML = `<span class="material-icons align-middle mr-2">auto_awesome</span> ${message}`;
        }

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translate(-50%, 20px)';
            setTimeout(() => document.body.removeChild(toast), 500);
        }, 3000);
    }
}

export const gamificationService = new GamificationService();
