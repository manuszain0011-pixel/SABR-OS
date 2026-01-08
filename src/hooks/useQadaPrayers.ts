
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export function useQadaPrayers() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: qadaPrayers = [], isLoading: isLoadingQada } = useQuery({
        queryKey: ['qada_prayers'],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from('qada_prayers' as any)
                .select('*')
                .eq('user_id', user.id)
                .order('original_date', { ascending: false });

            if (error) {
                console.error('Error fetching qada prayers:', error);
                throw error;
            }
            return data || [];
        },
        enabled: !!user,
    });

    const createQadaPrayer = useMutation({
        mutationFn: async (prayer: any) => {
            if (!user) throw new Error('Not authenticated');
            const { data, error } = await supabase
                .from('qada_prayers' as any)
                .insert({ ...prayer, user_id: user.id })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['qada_prayers'] });
            toast.success('Missed prayer added to Qada list');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to add qada prayer');
        },
    });

    const updateQadaPrayer = useMutation({
        mutationFn: async ({ id, ...updates }: { id: string;[key: string]: any }) => {
            const { data, error } = await supabase
                .from('qada_prayers' as any)
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['qada_prayers'] });
            toast.success('Qada prayer updated');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update qada prayer');
        },
    });

    const deleteQadaPrayer = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('qada_prayers' as any)
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['qada_prayers'] });
            toast.success('Qada prayer deleted');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete qada prayer');
        },
    });

    return {
        qadaPrayers,
        isLoadingQada,
        createQadaPrayer: createQadaPrayer.mutateAsync,
        updateQadaPrayer: updateQadaPrayer.mutateAsync,
        deleteQadaPrayer: deleteQadaPrayer.mutateAsync,
    };
}
