import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export interface HabitTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    frequency: string;
    target_count: number;
    icon: string;
    color: string;
    is_sunnah: boolean;
    islamic_reference: string;
}

export function useHabits() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Fetch Habit Templates
    const { data: templates = [], isLoading: isLoadingTemplates } = useQuery({
        queryKey: ['habit_templates'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('habit_templates' as any)
                .select('*')
                .order('name');

            if (error) throw error;
            return data as unknown as HabitTemplate[];
        },
    });

    // Create Habit from Template
    const createHabitFromTemplate = useMutation({
        mutationFn: async (template: HabitTemplate) => {
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('habits')
                .insert({
                    user_id: user.id,
                    name: template.name,
                    description: template.description, // Database might not have description but checking schema, it does.
                    frequency: template.frequency,
                    target_count: template.target_count,
                    icon: template.icon,
                    color: template.color,
                    is_active: true,
                    // New Islamic fields need casting if not in local types
                    is_sunnah: template.is_sunnah,
                    habit_category: template.category,
                } as any)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
            toast.success('Habit added from template');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to add habit');
        }
    });

    return {
        templates,
        isLoadingTemplates,
        createHabitFromTemplate
    };
}
