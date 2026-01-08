import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { addDays } from 'date-fns';

export type MemorizationQuality = 1 | 2 | 3 | 4 | 5;

export interface MemorizationEntry {
    id: string;
    user_id: string;
    surah_number: number;
    ayah_from: number;
    ayah_to: number;
    memorized_date: string;
    last_revised_date?: string;
    revision_count: number;
    next_revision_date?: string;
    quality_rating?: MemorizationQuality;
    tajweed_notes?: string;
    tafsir_notes?: string;
    is_solid: boolean;
    created_at: string;
}

export function useQuranMemorization() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: memorizedVerses = [], isLoading } = useQuery({
        queryKey: ['quran_memorization', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from('quran_memorization' as any)
                .select('*')
                .eq('user_id', user.id)
                .order('surah_number', { ascending: true })
                .order('ayah_from', { ascending: true });

            if (error) throw error;
            return data as unknown as MemorizationEntry[];
        },
        enabled: !!user,
    });

    const addMemorization = useMutation({
        mutationFn: async (entry: Omit<MemorizationEntry, 'id' | 'user_id' | 'created_at' | 'revision_count' | 'is_solid'>) => {
            if (!user) throw new Error('Not authenticated');

            // Calculate initial next revision date (Day 1 -> Next: Day 2)
            const nextRevision = addDays(new Date(), 1).toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('quran_memorization' as any)
                .insert({
                    ...entry,
                    user_id: user.id,
                    revision_count: 0,
                    is_solid: false,
                    next_revision_date: nextRevision
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quran_memorization'] });
            toast.success('Memorization recorded successfully');
        },
        onError: (error: any) => {
            console.error('Error recording memorization:', error);
            toast.error(error.message || 'Failed to record memorization');
        }
    });

    const logRevision = useMutation({
        mutationFn: async ({ id, quality, notes }: { id: string; quality: MemorizationQuality; notes?: string }) => {
            if (!user) throw new Error('Not authenticated');

            // Get current revision count to calculate next interval
            // Algorithm: 1 -> 2 -> 4 -> 7 -> 14 -> 30
            const currentEntry = memorizedVerses.find(m => m.id === id);
            const currentCount = currentEntry?.revision_count || 0;

            let nextInterval = 1;
            if (currentCount >= 0) nextInterval = 2; // After 1st revision
            if (currentCount >= 1) nextInterval = 4;
            if (currentCount >= 2) nextInterval = 7;
            if (currentCount >= 3) nextInterval = 14;
            if (currentCount >= 4) nextInterval = 30; // Monthly thereafter

            const nextDate = addDays(new Date(), nextInterval).toISOString().split('T')[0];
            const today = new Date().toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('quran_memorization' as any)
                .update({
                    last_revised_date: today,
                    next_revision_date: nextDate,
                    revision_count: currentCount + 1,
                    quality_rating: quality,
                    tajweed_notes: notes ? notes : currentEntry?.tajweed_notes
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quran_memorization'] });
            toast.success('Revision logged successfully');
        },
        onError: (error: any) => {
            toast.error('Failed to log revision');
        }
    });

    const getDueRevisions = () => {
        const today = new Date().toISOString().split('T')[0];
        return memorizedVerses.filter(m => m.next_revision_date && m.next_revision_date <= today);
    };

    return {
        memorizedVerses,
        isLoading,
        addMemorization,
        logRevision,
        getDueRevisions
    };
}
