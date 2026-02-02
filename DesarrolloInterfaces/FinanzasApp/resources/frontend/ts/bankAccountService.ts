import { supabase } from './supabaseClient';
import * as bcrypt from 'bcryptjs';

export interface BankAccount {
    id: string;
    user_id: string;
    account_name: string;
    bank_id: string;
    bank_name: string;
    country_code: string;
    branch_id: string;
    branch_name: string;
    iban: string;
    balance: number;
    currency: string;
    account_type: 'checking' | 'savings' | 'credit';
    is_locked: boolean;
    failed_attempts: number;
    last_unlock_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateAccountData {
    account_name: string;
    bank_id: string;
    bank_name: string;
    country_code: string;
    branch_id: string;
    branch_name: string;
    iban: string;
    account_type: 'checking' | 'savings' | 'credit';
    security_code: string;
    recovery_methods: {
        type: 'sms' | 'email';
        value: string;
    }[];
}

export interface UpdateAccountData {
    account_name?: string;
    balance?: number;
}

class BankAccountService {
    /**
     * Get all bank accounts for the current user
     */
    async getUserAccounts(): Promise<BankAccount[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No authenticated user');

        const { data, error } = await supabase
            .from('bank_accounts')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    /**
     * Create a new bank account
     */
    async createAccount(accountData: CreateAccountData): Promise<BankAccount> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No authenticated user');

        // Hash the security code
        const security_code_hash = await bcrypt.hash(accountData.security_code, 10);

        // Create the account
        const { data: account, error: accountError } = await supabase
            .from('bank_accounts')
            .insert({
                user_id: user.id,
                account_name: accountData.account_name,
                bank_id: accountData.bank_id,
                bank_name: accountData.bank_name,
                country_code: accountData.country_code,
                branch_id: accountData.branch_id,
                branch_name: accountData.branch_name,
                iban: accountData.iban,
                account_type: accountData.account_type,
                security_code_hash,
            })
            .select()
            .single();

        if (accountError) throw accountError;

        // Create recovery methods
        if (accountData.recovery_methods.length > 0) {
            const { error: recoveryError } = await supabase
                .from('account_recovery_methods')
                .insert(
                    accountData.recovery_methods.map(method => ({
                        account_id: account.id,
                        method_type: method.type,
                        contact_value: method.value,
                        is_verified: true, // Auto-verify for now
                    }))
                );

            if (recoveryError) throw recoveryError;
        }

        return account;
    }

    /**
     * Update an existing bank account
     */
    async updateAccount(accountId: string, updates: UpdateAccountData): Promise<BankAccount> {
        const { data, error } = await supabase
            .from('bank_accounts')
            .update(updates)
            .eq('id', accountId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Delete a bank account
     */
    async deleteAccount(accountId: string): Promise<void> {
        const { error } = await supabase
            .from('bank_accounts')
            .delete()
            .eq('id', accountId);

        if (error) throw error;
    }

    /**
     * Verify security code for an account
     */
    async verifySecurityCode(accountId: string, code: string): Promise<boolean> {
        // Get the account
        const { data: account, error } = await supabase
            .from('bank_accounts')
            .select('security_code_hash, is_locked, failed_attempts')
            .eq('id', accountId)
            .single();

        if (error) throw error;
        if (!account) throw new Error('Account not found');

        // Check if locked
        if (account.is_locked) {
            throw new Error('Account is locked. Please use recovery method.');
        }

        // Verify code
        const isValid = await bcrypt.compare(code, account.security_code_hash);

        if (isValid) {
            // Reset failed attempts and update last unlock
            await supabase
                .from('bank_accounts')
                .update({
                    failed_attempts: 0,
                    last_unlock_at: new Date().toISOString(),
                })
                .eq('id', accountId);

            return true;
        } else {
            // Increment failed attempts
            const newFailedAttempts = account.failed_attempts + 1;
            const shouldLock = newFailedAttempts >= 3;

            await supabase
                .from('bank_accounts')
                .update({
                    failed_attempts: newFailedAttempts,
                    is_locked: shouldLock,
                })
                .eq('id', accountId);

            if (shouldLock) {
                throw new Error('Account locked after 3 failed attempts');
            }

            return false;
        }
    }

    /**
     * Update security code (requires old code verification)
     */
    async updateSecurityCode(
        accountId: string,
        oldCode: string,
        newCode: string
    ): Promise<void> {
        // Verify old code first
        const isValid = await this.verifySecurityCode(accountId, oldCode);
        if (!isValid) {
            throw new Error('Invalid current security code');
        }

        // Hash new code
        const security_code_hash = await bcrypt.hash(newCode, 10);

        // Update
        const { error } = await supabase
            .from('bank_accounts')
            .update({ security_code_hash })
            .eq('id', accountId);

        if (error) throw error;
    }

    /**
     * Lock an account manually
     */
    async lockAccount(accountId: string): Promise<void> {
        const { error } = await supabase
            .from('bank_accounts')
            .update({ is_locked: true })
            .eq('id', accountId);

        if (error) throw error;
    }

    /**
     * Unlock an account (used after successful recovery)
     */
    async unlockAccount(accountId: string): Promise<void> {
        const { error } = await supabase
            .from('bank_accounts')
            .update({
                is_locked: false,
                failed_attempts: 0,
            })
            .eq('id', accountId);

        if (error) throw error;
    }

    /**
     * Get account by ID
     */
    async getAccountById(accountId: string): Promise<BankAccount | null> {
        const { data, error } = await supabase
            .from('bank_accounts')
            .select('*')
            .eq('id', accountId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }

        return data;
    }
}

export const bankAccountService = new BankAccountService();
