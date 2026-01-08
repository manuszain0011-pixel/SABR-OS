import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

// Zakat Nisab thresholds (approximate, should ideally fetch live gold/silver prices)
// Gold: 85g, Silver: 595g
const GOLD_PRICE_PER_GRAM = 75.00; // Example placeholder price in USD
const SILVER_PRICE_PER_GRAM = 0.90; // Example placeholder price in USD

export const NISAB_GOLD = 85 * GOLD_PRICE_PER_GRAM;
export const NISAB_SILVER = 595 * SILVER_PRICE_PER_GRAM;

export interface ZakatRecord {
    id: string;
    user_id: string;
    year: number;
    cash_amount?: number;
    gold_value?: number;
    silver_value?: number;
    investments_value?: number;
    business_value?: number;
    debts_deducted?: number;
    nisab_amount: number;
    total_zakatable_wealth: number;
    zakat_due: number;
    zakat_paid: number;
    is_paid: boolean;
    payment_date?: string;
    notes?: string;
    created_at: string;
    updated_at?: string;
}

export function useZakat() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: zakatRecords = [], isLoading } = useQuery({
        queryKey: ['zakat_records', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from('zakat_records' as any)
                .select('*')
                .eq('user_id', user.id)
                .order('year', { ascending: false });

            if (error) throw error;
            return data as unknown as ZakatRecord[];
        },
        enabled: !!user,
    });

    const createZakatRecord = useMutation({
        mutationFn: async (record: Omit<ZakatRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('zakat_records' as any)
                .insert({ ...record, user_id: user.id })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['zakat_records'] });
            toast.success('Zakat record saved');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to save Zakat record');
        }
    });

    const updateZakatRecord = useMutation({
        mutationFn: async ({ id, ...updates }: Partial<ZakatRecord> & { id: string }) => {
            const { data, error } = await supabase
                .from('zakat_records' as any)
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['zakat_records'] });
            toast.success('Zakat record updated');
        },
        onError: (error: any) => {
            toast.error('Failed to update Zakat record');
        }
    });

    const calculateZakat = (
        cash: number,
        goldValue: number,
        silverValue: number,
        investments: number,
        businessAssets: number,
        debts: number
    ) => {
        const totalAssets = cash + goldValue + silverValue + investments + businessAssets;
        const netWealth = Math.max(0, totalAssets - debts);

        const isZakatableSilver = netWealth >= NISAB_SILVER;
        const isZakatableGold = netWealth >= NISAB_GOLD;

        const zakatDueSilver = isZakatableSilver ? netWealth * 0.025 : 0;
        const zakatDueGold = isZakatableGold ? netWealth * 0.025 : 0;

        return {
            totalAssets,
            netWealth,
            isZakatableSilver,
            isZakatableGold,
            zakatDueSilver,
            zakatDueGold,
            nisabSilver: NISAB_SILVER,
            nisabGold: NISAB_GOLD
        };
    };

    const deleteZakatRecord = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('zakat_records' as any)
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['zakat_records'] });
            toast.success('Zakat record deleted');
        },
        onError: (error: any) => {
            toast.error('Failed to delete Zakat record');
        }
    });

    return {
        zakatRecords,
        isLoading,
        createZakatRecord,
        updateZakatRecord,
        deleteZakatRecord,
        calculateZakat,
        NISAB_GOLD,
        NISAB_SILVER
    };
}
