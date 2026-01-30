import { supabase } from './supabaseClient';
import bcrypt from 'bcryptjs';

export interface RecoveryMethod {
    id: string;
    account_id: string;
    method_type: 'sms' | 'email';
    contact_value: string;
    is_verified: boolean;
    created_at: string;
}

class RecoveryService {
    /**
     * Get all recovery methods for an account
     */
    async getRecoveryMethods(accountId: string): Promise<RecoveryMethod[]> {
        const { data, error } = await supabase
            .from('account_recovery_methods')
            .select('*')
            .eq('account_id', accountId);

        if (error) throw error;
        return data || [];
    }

    /**
     * Generate a recovery token (6-digit code)
     */
    async generateRecoveryToken(
        accountId: string,
        methodType: 'sms' | 'email'
    ): Promise<{ token: string; contactValue: string }> {
        // Get the recovery method
        const { data: methods, error: methodError } = await supabase
            .from('account_recovery_methods')
            .select('*')
            .eq('account_id', accountId)
            .eq('method_type', methodType)
            .limit(1);

        if (methodError) throw methodError;
        if (!methods || methods.length === 0) {
            throw new Error(`No ${methodType} recovery method found`);
        }

        const method = methods[0];

        // Generate 6-digit token
        const token = Math.floor(100000 + Math.random() * 900000).toString();

        // Store token (expires in 10 minutes)
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);

        const { error: tokenError } = await supabase
            .from('recovery_tokens')
            .insert({
                account_id: accountId,
                token,
                expires_at: expiresAt.toISOString(),
            });

        if (tokenError) throw tokenError;

        // In a real app, send the token via SMS/Email here
        // For now, we'll just return it
        console.log(`Recovery token for ${methodType}: ${token}`);

        return {
            token,
            contactValue: method.contact_value,
        };
    }

    /**
     * Verify a recovery token (without marking as used)
     */
    async verifyRecoveryToken(accountId: string, token: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('recovery_tokens')
            .select('*')
            .eq('account_id', accountId)
            .eq('token', token)
            .eq('used', false)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return false; // Not found
            throw error;
        }

        // Check if expired
        const expiresAt = new Date(data.expires_at);
        if (expiresAt < new Date()) {
            return false;
        }

        // Don't mark as used here - will be marked in resetSecurityCode
        return true;
    }

    /**
     * Reset security code using recovery token
     */
    async resetSecurityCode(
        accountId: string,
        token: string,
        newCode: string
    ): Promise<void> {
        // Verify token (without marking as used)
        const { data: tokenData, error: tokenError } = await supabase
            .from('recovery_tokens')
            .select('*')
            .eq('account_id', accountId)
            .eq('token', token)
            .eq('used', false)
            .single();

        if (tokenError || !tokenData) {
            throw new Error('Invalid or expired recovery token');
        }

        // Check if expired
        const expiresAt = new Date(tokenData.expires_at);
        if (expiresAt < new Date()) {
            throw new Error('Invalid or expired recovery token');
        }

        // Hash new code
        const security_code_hash = await bcrypt.hash(newCode, 10);

        // Update account
        const { error } = await supabase
            .from('bank_accounts')
            .update({
                security_code_hash,
                is_locked: false,
                failed_attempts: 0,
            })
            .eq('id', accountId);

        if (error) throw error;

        // Mark token as used AFTER successfully updating the code
        await supabase
            .from('recovery_tokens')
            .update({ used: true })
            .eq('id', tokenData.id);
    }

    /**
     * Send recovery email (mock implementation)
     */
    async sendRecoveryEmail(email: string, token: string): Promise<void> {
        // In production, this would call an Edge Function
        console.log(`[MOCK EMAIL] Sending recovery code to ${email}: ${token}`);

        // TODO: Call Supabase Edge Function
        // const { data, error } = await supabase.functions.invoke('send-recovery-email', {
        //   body: { email, token }
        // });
    }

    /**
     * Send recovery SMS (mock implementation)
     */
    async sendRecoverySMS(phone: string, token: string): Promise<void> {
        // In production, this would call an Edge Function
        console.log(`[MOCK SMS] Sending recovery code to ${phone}: ${token}`);

        // TODO: Call Supabase Edge Function
        // const { data, error } = await supabase.functions.invoke('send-recovery-sms', {
        //   body: { phone, token }
        // });
    }

    /**
     * Add a new recovery method to an account
     */
    async addRecoveryMethod(
        accountId: string,
        methodType: 'sms' | 'email',
        contactValue: string
    ): Promise<RecoveryMethod> {
        const { data, error } = await supabase
            .from('account_recovery_methods')
            .insert({
                account_id: accountId,
                method_type: methodType,
                contact_value: contactValue,
                is_verified: true, // Auto-verify for now
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Remove a recovery method
     */
    async removeRecoveryMethod(methodId: string): Promise<void> {
        const { error } = await supabase
            .from('account_recovery_methods')
            .delete()
            .eq('id', methodId);

        if (error) throw error;
    }
}

export const recoveryService = new RecoveryService();
