import { supabase } from '../supabaseClient';
import type { RecurringTransaction, Transaction } from '../types';

export const recurringService = {
    // Obtener transacciones recurrentes activas
    getRecurring: async () => {
        const { data, error } = await supabase
            .from('recurring_transactions')
            .select('*')
            .eq('active', true)
            .order('next_run_date', { ascending: true });

        if (error) throw error;
        return data as RecurringTransaction[];
    },

    // Crear nueva recurrencia
    createRecurring: async (recurring: RecurringTransaction) => {
        const { data, error } = await supabase
            .from('recurring_transactions')
            .insert(recurring)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Eliminar (desactivar) recurrencia
    toggleActive: async (id: number, active: boolean) => {
        const { error } = await supabase
            .from('recurring_transactions')
            .update({ active })
            .eq('id', id);

        if (error) throw error;
    },

    // Procesar recurrencias vencidas (Se ejecuta al iniciar la app)
    processDueRecurrences: async () => {
        const today = new Date().toISOString().split('T')[0];
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        // 1. Buscar recurrencias activas donde next_run_date <= hoy
        const { data: activeRecurrences, error } = await supabase
            .from('recurring_transactions')
            .select('*')
            .eq('active', true)
            .lte('next_run_date', today);

        if (error || !activeRecurrences || activeRecurrences.length === 0) return;

        console.log(`Procesando ${activeRecurrences.length} transacciones recurrentes...`);

        for (const recurrence of activeRecurrences) {
            // 2. Crear la transacción real
            const newTransaction: Transaction = {
                user_id: user.user.id,
                amount: recurrence.amount,
                description: `${recurrence.description} (Recurrente)`,
                date: recurrence.next_run_date, // Usar la fecha que tocaba
                type: recurrence.type,
                category: recurrence.category,
                // image_url: copiar si fuera necesario
            };

            const { error: insertError } = await supabase
                .from('transactions')
                .insert(newTransaction);

            if (insertError) {
                console.error("Error creating transaction from recurrence", insertError);
                continue;
            }

            // 3. Calcular siguiente fecha
            const nextDate = calculateNextDate(recurrence.next_run_date, recurrence.interval_unit, recurrence.interval_value);

            // 4. Actualizar la recurrencia
            await supabase
                .from('recurring_transactions')
                .update({ next_run_date: nextDate })
                .eq('id', recurrence.id);
        }
    }
};

// Helper para calcular fechas
function calculateNextDate(currentDateStr: string, unit: string, value: number): string {
    const date = new Date(currentDateStr);

    switch (unit) {
        case 'day':
            date.setDate(date.getDate() + value);
            break;
        case 'week':
            date.setDate(date.getDate() + (value * 7));
            break;
        case 'month':
            date.setMonth(date.getMonth() + value);
            break;
        case 'year':
            date.setFullYear(date.getFullYear() + value);
            break;
    }

    return date.toISOString().split('T')[0];
}
