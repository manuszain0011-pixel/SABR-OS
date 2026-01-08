import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Tables = Database['public']['Tables'];

// Profile hook
export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<Tables['profiles']['Update']>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateProfile: updateMutation.mutateAsync,
    refetch: query.refetch,
  };
}

// User Settings hook
export function useUserSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['user_settings', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const upsertMutation = useMutation({
    mutationFn: async (settings: Partial<Tables['user_settings']['Insert']>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('user_settings')
        .upsert(
          { ...settings, user_id: user.id },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_settings', user?.id] });
    },
  });

  return {
    settings: query.data,
    isLoading: query.isLoading,
    updateSettings: upsertMutation.mutateAsync,
    refetch: query.refetch,
  };
}

// Generic factory for simple CRUD tables
function createTableHook<TRow extends { id: string }, TInsert, TUpdate>(
  tableName: keyof Tables
) {
  return function useTableData() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const query = useQuery({
      queryKey: [tableName, user?.id],
      queryFn: async () => {
        if (!user) return [];
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []) as unknown as TRow[];
      },
      enabled: !!user,
    });

    const createMutation = useMutation({
      mutationFn: async (item: Omit<TInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
        if (!user) throw new Error('Not authenticated');
        const { data, error } = await supabase
          .from(tableName)
          .insert({ ...item, user_id: user.id } as any)
          .select()
          .single();

        if (error) throw error;
        return data as unknown as TRow;
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: [tableName, user?.id] });
        await queryClient.refetchQueries({ queryKey: [tableName, user?.id] });
        toast.success('Created successfully');
      },
      onError: async (error: any) => {
        // Suppress duplicate key errors - they happen with rapid clicks but data is saved
        if (error?.code === '23505' || error?.message?.includes('duplicate key')) {
          console.log(`Duplicate entry for ${tableName}, forcing refetch`);
          await queryClient.invalidateQueries({ queryKey: [tableName, user?.id] });
          await queryClient.refetchQueries({ queryKey: [tableName, user?.id] });
          return;
        }
        console.error(`Error creating ${tableName}:`, error);
        toast.error(error?.message || 'Failed to create item');
      },
    });

    const updateMutation = useMutation({
      mutationFn: async ({ id, ...updates }: { id: string } & Partial<TUpdate>) => {
        const { data, error } = await supabase
          .from(tableName)
          .update(updates as any)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data as unknown as TRow;
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: [tableName, user?.id] });
        await queryClient.refetchQueries({ queryKey: [tableName, user?.id] });
      },
      onError: (error: any) => {
        console.error(`Error updating ${tableName}:`, error);
        toast.error(error?.message || 'Failed to update item');
      },
    });

    const deleteMutation = useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('id', id);

        if (error) throw error;
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: [tableName, user?.id] });
        await queryClient.refetchQueries({ queryKey: [tableName, user?.id] });
      },
      onError: (error: any) => {
        console.error(`Error deleting ${tableName}:`, error);
        toast.error(error?.message || 'Failed to delete item');
      },
    });

    return {
      data: query.data || [],
      isLoading: query.isLoading,
      error: query.error,
      create: createMutation.mutateAsync,
      update: updateMutation.mutateAsync,
      delete: deleteMutation.mutateAsync,
      refetch: query.refetch,
      isCreating: createMutation.isPending,
      isUpdating: updateMutation.isPending,
      isDeleting: deleteMutation.isPending,
    };
  };
}

// Export all table hooks
export const useAreas = createTableHook<
  Tables['areas']['Row'],
  Tables['areas']['Insert'],
  Tables['areas']['Update']
>('areas');

export const useGoals = createTableHook<
  Tables['goals']['Row'],
  Tables['goals']['Insert'],
  Tables['goals']['Update']
>('goals');

export const useProjects = createTableHook<
  Tables['projects']['Row'],
  Tables['projects']['Insert'],
  Tables['projects']['Update']
>('projects');

export const useTasks = createTableHook<
  Tables['tasks']['Row'],
  Tables['tasks']['Insert'],
  Tables['tasks']['Update']
>('tasks');

export const useIdeas = createTableHook<
  Tables['ideas']['Row'],
  Tables['ideas']['Insert'],
  Tables['ideas']['Update']
>('ideas');

export const useNotes = createTableHook<
  Tables['notes']['Row'],
  Tables['notes']['Insert'],
  Tables['notes']['Update']
>('notes');

export const useResources = createTableHook<
  Tables['resources']['Row'],
  Tables['resources']['Insert'],
  Tables['resources']['Update']
>('resources');

export const useBooks = createTableHook<
  Tables['books']['Row'],
  Tables['books']['Insert'],
  Tables['books']['Update']
>('books');

export const useWatchlistItems = createTableHook<
  Tables['watchlist_items']['Row'],
  Tables['watchlist_items']['Insert'],
  Tables['watchlist_items']['Update']
>('watchlist_items');

export const useContacts = createTableHook<
  Tables['contacts']['Row'],
  Tables['contacts']['Insert'],
  Tables['contacts']['Update']
>('contacts');

export const useHabits = createTableHook<
  Tables['habits']['Row'],
  Tables['habits']['Insert'],
  Tables['habits']['Update']
>('habits');

export function useHabitCompletions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['habit_completions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_date', { ascending: false });

      if (error) throw error;
      console.log('📊 Habit completions synced:', data?.length);
      return (data || []) as Tables['habit_completions']['Row'][];
    },
    enabled: !!user,
    staleTime: 0,
    refetchInterval: 5000, // Reduced frequency slightly to stabilize UI
  });

  const createMutation = useMutation({
    mutationFn: async (item: Omit<Tables['habit_completions']['Insert'], 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('habit_completions')
        .insert({ ...item, user_id: user.id })
        .select()
        .single();

      if (error) {
        // Handle duplicate key error as success (it means data is already persisted)
        if (error.code === '23505' || error.message?.includes('duplicate')) {
          return { ...item, user_id: user.id } as Tables['habit_completions']['Row'];
        }
        throw error;
      }
      return data as Tables['habit_completions']['Row'];
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['habit_completions', user?.id] });
    },
    onError: (error: any) => {
      console.error('Save failed:', error);
      toast.error(error?.message || 'Connection lost');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Tables['habit_completions']['Update']>) => {
      const { data, error } = await supabase
        .from('habit_completions')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Tables['habit_completions']['Row'];
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['habit_completions', user?.id] });
      await queryClient.refetchQueries({ queryKey: ['habit_completions', user?.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('habit_completions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['habit_completions', user?.id] });
    },
  });

  return {
    ...query,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}



export const useJournalEntries = createTableHook<
  Tables['journal_entries']['Row'],
  Tables['journal_entries']['Insert'],
  Tables['journal_entries']['Update']
>('journal_entries');

export const useWeeklyReviews = createTableHook<
  Tables['weekly_reviews']['Row'],
  Tables['weekly_reviews']['Insert'],
  Tables['weekly_reviews']['Update']
>('weekly_reviews');

export const useMonthlyReviews = createTableHook<
  Tables['monthly_reviews']['Row'],
  Tables['monthly_reviews']['Insert'],
  Tables['monthly_reviews']['Update']
>('monthly_reviews');

export const useTransactions = createTableHook<
  Tables['finance_transactions']['Row'],
  Tables['finance_transactions']['Insert'],
  Tables['finance_transactions']['Update']
>('finance_transactions');

export const useSubscriptions = createTableHook<
  Tables['subscriptions']['Row'],
  Tables['subscriptions']['Insert'],
  Tables['subscriptions']['Update']
>('subscriptions');

export const useDebts = createTableHook<
  Tables['debts']['Row'],
  Tables['debts']['Insert'],
  Tables['debts']['Update']
>('debts');

export const useDebtPayments = createTableHook<
  Tables['debt_payments']['Row'],
  Tables['debt_payments']['Insert'],
  Tables['debt_payments']['Update']
>('debt_payments');

export const useFinancialGoals = createTableHook<
  Tables['financial_goals']['Row'],
  Tables['financial_goals']['Insert'],
  Tables['financial_goals']['Update']
>('financial_goals');

export const useBudgets = createTableHook<
  Tables['budgets']['Row'],
  Tables['budgets']['Insert'],
  Tables['budgets']['Update']
>('budgets');

export const usePrayerRecords = createTableHook<
  Tables['prayer_records']['Row'],
  Tables['prayer_records']['Insert'],
  Tables['prayer_records']['Update']
>('prayer_records');

export const useQuranProgress = createTableHook<
  Tables['quran_progress']['Row'],
  Tables['quran_progress']['Insert'],
  Tables['quran_progress']['Update']
>('quran_progress');

export const useQuranGoals = createTableHook<
  Tables['quran_goals']['Row'],
  Tables['quran_goals']['Insert'],
  Tables['quran_goals']['Update']
>('quran_goals');

export const useZikrEntries = createTableHook<
  Tables['zikr_entries']['Row'],
  Tables['zikr_entries']['Insert'],
  Tables['zikr_entries']['Update']
>('zikr_entries');

export const useDuas = createTableHook<
  Tables['duas']['Row'],
  Tables['duas']['Insert'],
  Tables['duas']['Update']
>('duas');

export const useFastingRecords = createTableHook<
  Tables['fasting_records']['Row'],
  Tables['fasting_records']['Insert'],
  Tables['fasting_records']['Update']
>('fasting_records');

export const useScheduleEvents = createTableHook<
  Tables['schedule_events']['Row'],
  Tables['schedule_events']['Insert'],
  Tables['schedule_events']['Update']
>('schedule_events');

export const useInteractionNotes = createTableHook<
  Tables['interaction_notes']['Row'],
  Tables['interaction_notes']['Insert'],
  Tables['interaction_notes']['Update']
>('interaction_notes');

// Special hooks for related data
export function useSubtasks(taskId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['subtasks', taskId],
    queryFn: async () => {
      if (!user || !taskId) return [];
      const { data, error } = await supabase
        .from('subtasks')
        .select('*')
        .eq('task_id', taskId)
        .order('order_index');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!taskId,
  });

  const createMutation = useMutation({
    mutationFn: async (item: { title: string; is_completed?: boolean; order_index?: number }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('subtasks')
        .insert({ ...item, user_id: user.id, task_id: taskId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', taskId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; title?: string; is_completed?: boolean; order_index?: number }) => {
      const { data, error } = await supabase
        .from('subtasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', taskId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subtasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', taskId] });
    },
  });

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
  };
}

export function useMilestones(goalId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['milestones', goalId],
    queryFn: async () => {
      if (!user || !goalId) return [];
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('goal_id', goalId)
        .order('order_index');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!goalId,
  });

  const createMutation = useMutation({
    mutationFn: async (item: { title: string; description?: string; target_date?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('milestones')
        .insert({ ...item, user_id: user.id, goal_id: goalId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', goalId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Tables['milestones']['Update']>) => {
      const { data, error } = await supabase
        .from('milestones')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', goalId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', goalId] });
    },
  });

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
  };
}

// Today's prayer record hook
export function useTodayPrayerRecord() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  const query = useQuery({
    queryKey: ['prayer_record_today', user?.id, today],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('prayer_records')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const upsertMutation = useMutation({
    mutationFn: async (updates: Partial<Tables['prayer_records']['Insert']>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('prayer_records')
        .upsert({
          ...updates,
          user_id: user.id,
          date: today
        }, {
          onConflict: 'user_id,date'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayer_record_today'] });
      queryClient.invalidateQueries({ queryKey: ['prayer_records'] });
    },
  });

  return {
    record: query.data,
    isLoading: query.isLoading,
    updatePrayer: upsertMutation.mutateAsync,
    refetch: query.refetch,
  };
}

// Contact interaction notes hook
export function useContactInteractions(contactId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['interaction_notes', contactId],
    queryFn: async () => {
      if (!user || !contactId) return [];
      const { data, error } = await supabase
        .from('interaction_notes')
        .select('*')
        .eq('contact_id', contactId)
        .order('interaction_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!contactId,
  });

  const createMutation = useMutation({
    mutationFn: async (item: { content: string; type?: string; interaction_date?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('interaction_notes')
        .insert({ ...item, user_id: user.id, contact_id: contactId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interaction_notes', contactId] });
    },
  });

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    create: createMutation.mutateAsync,
  };
}

// Global hook for Daily Inspiration
export function useDailyInspiration() {
  return useQuery({
    queryKey: ['daily_inspiration'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_inspiration')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return (data || []) as Tables['daily_inspiration']['Row'][];
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours cache
  });
}
