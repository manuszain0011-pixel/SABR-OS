import React, { createContext, useContext, ReactNode, useMemo, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/components/ThemeProvider';
import {
  useProfile,
  useUserSettings,
  useAreas,
  useGoals,
  useProjects,
  useTasks,
  useIdeas,
  useNotes,
  useResources,
  useBooks,
  useWatchlistItems,
  useContacts,
  useHabits,
  useJournalEntries,
  useWeeklyReviews,
  useMonthlyReviews,
  useTransactions,
  useSubscriptions,
  useDebts,
  useFinancialGoals,
  useBudgets,
  usePrayerRecords,
  useQuranProgress,
  useQuranGoals,
  useZikrEntries,
  useDuas,
  useFastingRecords,
  useScheduleEvents,
  useTodayPrayerRecord,
  useHabitCompletions
} from '@/hooks/useSupabaseData';
import { useQadaPrayers } from '@/hooks/useQadaPrayers';
import { format, parseISO, isToday, isPast, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';
import type { PrayerName, PrayerEntry } from '@/types';

type Tables = Database['public']['Tables'];

interface AppContextType {
  // Profile & Settings
  profile: Tables['profiles']['Row'] | null;
  updateProfile: (updates: Partial<Tables['profiles']['Update']>) => Promise<any>;
  settings: Tables['user_settings']['Row'] | null;
  updateSettings: (settings: Partial<Tables['user_settings']['Insert']>) => Promise<any>;

  // Areas
  areas: Tables['areas']['Row'][];
  createArea: (area: Omit<Tables['areas']['Insert'], 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<any>;
  updateArea: (data: { id: string } & Partial<Tables['areas']['Update']>) => Promise<any>;
  deleteArea: (id: string) => Promise<void>;

  // Goals
  goals: Tables['goals']['Row'][];
  createGoal: (goal: Omit<Tables['goals']['Insert'], 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<any>;
  updateGoal: (data: { id: string } & Partial<Tables['goals']['Update']>) => Promise<any>;
  deleteGoal: (id: string) => Promise<void>;

  // Projects
  projects: Tables['projects']['Row'][];
  createProject: (project: Omit<Tables['projects']['Insert'], 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<any>;
  updateProject: (data: { id: string } & Partial<Tables['projects']['Update']>) => Promise<any>;
  deleteProject: (id: string) => Promise<void>;

  // Tasks
  tasks: Tables['tasks']['Row'][];
  createTask: (task: Omit<Tables['tasks']['Insert'], 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<any>;
  updateTask: (data: { id: string } & Partial<Tables['tasks']['Update']>) => Promise<any>;
  deleteTask: (id: string) => Promise<void>;

  // Ideas
  ideas: Tables['ideas']['Row'][];
  createIdea: (idea: Omit<Tables['ideas']['Insert'], 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<any>;
  updateIdea: (data: { id: string } & Partial<Tables['ideas']['Update']>) => Promise<any>;
  deleteIdea: (id: string) => Promise<void>;

  // Notes
  notes: Tables['notes']['Row'][];
  createNote: (note: Omit<Tables['notes']['Insert'], 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<any>;
  updateNote: (data: { id: string } & Partial<Tables['notes']['Update']>) => Promise<any>;
  deleteNote: (id: string) => Promise<void>;

  // Resources
  resources: Tables['resources']['Row'][];
  createResource: (resource: Omit<Tables['resources']['Insert'], 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<any>;
  updateResource: (data: { id: string } & Partial<Tables['resources']['Update']>) => Promise<any>;
  deleteResource: (id: string) => Promise<void>;

  // Books
  books: Tables['books']['Row'][];
  createBook: (book: Omit<Tables['books']['Insert'], 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<any>;
  updateBook: (data: { id: string } & Partial<Tables['books']['Update']>) => Promise<any>;
  deleteBook: (id: string) => Promise<void>;

  // Watchlist
  watchlist: Tables['watchlist_items']['Row'][];
  createWatchlistItem: (item: Omit<Tables['watchlist_items']['Insert'], 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<any>;
  updateWatchlistItem: (data: { id: string } & Partial<Tables['watchlist_items']['Update']>) => Promise<any>;
  deleteWatchlistItem: (id: string) => Promise<void>;

  // Contacts
  contacts: Tables['contacts']['Row'][];
  createContact: (contact: Omit<Tables['contacts']['Insert'], 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<any>;
  updateContact: (data: { id: string } & Partial<Tables['contacts']['Update']>) => Promise<any>;
  deleteContact: (id: string) => Promise<void>;

  // Habits
  habits: Tables['habits']['Row'][];
  createHabit: (habit: Omit<Tables['habits']['Insert'], 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<any>;
  updateHabit: (data: { id: string } & Partial<Tables['habits']['Update']>) => Promise<any>;
  deleteHabit: (id: string) => Promise<void>;

  // Journal
  journalEntries: Tables['journal_entries']['Row'][];
  createJournalEntry: (entry: Omit<Tables['journal_entries']['Insert'], 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<any>;
  updateJournalEntry: (data: { id: string } & Partial<Tables['journal_entries']['Update']>) => Promise<any>;
  deleteJournalEntry: (id: string) => Promise<void>;

  // Reviews
  weeklyReviews: Tables['weekly_reviews']['Row'][];
  createWeeklyReview: (review: Omit<Tables['weekly_reviews']['Insert'], 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<any>;
  updateWeeklyReview: (data: { id: string } & Partial<Tables['weekly_reviews']['Update']>) => Promise<any>;
  deleteWeeklyReview: (id: string) => Promise<void>;

  monthlyReviews: Tables['monthly_reviews']['Row'][];
  createMonthlyReview: (review: Omit<Tables['monthly_reviews']['Insert'], 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<any>;
  updateMonthlyReview: (data: { id: string } & Partial<Tables['monthly_reviews']['Update']>) => Promise<any>;
  deleteMonthlyReview: (id: string) => Promise<void>;

  // Finance
  transactions: Tables['finance_transactions']['Row'][];
  createTransaction: (transaction: Omit<Tables['finance_transactions']['Insert'], 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<any>;
  updateTransaction: (data: { id: string } & Partial<Tables['finance_transactions']['Update']>) => Promise<any>;
  deleteTransaction: (id: string) => Promise<void>;

  subscriptions: Tables['subscriptions']['Row'][];
  createSubscription: (subscription: Omit<Tables['subscriptions']['Insert'], 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<any>;
  updateSubscription: (data: { id: string } & Partial<Tables['subscriptions']['Update']>) => Promise<any>;
  deleteSubscription: (id: string) => Promise<void>;

  debts: Tables['debts']['Row'][];
  createDebt: (debt: Omit<Tables['debts']['Insert'], 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<any>;
  updateDebt: (data: { id: string } & Partial<Tables['debts']['Update']>) => Promise<any>;
  deleteDebt: (id: string) => Promise<void>;

  financialGoals: Tables['financial_goals']['Row'][];
  createFinancialGoal: (goal: Omit<Tables['financial_goals']['Insert'], 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<any>;
  updateFinancialGoal: (data: { id: string } & Partial<Tables['financial_goals']['Update']>) => Promise<any>;
  deleteFinancialGoal: (id: string) => Promise<void>;

  budgets: Tables['budgets']['Row'][];
  createBudget: (budget: Omit<Tables['budgets']['Insert'], 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<any>;
  updateBudget: (data: { id: string } & Partial<Tables['budgets']['Update']>) => Promise<any>;
  deleteBudget: (id: string) => Promise<void>;

  // Habits & Completions
  habitCompletions: Tables['habit_completions']['Row'][];
  createHabitCompletion: (completion: Omit<Tables['habit_completions']['Insert'], 'id' | 'user_id' | 'created_at'>) => Promise<any>;
  deleteHabitCompletion: (id: string) => Promise<void>;

  // Ibadat
  prayerRecords: Tables['prayer_records']['Row'][];
  todayPrayerRecord: Tables['prayer_records']['Row'] | null;
  updateTodayPrayer: (updates: Partial<Tables['prayer_records']['Insert']>) => Promise<any>;

  qadaPrayers: any[];
  createQadaPrayer: (prayer: any) => Promise<any>;
  updateQadaPrayer: (updates: any) => Promise<any>;
  deleteQadaPrayer: (id: string) => Promise<void>;

  quranProgress: Tables['quran_progress']['Row'][];
  createQuranProgress: (progress: Omit<Tables['quran_progress']['Insert'], 'id' | 'user_id' | 'created_at'>) => Promise<any>;
  updateQuranProgress: (data: { id: string } & Partial<Tables['quran_progress']['Update']>) => Promise<any>;
  deleteQuranProgress: (id: string) => Promise<void>;

  quranGoals: Tables['quran_goals']['Row'][];
  createQuranGoal: (goal: Omit<Tables['quran_goals']['Insert'], 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<any>;
  updateQuranGoal: (data: { id: string } & Partial<Tables['quran_goals']['Update']>) => Promise<any>;
  deleteQuranGoal: (id: string) => Promise<void>;

  zikrEntries: Tables['zikr_entries']['Row'][];
  createZikrEntry: (entry: Omit<Tables['zikr_entries']['Insert'], 'id' | 'user_id' | 'created_at'>) => Promise<any>;
  updateZikrEntry: (data: { id: string } & Partial<Tables['zikr_entries']['Update']>) => Promise<any>;
  deleteZikrEntry: (id: string) => Promise<void>;

  duas: Tables['duas']['Row'][];
  createDua: (dua: Omit<Tables['duas']['Insert'], 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<any>;
  updateDua: (data: { id: string } & Partial<Tables['duas']['Update']>) => Promise<any>;
  deleteDua: (id: string) => Promise<void>;

  fastingRecords: Tables['fasting_records']['Row'][];
  createFastingRecord: (record: Omit<Tables['fasting_records']['Insert'], 'id' | 'user_id' | 'created_at'>) => Promise<any>;
  updateFastingRecord: (data: { id: string } & Partial<Tables['fasting_records']['Update']>) => Promise<any>;
  deleteFastingRecord: (id: string) => Promise<void>;

  // Schedule
  scheduleEvents: Tables['schedule_events']['Row'][];
  createScheduleEvent: (event: Omit<Tables['schedule_events']['Insert'], 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<any>;
  updateScheduleEvent: (data: { id: string } & Partial<Tables['schedule_events']['Update']>) => Promise<any>;
  deleteScheduleEvent: (id: string) => Promise<void>;

  // Helper functions for backward compatibility
  updatePrayerStatus: (prayerName: PrayerName, entry: PrayerEntry) => Promise<any>;
  getTodayPrayerRecord: () => any;

  // Setters (wrappers for create/update to maintain compatibility)
  setTransactions: (fn: (prev: any) => any) => void;
  setSubscriptions: (fn: (prev: any) => any) => void;
  setDebts: (fn: (prev: any) => any) => void;
  setFinancialGoals: (fn: (prev: any) => any) => void;
  setBudgets: (fn: (prev: any) => any) => void;
  setQuranProgress: (fn: (prev: any) => any) => void;
  setZikrEntries: (fn: (prev: any) => any) => void;
  setFastingRecords: (fn: (prev: any) => any) => void;
  setDuas: (fn: (prev: any) => any) => void;
  setHabits: (fn: (prev: any) => any) => void;
  setJournalEntries: (fn: (prev: any) => any) => void;
  setNotes: (fn: (prev: any) => any) => void;
  setTasks: (fn: (prev: any) => any) => void;
  setProjects: (fn: (prev: any) => any) => void;
  setGoals: (fn: (prev: any) => any) => void;
  setAreas: (fn: (prev: any) => any) => void;
  setBooks: (fn: (prev: any) => any) => void;
  setContacts: (fn: (prev: any) => any) => void;
  setIdeas: (fn: (prev: any) => any) => void;
  setResources: (fn: (prev: any) => any) => void;
  setWatchlist: (fn: (prev: any) => any) => void;
  setPrayerRecords: (fn: (prev: any) => any) => void;

  // Loading states
  isLoading: boolean;

  // Computed Stats
  stats: {
    tasksToday: number;
    tasksOverdue: number;
    tasksCompleted: number;
    goalsInProgress: number;
    projectsInProgress: number;
    prayerScoreToday: number;
    habitStreakAvg: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlyBalance: number;
    quranPagesThisMonth: number;
    spiPointsToday: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // Profile & Settings
  const { profile, updateProfile, isLoading: profileLoading } = useProfile();
  const { settings, updateSettings, isLoading: settingsLoading } = useUserSettings();

  // Data hooks
  const areasHook = useAreas();
  const goalsHook = useGoals();
  const projectsHook = useProjects();
  const tasksHook = useTasks();
  const ideasHook = useIdeas();
  const notesHook = useNotes();
  const resourcesHook = useResources();
  const booksHook = useBooks();
  const watchlistHook = useWatchlistItems();
  const contactsHook = useContacts();
  const habitsHook = useHabits();
  const journalHook = useJournalEntries();
  const weeklyReviewsHook = useWeeklyReviews();
  const monthlyReviewsHook = useMonthlyReviews();
  const transactionsHook = useTransactions();
  const subscriptionsHook = useSubscriptions();
  const debtsHook = useDebts();
  const financialGoalsHook = useFinancialGoals();
  const budgetsHook = useBudgets();
  const prayerRecordsHook = usePrayerRecords();
  const quranProgressHook = useQuranProgress();
  const quranGoalsHook = useQuranGoals();
  const zikrHook = useZikrEntries();
  const duasHook = useDuas();
  const fastingHook = useFastingRecords();
  const eventsHook = useScheduleEvents();
  const habitCompletionsHook = useHabitCompletions();
  const { record: todayPrayerRecord, updatePrayer: updateTodayPrayer } = useTodayPrayerRecord();
  const qadaHooks = useQadaPrayers();

  const isLoading = profileLoading || settingsLoading;

  const stats = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const todayTasks = tasksHook.data.filter(t => t.due_date === today);
    const overdueTasks = tasksHook.data.filter(t =>
      t.due_date &&
      isPast(parseISO(t.due_date)) &&
      !isToday(parseISO(t.due_date)) &&
      t.status !== 'completed'
    );
    const completedTasks = tasksHook.data.filter(t => t.status === 'completed');

    const inProgressGoals = goalsHook.data.filter(g => g.status === 'in_progress');
    const inProgressProjects = projectsHook.data.filter(p => p.status === 'in_progress' || p.status === 'active');

    // Prayer score
    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
    const prayedCount = todayPrayerRecord
      ? prayers.filter((p) => {
        const status = todayPrayerRecord[p];
        return status && status !== 'pending' && status !== 'missed';
      }).length
      : 0;

    // Habit streak average
    const activeHabits = habitsHook.data.filter(h => h.is_active);
    const avgStreak = activeHabits.length > 0
      ? activeHabits.reduce((sum, h) => sum + (h.streak_current || 0), 0) / activeHabits.length
      : 0;

    // Monthly finances
    const monthTransactions = transactionsHook.data.filter(t =>
      isWithinInterval(parseISO(t.date), { start: monthStart, end: monthEnd })
    );
    const monthlyIncome = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const monthlyExpenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);

    // Quran pages
    const monthQuranProgress = quranProgressHook.data.filter(q =>
      isWithinInterval(parseISO(q.date), { start: monthStart, end: monthEnd })
    );
    const quranPagesThisMonth = monthQuranProgress.reduce((sum, q) => sum + (q.pages_read || 0), 0);

    // Total SPI Points calculation
    const spiPointsToday = prayers.reduce((sum, p) => {
      const rec = todayPrayerRecord?.[p];
      if (!rec) return sum;
      try {
        const parsed = typeof rec === 'string' && rec.startsWith('{') ? JSON.parse(rec) : { spiPoints: 0 };
        return sum + (parsed.spiPoints || 0);
      } catch (e) {
        return sum;
      }
    }, 0);

    return {
      tasksToday: todayTasks.filter(t => t.status !== 'completed').length,
      tasksOverdue: overdueTasks.length,
      tasksCompleted: completedTasks.length,
      goalsInProgress: inProgressGoals.length,
      projectsInProgress: inProgressProjects.length,
      prayerScoreToday: Math.round((prayedCount / 5) * 100),
      habitStreakAvg: Math.round(avgStreak),
      monthlyIncome,
      monthlyExpenses,
      monthlyBalance: monthlyIncome - monthlyExpenses,
      quranPagesThisMonth,
      spiPointsToday,
    };
  }, [tasksHook.data, goalsHook.data, projectsHook.data, habitsHook.data, transactionsHook.data, todayPrayerRecord, quranProgressHook.data]);

  // Helper implementations
  const getTodayPrayerRecord = () => {
    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'tahajjud', 'duha', 'witr'] as const;
    const record: any = {};

    prayers.forEach(p => {
      const val = todayPrayerRecord?.[p];
      if (val) {
        try {
          // Attempt to parse if it's a JSON string
          record[p] = typeof val === 'string' && val.startsWith('{') ? JSON.parse(val) : { status: val };
        } catch (e) {
          record[p] = { status: val };
        }
      } else {
        record[p] = { status: 'none', onTime: false, khushu: 0, spiPoints: 0 };
      }
    });

    return record;
  };

  const updatePrayerStatus = async (prayerName: PrayerName, entry: PrayerEntry) => {
    // Merge with existing record for today if possible
    // We store the entry as a JSON string to preserve all fields in a single column
    return updateTodayPrayer({
      [prayerName]: JSON.stringify(entry)
    } as any);
  };

  // Setter wrappers - since we can't easily support functional updates that depend on current state
  // across network boundaries without a lot of complexity, we'll implement simple wrappers
  // that call the create function when an item is added. 
  // NOTE: This is a fallback and the UI should ideally be moved to direct CRUD actions.
  const createSetter = (createFn: any) => (fn: (prev: any) => any) => {
    // This is a hacky way to support "setX(prev => [newItem, ...prev])" 
    // It only works if the function returns a new array with ONE new item.
    // In many pages, this is exactly what happens.
    const mockPrev: any[] = [];
    const result = fn(mockPrev);
    if (Array.isArray(result) && result.length > 0) {
      const newItem = result[0];
      createFn(newItem);
    }
  };

  const value: AppContextType = {
    profile,
    updateProfile,
    settings,
    updateSettings,

    areas: areasHook.data,
    createArea: areasHook.create,
    updateArea: areasHook.update,
    deleteArea: areasHook.delete,

    goals: goalsHook.data,
    createGoal: goalsHook.create,
    updateGoal: goalsHook.update,
    deleteGoal: goalsHook.delete,

    projects: projectsHook.data,
    createProject: projectsHook.create,
    updateProject: projectsHook.update,
    deleteProject: projectsHook.delete,

    tasks: tasksHook.data,
    createTask: tasksHook.create,
    updateTask: tasksHook.update,
    deleteTask: tasksHook.delete,

    ideas: ideasHook.data,
    createIdea: ideasHook.create,
    updateIdea: ideasHook.update,
    deleteIdea: ideasHook.delete,

    notes: notesHook.data,
    createNote: notesHook.create,
    updateNote: notesHook.update,
    deleteNote: notesHook.delete,

    resources: resourcesHook.data,
    createResource: resourcesHook.create,
    updateResource: resourcesHook.update,
    deleteResource: resourcesHook.delete,

    books: booksHook.data,
    createBook: booksHook.create,
    updateBook: booksHook.update,
    deleteBook: booksHook.delete,

    watchlist: watchlistHook.data,
    createWatchlistItem: watchlistHook.create,
    updateWatchlistItem: watchlistHook.update,
    deleteWatchlistItem: watchlistHook.delete,

    contacts: contactsHook.data,
    createContact: contactsHook.create,
    updateContact: contactsHook.update,
    deleteContact: contactsHook.delete,

    habits: habitsHook.data,
    createHabit: habitsHook.create,
    updateHabit: habitsHook.update,
    deleteHabit: habitsHook.delete,

    journalEntries: journalHook.data,
    createJournalEntry: journalHook.create,
    updateJournalEntry: journalHook.update,
    deleteJournalEntry: journalHook.delete,

    weeklyReviews: weeklyReviewsHook.data,
    createWeeklyReview: weeklyReviewsHook.create,
    updateWeeklyReview: weeklyReviewsHook.update,
    deleteWeeklyReview: weeklyReviewsHook.delete,
    monthlyReviews: monthlyReviewsHook.data,
    createMonthlyReview: monthlyReviewsHook.create,
    updateMonthlyReview: monthlyReviewsHook.update,
    deleteMonthlyReview: monthlyReviewsHook.delete,

    transactions: transactionsHook.data,
    createTransaction: transactionsHook.create,
    updateTransaction: transactionsHook.update,
    deleteTransaction: transactionsHook.delete,

    subscriptions: subscriptionsHook.data,
    createSubscription: subscriptionsHook.create,
    updateSubscription: subscriptionsHook.update,
    deleteSubscription: subscriptionsHook.delete,

    debts: debtsHook.data,
    createDebt: debtsHook.create,
    updateDebt: debtsHook.update,
    deleteDebt: debtsHook.delete,

    financialGoals: financialGoalsHook.data,
    createFinancialGoal: financialGoalsHook.create,
    updateFinancialGoal: financialGoalsHook.update,
    deleteFinancialGoal: financialGoalsHook.delete,

    budgets: budgetsHook.data,
    createBudget: budgetsHook.create,
    updateBudget: budgetsHook.update,
    deleteBudget: budgetsHook.delete,

    prayerRecords: prayerRecordsHook.data,
    todayPrayerRecord,
    updateTodayPrayer,

    ...qadaHooks,

    quranProgress: quranProgressHook.data,
    createQuranProgress: quranProgressHook.create,
    updateQuranProgress: quranProgressHook.update,
    deleteQuranProgress: quranProgressHook.delete,

    quranGoals: quranGoalsHook.data,
    createQuranGoal: quranGoalsHook.create,
    updateQuranGoal: quranGoalsHook.update,
    deleteQuranGoal: quranGoalsHook.delete,

    zikrEntries: zikrHook.data,
    createZikrEntry: zikrHook.create,
    updateZikrEntry: zikrHook.update,
    deleteZikrEntry: zikrHook.delete,

    duas: duasHook.data,
    createDua: duasHook.create,
    updateDua: duasHook.update,
    deleteDua: duasHook.delete,

    fastingRecords: fastingHook.data,
    createFastingRecord: fastingHook.create,
    updateFastingRecord: fastingHook.update,
    deleteFastingRecord: fastingHook.delete,

    scheduleEvents: eventsHook.data,
    createScheduleEvent: eventsHook.create,
    updateScheduleEvent: eventsHook.update,
    deleteScheduleEvent: eventsHook.delete,

    habitCompletions: habitCompletionsHook.data,
    createHabitCompletion: habitCompletionsHook.create,
    deleteHabitCompletion: habitCompletionsHook.delete,

    updatePrayerStatus,
    getTodayPrayerRecord,

    setTransactions: createSetter(transactionsHook.create),
    setSubscriptions: createSetter(subscriptionsHook.create),
    setDebts: createSetter(debtsHook.create),
    setFinancialGoals: createSetter(financialGoalsHook.create),
    setBudgets: createSetter(budgetsHook.create),
    setQuranProgress: createSetter(quranProgressHook.create),
    setZikrEntries: createSetter(zikrHook.create),
    setFastingRecords: createSetter(fastingHook.create),
    setDuas: createSetter(duasHook.create),
    setHabits: createSetter(habitsHook.create),
    setJournalEntries: createSetter(journalHook.create),
    setNotes: createSetter(notesHook.create),
    setTasks: createSetter(tasksHook.create),
    setProjects: createSetter(projectsHook.create),
    setGoals: createSetter(goalsHook.create),
    setAreas: createSetter(areasHook.create),
    setBooks: createSetter(booksHook.create),
    setContacts: createSetter(contactsHook.create),
    setIdeas: createSetter(ideasHook.create),
    setResources: createSetter(resourcesHook.create),
    setWatchlist: createSetter(watchlistHook.create),
    setPrayerRecords: createSetter(prayerRecordsHook.create),

    isLoading,
    stats,
  };

  return (
    <AppContext.Provider value={value}>
      <ThemeSync />
      {children}
    </AppContext.Provider>
  );
}

function ThemeSync() {
  const { profile, updateProfile } = useProfile();
  const { theme, setTheme } = useTheme();

  // Sync Supabase theme to Local on load
  useEffect(() => {
    if (profile?.theme && profile.theme !== theme) {
      setTheme(profile.theme as any);
    }
  }, [profile?.theme]);

  // Sync Local theme to Supabase on change
  useEffect(() => {
    if (profile && theme && profile.theme !== theme) {
      updateProfile({ theme });
    }
  }, [theme]);

  return null;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
