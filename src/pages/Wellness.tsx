import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { useApp } from '@/context/AppContext';
import { useHabits, HabitTemplate } from '@/hooks/useHabits';
import { useHabitCompletions } from '@/hooks/useSupabaseData';
import { Mood } from '@/types';
import { Tables } from '@/integrations/supabase/types';
import { format, startOfWeek, addDays, subDays, parseISO, differenceInDays, isToday, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import {
  Plus, Trash2, Check, Smile, Meh, Frown, Sparkles, BookOpen, Flame,
  Target, TrendingUp, Calendar, Edit2, Star, Moon, Sun, Zap, Heart,
  Activity, Brain, Coffee, Dumbbell, Droplets, Apple, Wind, Eye,
  ChevronLeft, ChevronRight, BarChart3, Award, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';

const MOODS: { value: Mood; icon: typeof Smile; label: string; color: string; emoji: string }[] = [
  { value: 'great', icon: Smile, label: 'Great', color: 'text-primary', emoji: '😊' },
  { value: 'good', icon: Smile, label: 'Good', color: 'text-green-dark', emoji: '🙂' },
  { value: 'neutral', icon: Meh, label: 'Neutral', color: 'text-gold', emoji: '😐' },
  { value: 'bad', icon: Frown, label: 'Bad', color: 'text-muted-foreground', emoji: '😔' },
  { value: 'terrible', icon: Frown, label: 'Terrible', color: 'text-destructive', emoji: '😢' },
];

const HABIT_ICONS = [
  { value: 'check', icon: Check, label: 'General' },
  { value: 'book', icon: BookOpen, label: 'Reading' },
  { value: 'dumbbell', icon: Dumbbell, label: 'Exercise' },
  { value: 'droplets', icon: Droplets, label: 'Water' },
  { value: 'apple', icon: Apple, label: 'Nutrition' },
  { value: 'moon', icon: Moon, label: 'Sleep' },
  { value: 'brain', icon: Brain, label: 'Learning' },
  { value: 'heart', icon: Heart, label: 'Wellness' },
  { value: 'coffee', icon: Coffee, label: 'Morning' },
  { value: 'wind', icon: Wind, label: 'Meditation' },
];

const HABIT_COLORS = [
  '#0B5B42', '#D4AF37', '#3B82F6', '#8B5CF6', '#EC4899', '#F97316', '#10B981', '#EF4444'
];

const HABIT_FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export default function Wellness() {
  const {
    habits, createHabit, updateHabit, deleteHabit: removeHabit,
    journalEntries = [], createJournalEntry, updateJournalEntry, deleteJournalEntry,
    // habitCompletions removed from here
  } = useApp();

  // Use hook directly for instant updates
  const {
    data: habitCompletions = [],
    create: createHabitCompletion,
    delete: deleteHabitCompletion
  } = useHabitCompletions();

  const { templates, createHabitFromTemplate } = useHabits();

  // Debug log to see why items disappear
  useEffect(() => {
    if (habitCompletions && habitCompletions.length > 0) {
      console.log('📋 Current Completions:', habitCompletions.map(c => ({
        id: c.habit_id,
        date: c.completed_date,
        user: c.user_id
      })));
    }
  }, [habitCompletions]);

  // Habit states
  const [habitDialogOpen, setHabitDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<any | null>(null);
  const [habitForm, setHabitForm] = useState({
    name: '',
    description: '',
    frequency: 'daily' as any,
    targetCount: 1,
    unit: '',
    color: HABIT_COLORS[0],
    icon: 'check',
  });

  // Journal states
  const [journalDialogOpen, setJournalDialogOpen] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<any | null>(null);
  const [journalForm, setJournalForm] = useState({
    mood: 'neutral' as Mood,
    energyLevel: 5,
    gratitude: ['', '', ''],
    highlights: '',
    challenges: '',
    lessonsLearned: '',
    tomorrowIntentions: '',
    freeWriting: '',
  });

  // Calendar navigation
  const [weekOffset, setWeekOffset] = useState(0);

  const today = format(new Date(), 'yyyy-MM-dd');
  const weekStart = startOfWeek(addDays(new Date(), weekOffset * 7), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Habit stats
  const habitStats = useMemo(() => {
    const activeHabits = habits.filter(h => h.is_active);
    const todayCompleted = activeHabits.filter(h =>
      habitCompletions.some(c => c.habit_id === h.id && (c.completed_date === today || c.completed_date?.startsWith(today)))
    ).length;

    // Streak calculation dynamically (since DB values might be stale)
    const activeHabitsWithStreaks = activeHabits.map(h => {
      let streak = 0;
      let d = new Date();
      const completionsForHabit = habitCompletions.filter(c => c.habit_id === h.id);

      while (true) {
        const dStr = format(d, 'yyyy-MM-dd');
        if (completionsForHabit.some(c => c.completed_date === dStr || c.completed_date?.startsWith(dStr))) {
          streak++;
          d = subDays(d, 1);
        } else if (dStr === today) {
          // If not completed today, check yesterday to continue streak
          d = subDays(d, 1);
          continue;
        } else {
          break;
        }
        // Safety break
        if (streak > 365) break;
      }
      return { ...h, dynamic_streak: streak };
    });

    const avgStreak = activeHabitsWithStreaks.length > 0
      ? Math.round(activeHabitsWithStreaks.reduce((sum, h) => sum + h.dynamic_streak, 0) / activeHabitsWithStreaks.length)
      : 0;

    const longestStreak = activeHabitsWithStreaks.length > 0
      ? Math.max(...activeHabitsWithStreaks.map(h => h.dynamic_streak))
      : 0;

    // Calculate completion rate for last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd'));
    let totalPossible = activeHabits.filter(h => h.frequency === 'daily').length * 7;
    let totalCompleted = 0;

    activeHabits.forEach(h => {
      if (h.frequency === 'daily') {
        totalCompleted += habitCompletions.filter(c =>
          c.habit_id === h.id &&
          last7Days.some(day => c.completed_date === day || c.completed_date?.startsWith(day))
        ).length;
      }
    });

    const weeklyRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    return {
      total: activeHabits.length,
      todayCompleted,
      avgStreak,
      longestStreak,
      weeklyRate,
    };
  }, [habits, habitCompletions, today]);

  // Journal stats
  const journalStats = useMemo(() => {
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    const monthEntries = (journalEntries || []).filter(e =>
      isWithinInterval(parseISO(e.entry_date), { start: monthStart, end: monthEnd })
    );

    const moodCounts = monthEntries.reduce((acc, entry) => {
      const m = entry.mood as Mood;
      acc[m] = (acc[m] || 0) + 1;
      return acc;
    }, {} as Record<Mood, number>);

    const avgEnergy = monthEntries.length > 0
      ? Math.round(monthEntries.reduce((sum, e) => sum + (e.energy_level || 0), 0) / monthEntries.length)
      : 0;

    // Calculate current journal streak
    let streak = 0;
    let d = new Date();
    while (true) {
      const dStr = format(d, 'yyyy-MM-dd');
      if ((journalEntries || []).some(e => e.entry_date === dStr)) {
        streak++;
        d = subDays(d, 1);
      } else {
        break;
      }
    }

    return {
      monthEntries: monthEntries.length,
      moodCounts,
      avgEnergy,
      streak,
      todayEntry: (journalEntries || []).find(e => e.entry_date === today),
    };
  }, [journalEntries, today]);

  const handleAddHabit = async () => {
    if (!habitForm.name.trim()) return;

    if (editingHabit) {
      await updateHabit({
        id: editingHabit.id,
        name: habitForm.name,
        description: habitForm.description,
        frequency: habitForm.frequency,
        target_count: habitForm.targetCount,
        color: habitForm.color,
        icon: habitForm.icon,
      });
    } else {
      await createHabit({
        name: habitForm.name,
        description: habitForm.description,
        frequency: habitForm.frequency,
        target_count: habitForm.targetCount,
        color: habitForm.color,
        icon: habitForm.icon,
        is_active: true,
      });
    }

    setHabitDialogOpen(false);
    setEditingHabit(null);
    setHabitForm({ name: '', description: '', frequency: 'daily', targetCount: 1, unit: '', color: HABIT_COLORS[0], icon: 'check' });
  };

  // Optimistic UI state
  const [localCompletions, setLocalCompletions] = useState<Record<string, boolean>>({});

  const toggleHabit = async (habitId: string, date: string, count?: number) => {
    const key = `${habitId}_${date}`;

    // Determine current state based on server data OR local override
    const serverCompletion = habitCompletions.find(c => c.habit_id === habitId && (c.completed_date === date || c.completed_date?.startsWith(date)));
    const isCurrentlyCompleted = localCompletions[key] !== undefined
      ? localCompletions[key]
      : (!!serverCompletion && (serverCompletion.count || 0) >= (habits.find(h => h.id === habitId)?.target_count || 1));

    // Optimistic update
    const nextState = !isCurrentlyCompleted;
    setLocalCompletions(prev => ({ ...prev, [key]: nextState }));

    if (nextState) {
      toast.success('Habit completed!', { duration: 1500 });
    }

    try {
      if (serverCompletion) {
        // If it technically exists on server, we delete it (unless we are 'un-completing' a local-only completion, which falls through)
        // But if we are locally 'completed' but server 'exists', and we toggle to 'incomplete', we delete.
        if (!nextState) await deleteHabitCompletion(serverCompletion.id);
      }

      if (!serverCompletion && nextState) {
        const habit = habits.find(h => h.id === habitId);
        await createHabitCompletion({
          habit_id: habitId,
          completed_date: date,
          count: habit?.target_count || 1
        });
      }
    } catch (error: any) {
      console.error("Toggle error:", error);
      const errorMsg = error?.message || (typeof error === 'string' ? error : "Unknown error");
      toast.error(`Error: ${errorMsg}`);
      // Revert optimistic on error
      setLocalCompletions(prev => ({ ...prev, [key]: isCurrentlyCompleted }));
    }
  };

  const deleteHabit = async (id: string) => await removeHabit(id);

  const archiveHabit = async (id: string) => {
    await updateHabit({ id, is_active: false });
  };

  const handleSaveJournal = async () => {
    const entry = {
      entry_date: today,
      mood: journalForm.mood,
      energy_level: journalForm.energyLevel,
      gratitude: journalForm.gratitude.filter(g => g.trim()) as string[],
      highlights: journalForm.highlights || '',
      challenges: journalForm.challenges || '',
      learnings: journalForm.lessonsLearned || '',
      tomorrow_goals: journalForm.tomorrowIntentions || '',
      notes: journalForm.freeWriting,
    };

    if (journalStats.todayEntry) {
      await updateJournalEntry({ id: journalStats.todayEntry.id, ...entry });
    } else {
      await createJournalEntry(entry as any);
    }

    setJournalDialogOpen(false);
    setJournalForm({
      mood: 'neutral',
      energyLevel: 5,
      gratitude: ['', '', ''],
      highlights: '',
      challenges: '',
      lessonsLearned: '',
      tomorrowIntentions: '',
      freeWriting: '',
    });
  };

  const todayEntry = journalStats.todayEntry;

  const getHabitIcon = (iconName: string) => {
    const found = HABIT_ICONS.find(i => i.value === iconName);
    return found?.icon || Check;
  };

  return (
    <div className="space-y-6 animate-fade-in app-3d-root">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Wellness Hub</h1>
          <p className="text-muted-foreground">Track habits, mood, and daily reflections</p>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <div className="flex flex-col items-end">
            <p className="text-sm text-muted-foreground">{format(new Date(), 'EEEE')}</p>
            <p className="text-lg font-medium">{format(new Date(), 'MMMM d, yyyy')}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-[10px] h-6 px-2 opacity-50 hover:opacity-100"
            onClick={() => {
              const debugInfo = {
                user_id: habitCompletions[0]?.user_id,
                completions_count: habitCompletions.length,
                first_completion: habitCompletions[0],
                today_str: today
              };
              alert(JSON.stringify(debugInfo, null, 2));
            }}
          >
            Debug Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bento-card">
          <p className="text-sm font-medium text-muted-foreground mb-1">Today</p>
          <p className="text-2xl font-bold text-primary">{habitStats.todayCompleted}/{habitStats.total}</p>
        </div>
        <div className="bento-card">
          <p className="text-sm font-medium text-muted-foreground mb-1">Avg Streak</p>
          <p className="text-2xl font-bold text-gold">{habitStats.avgStreak}</p>
        </div>
        <div className="bento-card">
          <p className="text-sm font-medium text-muted-foreground mb-1">Best Streak</p>
          <p className="text-2xl font-bold text-primary">{habitStats.longestStreak}</p>
        </div>
        <div className="bento-card">
          <p className="text-sm font-medium text-muted-foreground mb-1">Weekly Rate</p>
          <p className="text-2xl font-bold text-gold">{habitStats.weeklyRate}%</p>
        </div>
        <div className="bento-card gradient-green text-primary-foreground">
          <p className="text-sm font-medium opacity-90 mb-1">Journal Streak</p>
          <p className="text-2xl font-bold">{journalStats.streak}</p>
        </div>
      </div>

      <Tabs defaultValue="habits" className="space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="habits"><Target className="h-4 w-4 mr-2" />Habits</TabsTrigger>
          <TabsTrigger value="journal"><BookOpen className="h-4 w-4 mr-2" />Journal</TabsTrigger>
          <TabsTrigger value="insights"><BarChart3 className="h-4 w-4 mr-2" />Insights</TabsTrigger>
        </TabsList>

        {/* HABITS TAB */}
        <TabsContent value="habits" className="space-y-4">
          {/* Add Habit Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setWeekOffset(prev => prev - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[120px] text-center">
                {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d')}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setWeekOffset(prev => prev + 1)}
                disabled={weekOffset >= 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              {weekOffset !== 0 && (
                <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)}>
                  Today
                </Button>
              )}
            </div>
            <Dialog open={habitDialogOpen} onOpenChange={(open) => {
              setHabitDialogOpen(open);
              if (!open) {
                setEditingHabit(null);
                setHabitForm({ name: '', description: '', frequency: 'daily', targetCount: 1, unit: '', color: HABIT_COLORS[0], icon: 'check' });
              }
            }}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Add Habit</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingHabit ? 'Edit Habit' : 'Create New Habit'}</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="custom" className="w-full pt-4">
                  {!editingHabit && (
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="custom">Custom</TabsTrigger>
                      <TabsTrigger value="templates">Templates</TabsTrigger>
                    </TabsList>
                  )}

                  <TabsContent value="custom" className="space-y-4">
                    <Input
                      placeholder="Habit name"
                      value={habitForm.name}
                      onChange={(e) => setHabitForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      placeholder="Description (optional)"
                      value={habitForm.description}
                      onChange={(e) => setHabitForm(prev => ({ ...prev, description: e.target.value }))}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <Select value={habitForm.frequency} onValueChange={(v) => setHabitForm(prev => ({ ...prev, frequency: v as any }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {HABIT_FREQUENCIES.map(f => (
                            <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Target"
                          value={habitForm.targetCount}
                          onChange={(e) => setHabitForm(prev => ({ ...prev, targetCount: parseInt(e.target.value) || 1 }))}
                          min={1}
                          className="w-20"
                        />
                      </div>
                    </div>

                    {/* Icon Selection */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Icon</label>
                      <div className="flex flex-wrap gap-2">
                        {HABIT_ICONS.map(({ value, icon: Icon, label }) => (
                          <Button
                            key={value}
                            variant={habitForm.icon === value ? "default" : "outline"}
                            size="icon"
                            onClick={() => setHabitForm(prev => ({ ...prev, icon: value }))}
                            title={label}
                          >
                            <Icon className="h-4 w-4" />
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Color Selection */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Color</label>
                      <div className="flex gap-2">
                        {HABIT_COLORS.map(color => (
                          <button
                            key={color}
                            onClick={() => setHabitForm(prev => ({ ...prev, color }))}
                            className={cn(
                              "h-8 w-8 rounded-full transition-all",
                              habitForm.color === color && "ring-2 ring-offset-2 ring-primary"
                            )}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <Button onClick={handleAddHabit} className="w-full" disabled={!habitForm.name.trim()}>
                      {editingHabit ? 'Update Habit' : 'Create Habit'}
                    </Button>
                  </TabsContent>

                  <TabsContent value="templates" className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    <p className="text-sm text-muted-foreground mb-2">
                      Start with a Sunnah or recommended habit.
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      {templates.map((template) => (
                        <div
                          key={template.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                          onClick={async () => {
                            await createHabitFromTemplate.mutateAsync(template);
                            setHabitDialogOpen(false);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="p-2 rounded-lg bg-primary/10 text-xl"
                              style={{ color: template.color }}
                            >
                              {template.icon}
                            </div>
                            <div>
                              <h4 className="font-medium text-sm flex items-center gap-2">
                                {template.name}
                                {template.is_sunnah && <Badge variant="secondary" className="text-[10px] h-5">Sunnah</Badge>}
                              </h4>
                              <p className="text-xs text-muted-foreground line-clamp-1">{template.description}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost"><Plus className="h-4 w-4" /></Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>

          {/* Habit Tracker Grid */}
          {habits.filter(h => h.is_active).length === 0 ? (
            <div className="bento-card text-center py-12">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No habits yet. Start building your routine!</p>
            </div>
          ) : (
            <div className="bento-card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground min-w-[200px]">Habit</th>
                    {weekDays.map(day => (
                      <th key={day.toISOString()} className="text-center py-3 px-2 font-medium min-w-[50px]">
                        <div className="text-xs text-muted-foreground">{format(day, 'EEE')}</div>
                        <div className={cn(
                          "text-sm",
                          format(day, 'yyyy-MM-dd') === today && "text-primary font-bold"
                        )}>
                          {format(day, 'd')}
                        </div>
                      </th>
                    ))}
                    <th className="text-center py-3 px-2 min-w-[60px]">
                      <Flame className="h-4 w-4 mx-auto text-gold" />
                    </th>
                    <th className="w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {habits.filter(h => {
                    if (!h.is_active) return false;
                    // Only show habit if it was created before or during this week
                    const createdAt = h.created_at ? parseISO(h.created_at) : new Date();
                    const weekEnd = addDays(weekStart, 6);
                    return createdAt <= weekEnd;
                  }).map(habit => {
                    const HabitIcon = getHabitIcon(habit.icon || 'check');

                    const weekCompletions = weekDays.filter(day => {
                      const dStr = format(day, 'yyyy-MM-dd');
                      const createdAt = habit.created_at ? parseISO(habit.created_at) : new Date();

                      // Don't count completions before creation
                      if (parseISO(dStr) < startOfWeek(createdAt, { weekStartsOn: 1 }) && dStr !== format(createdAt, 'yyyy-MM-dd')) {
                        return false;
                      }

                      return habitCompletions.some(c =>
                        c.habit_id === habit.id &&
                        (c.completed_date === dStr || c.completed_date?.startsWith(dStr))
                      );
                    }).length;

                    // Calculate dynamic current streak for this specific habit
                    let dynamicStreak = 0;
                    let checkDate = new Date();
                    const completionsForHabit = habitCompletions.filter(c => c.habit_id === habit.id);

                    while (true) {
                      const dStr = format(checkDate, 'yyyy-MM-dd');
                      if (completionsForHabit.some(c => c.completed_date === dStr || c.completed_date?.startsWith(dStr))) {
                        dynamicStreak++;
                        checkDate = subDays(checkDate, 1);
                      } else if (dStr === today) {
                        checkDate = subDays(checkDate, 1);
                        continue;
                      } else {
                        break;
                      }
                      if (dynamicStreak > 365) break;
                    }

                    return (
                      <tr key={habit.id} className="group border-t border-border">
                        <td className="py-3 px-2">
                          {/* ... existing cell content ... */}
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: `${habit.color}20` }}>
                              <HabitIcon className="h-4 w-4" style={{ color: habit.color || '#0B5B42' }} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{habit.name}</span>
                                {(habit as any).is_sunnah && <Badge variant="secondary" className="text-[10px] h-4 px-1 py-0">Sunnah</Badge>}
                              </div>
                              {(habit.target_count || 1) > 1 && <span className="text-xs text-muted-foreground">Target: {habit.target_count}</span>}
                            </div>
                          </div>
                        </td>
                        {weekDays.map(day => {
                          const dateStr = format(day, 'yyyy-MM-dd');
                          const completion = habitCompletions.find(c =>
                            c.habit_id === habit.id &&
                            (c.completed_date === dateStr || c.completed_date?.startsWith(dateStr))
                          );
                          const isServerCompleted = completion && (completion.count || 0) >= (habit.target_count || 1);

                          // Use local optimistic state if available, otherwise server state
                          const key = `${habit.id}_${dateStr}`;
                          const isCompleted = localCompletions[key] !== undefined ? localCompletions[key] : isServerCompleted;

                          const isPartial = !isCompleted && completion && (completion.count || 0) < (habit.target_count || 1) && (completion.count || 0) > 0;

                          // Don't show interactive box for dates before habit was created
                          const createdAt = habit.created_at ? parseISO(habit.created_at) : new Date();
                          const isBeforeCreation = parseISO(dateStr) < startOfWeek(createdAt, { weekStartsOn: 1 }) && dateStr !== format(createdAt, 'yyyy-MM-dd');

                          return (
                            <td key={dateStr} className="text-center py-3 px-2">
                              {!isBeforeCreation ? (
                                <button
                                  onClick={() => toggleHabit(habit.id, dateStr)}
                                  className={cn(
                                    "h-8 w-8 rounded-full flex items-center justify-center transition-all mx-auto border-2",
                                    isCompleted
                                      ? "text-white scale-105"
                                      : "border-muted-foreground/30 hover:border-primary/50 bg-transparent",
                                    !isCompleted && dateStr === today && "border-primary/50 bg-secondary/10"
                                  )}
                                  style={{
                                    backgroundColor: isCompleted ? (habit.color || '#0B5B42') : 'transparent',
                                    borderColor: isCompleted ? (habit.color || '#0B5B42') : undefined,
                                  }}
                                >
                                  {isCompleted && <Check className="h-5 w-5" strokeWidth={3} />}
                                  {isPartial && <span className="text-xs font-bold" style={{ color: habit.color || '#0B5B42' }}>{completion?.count}</span>}
                                </button>
                              ) : (
                                <div className="h-1.5 w-1.5 rounded-full bg-muted/20 mx-auto" />
                              )}
                            </td>
                          );
                        })}
                        <td className="text-center py-3 px-2">
                          <div className="flex flex-col items-center justify-center">
                            <div className="flex items-center gap-1">
                              <Flame className="h-3 w-3 text-gold" />
                              <span className="font-medium text-gold">{dynamicStreak}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">{weekCompletions}/7</span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => {
                                setEditingHabit(habit);
                                setHabitForm({
                                  name: habit.name,
                                  description: habit.description || '',
                                  frequency: (habit.frequency as any) || 'daily',
                                  targetCount: habit.target_count || 1,
                                  unit: '',
                                  color: habit.color || HABIT_COLORS[0],
                                  icon: habit.icon || 'check',
                                });
                                setHabitDialogOpen(true);
                              }}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => deleteHabit(habit.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Archived Habits */}
          {habits.filter(h => !h.is_active).length > 0 && (
            <div className="bento-card">
              <h4 className="font-medium text-muted-foreground mb-3">Archived Habits ({habits.filter(h => !h.is_active).length})</h4>
              <div className="flex flex-wrap gap-2">
                {habits.filter(h => !h.is_active).map(h => (
                  <Badge key={h.id} variant="secondary" className="cursor-pointer" onClick={() => {
                    updateHabit({ id: h.id, is_active: true });
                  }}>
                    {h.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* JOURNAL TAB */}
        <TabsContent value="journal" className="space-y-4">
          {/* Today's Entry or Add */}
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Daily Reflection</h3>
            <Dialog open={journalDialogOpen} onOpenChange={setJournalDialogOpen}>
              <DialogTrigger asChild>
                <Button variant={todayEntry ? "outline" : "default"}>
                  {todayEntry ? (
                    <><Edit2 className="h-4 w-4 mr-2" />Edit Today's Entry</>
                  ) : (
                    <><Plus className="h-4 w-4 mr-2" />Write Today's Entry</>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Daily Reflection - {format(new Date(), 'MMMM d, yyyy')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                  {/* Mood */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">How are you feeling today?</label>
                    <div className="flex gap-2 flex-wrap">
                      {MOODS.map(mood => (
                        <Button
                          key={mood.value}
                          type="button"
                          variant={journalForm.mood === mood.value ? "default" : "outline"}
                          size="lg"
                          onClick={() => setJournalForm(prev => ({ ...prev, mood: mood.value }))}
                          className={cn(
                            "flex-col h-auto py-3 px-4",
                            journalForm.mood === mood.value && mood.value === 'great' && "gradient-green border-0",
                            journalForm.mood === mood.value && mood.value === 'good' && "bg-green-dark border-0 text-white"
                          )}
                        >
                          <span className="text-2xl">{mood.emoji}</span>
                          <span className="text-xs mt-1">{mood.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Energy Level */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Energy Level: {journalForm.energyLevel}/10</label>
                    <Slider
                      value={[journalForm.energyLevel]}
                      onValueChange={(v) => setJournalForm(prev => ({ ...prev, energyLevel: v[0] }))}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>

                  {/* Gratitude */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">3 Things I'm Grateful For</label>
                    <div className="space-y-2">
                      {[0, 1, 2].map(i => (
                        <Input
                          key={i}
                          placeholder={`Gratitude ${i + 1}...`}
                          value={journalForm.gratitude[i]}
                          onChange={(e) => {
                            const newGratitude = [...journalForm.gratitude];
                            newGratitude[i] = e.target.value;
                            setJournalForm(prev => ({ ...prev, gratitude: newGratitude }));
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Highlights */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Today's Highlight</label>
                    <Input
                      placeholder="What was the best part of your day?"
                      value={journalForm.highlights}
                      onChange={(e) => setJournalForm(prev => ({ ...prev, highlights: e.target.value }))}
                    />
                  </div>

                  {/* Challenges */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Challenges Faced</label>
                    <Input
                      placeholder="What challenges did you face today?"
                      value={journalForm.challenges}
                      onChange={(e) => setJournalForm(prev => ({ ...prev, challenges: e.target.value }))}
                    />
                  </div>

                  {/* Lessons */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Lessons Learned</label>
                    <Input
                      placeholder="What did you learn today?"
                      value={journalForm.lessonsLearned}
                      onChange={(e) => setJournalForm(prev => ({ ...prev, lessonsLearned: e.target.value }))}
                    />
                  </div>

                  {/* Tomorrow Intentions */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tomorrow's Intentions</label>
                    <Input
                      placeholder="What do you want to accomplish tomorrow?"
                      value={journalForm.tomorrowIntentions}
                      onChange={(e) => setJournalForm(prev => ({ ...prev, tomorrowIntentions: e.target.value }))}
                    />
                  </div>

                  {/* Free Writing */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Free Writing</label>
                    <Textarea
                      placeholder="Write freely about your thoughts, feelings, or anything on your mind..."
                      value={journalForm.freeWriting}
                      onChange={(e) => setJournalForm(prev => ({ ...prev, freeWriting: e.target.value }))}
                      className="min-h-32"
                    />
                  </div>

                  <Button onClick={handleSaveJournal} className="w-full">Save Entry</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Today's Entry Preview */}
          {todayEntry && (
            <div className="bento-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{MOODS.find(m => m.value === todayEntry.mood)?.emoji || '😐'}</span>
                  <div>
                    <h4 className="font-medium">Today's Entry</h4>
                    <p className="text-sm text-muted-foreground">Energy: {todayEntry.energy_level || 0}/10</p>
                  </div>
                </div>
                <Badge variant="secondary">Completed</Badge>
              </div>
              {todayEntry.gratitude && (todayEntry.gratitude as string[]).length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Gratitude</p>
                  <ul className="list-disc list-inside text-sm">
                    {(todayEntry.gratitude as string[]).map((g, i) => <li key={i}>{g}</li>)}
                  </ul>
                </div>
              )}
              {todayEntry.notes && (
                <p className="text-sm text-muted-foreground">{todayEntry.notes}</p>
              )}
            </div>
          )}

          {/* Past Entries */}
          <div className="space-y-3">
            <h4 className="font-medium text-muted-foreground">Past Entries</h4>
            {journalEntries.filter(e => e.entry_date !== today).length === 0 ? (
              <div className="bento-card text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No past journal entries yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {journalEntries.filter(e => e.entry_date !== today).slice(0, 10).map(entry => {
                  const mood = MOODS.find(m => m.value === entry.mood);
                  return (
                    <div
                      key={entry.id}
                      className="bento-card cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => setViewingEntry(entry as any)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{format(parseISO(entry.entry_date), 'EEEE, MMMM d')}</span>
                        <span className="text-2xl">{mood?.emoji}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />{entry.energy_level || 0}/10
                        </Badge>
                        {entry.gratitude && (entry.gratitude as string[]).length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Heart className="h-3 w-3 mr-1" />{(entry.gratitude as string[]).length}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {entry.notes || (entry.highlights as string) || (entry.gratitude as string[])?.[0] || 'No content'}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Entry View Dialog */}
          <Dialog open={!!viewingEntry} onOpenChange={() => setViewingEntry(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              {viewingEntry && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                      <span className="text-2xl">{MOODS.find(m => m.value === viewingEntry.mood)?.emoji || '😐'}</span>
                      {format(parseISO(viewingEntry.entry_date), 'EEEE, MMMM d, yyyy')}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="flex gap-3">
                      <Badge variant="outline"><Zap className="h-3 w-3 mr-1" />Energy: {viewingEntry.energy_level || 0}/10</Badge>
                      <Badge variant="outline" className="capitalize">{viewingEntry.mood}</Badge>
                    </div>

                    {viewingEntry.gratitude && (viewingEntry.gratitude as string[]).length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Gratitude</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {(viewingEntry.gratitude as string[]).map((g, i) => <li key={i}>{g}</li>)}
                        </ul>
                      </div>
                    )}

                    {viewingEntry.highlights && (viewingEntry.highlights as string).length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Highlights</h4>
                        <p>{(viewingEntry.highlights as string)}</p>
                      </div>
                    )}

                    {viewingEntry.challenges && (viewingEntry.challenges as string).length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Challenges</h4>
                        <p>{(viewingEntry.challenges as string)}</p>
                      </div>
                    )}

                    {viewingEntry.learnings && (viewingEntry.learnings as string).length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Lessons Learned</h4>
                        <p>{(viewingEntry.learnings as string)}</p>
                      </div>
                    )}

                    {viewingEntry.notes && (
                      <div>
                        <h4 className="font-medium mb-2">Reflection</h4>
                        <p className="whitespace-pre-wrap">{viewingEntry.notes}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* INSIGHTS TAB */}
        <TabsContent value="insights" className="space-y-4">
          {/* Mood Distribution */}
          <div className="bento-card">
            <h4 className="font-medium mb-4">Mood Distribution (This Month)</h4>
            <div className="grid grid-cols-5 gap-3">
              {MOODS.map(mood => {
                const count = journalStats.moodCounts[mood.value] || 0;
                const percentage = journalStats.monthEntries > 0
                  ? Math.round((count / journalStats.monthEntries) * 100)
                  : 0;
                return (
                  <div key={mood.value} className="text-center">
                    <span className="text-3xl block mb-2">{mood.emoji}</span>
                    <p className="text-xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">{percentage}%</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Habit Performance */}
          <div className="bento-card">
            <h4 className="font-medium mb-4">Habit Performance</h4>
            <div className="space-y-3">
              {habits.filter(h => h.is_active).map(habit => {
                const last30Days = Array.from({ length: 30 }, (_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd'));
                const completedDays = habitCompletions.filter(c => c.habit_id === habit.id && last30Days.includes(c.completed_date)).length;
                const rate = Math.round((completedDays / 30) * 100);
                const HabitIcon = getHabitIcon(habit.icon || 'check');

                return (
                  <div key={habit.id} className="flex items-center gap-4">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${habit.color}20` }}
                    >
                      <HabitIcon className="h-4 w-4" style={{ color: habit.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{habit.name}</span>
                        <span className="text-sm text-muted-foreground">{rate}%</span>
                      </div>
                      <Progress value={rate} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bento-card text-center">
              <Calendar className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-primary">{journalStats.monthEntries}</p>
              <p className="text-xs text-muted-foreground">Entries This Month</p>
            </div>
            <div className="bento-card text-center">
              <Zap className="h-5 w-5 mx-auto mb-2 text-gold" />
              <p className="text-2xl font-bold text-gold">{journalStats.avgEnergy}</p>
              <p className="text-xs text-muted-foreground">Avg Energy</p>
            </div>
            <div className="bento-card text-center">
              <TrendingUp className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{habitStats.weeklyRate}%</p>
              <p className="text-xs text-muted-foreground">Weekly Completion</p>
            </div>
            <div className="bento-card text-center gradient-gold">
              <Award className="h-5 w-5 mx-auto mb-2" />
              <p className="text-2xl font-bold">{habitStats.longestStreak}</p>
              <p className="text-xs opacity-80">Best Streak</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}