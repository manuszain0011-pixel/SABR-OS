import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths, parseISO, isWithinInterval } from 'date-fns';
import { Calendar, Target, CheckCircle, Moon, BookOpen, Heart, TrendingUp, TrendingDown, Star, Lightbulb, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { WeeklyReview, MonthlyReview } from '@/types';

export default function Reviews() {
  const {
    weeklyReviews, createWeeklyReview,
    monthlyReviews, createMonthlyReview,
    tasks, goals, prayerRecords, habits, transactions, quranProgress, journalEntries
  } = useApp();

  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);

  // Calculate current period dates
  const currentWeekStart = startOfWeek(subWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(subWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  const currentMonthStart = startOfMonth(subMonths(new Date(), monthOffset));
  const currentMonthEnd = endOfMonth(subMonths(new Date(), monthOffset));

  // Auto-calculate insights for the period
  const weeklyInsights = useMemo(() => {
    const interval = { start: currentWeekStart, end: currentWeekEnd };

    // Tasks
    const periodTasks = tasks.filter(t => t.due_date && isWithinInterval(parseISO(t.due_date), interval));
    const completedTasks = periodTasks.filter(t => t.status === 'completed').length;

    // Prayers
    const periodPrayers = prayerRecords.filter(p => isWithinInterval(parseISO(p.date), interval));
    let prayersCompleted = 0;
    let prayerTotal = 0;
    periodPrayers.forEach(p => {
      const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
      prayers.forEach(prayer => {
        prayerTotal++;
        const s = p[prayer];
        if (s && s !== 'none' && s !== 'missed') prayersCompleted++;
      });
    });

    // Habits
    const activeHabits = habits.filter(h => h.is_active);
    let habitCompletions = 0;
    // Placeholder for habit completions since schema is different
    // In a real scenario, we'd query habit_completions table

    // Quran
    const periodQuran = quranProgress.filter(q => isWithinInterval(parseISO(q.date), interval));
    const quranPages = periodQuran.reduce((sum, q) => sum + (q.pages_read || 0), 0);

    // Journal entries
    const periodJournal = journalEntries.filter(j => isWithinInterval(parseISO(j.entry_date), interval));
    const moodAvg = periodJournal.length > 0
      ? periodJournal.reduce((sum, j) => {
        const moodScores: any = { great: 5, good: 4, neutral: 3, bad: 2, terrible: 1 };
        return sum + (moodScores[j.mood || 'neutral'] || 3);
      }, 0) / periodJournal.length
      : 0;

    // Goals progress
    const goalsProgress = goals
      .filter(g => g.status === 'in_progress')
      .map(g => ({ goalId: g.id, progress: g.progress || 0, title: g.title }));

    return {
      tasksCompleted: completedTasks,
      tasksPlanned: periodTasks.length,
      prayerScore: prayerTotal > 0 ? Math.round((prayersCompleted / prayerTotal) * 100) : 0,
      habitScore: activeHabits.length > 0 ? Math.round((habitCompletions / (activeHabits.length * 7)) * 100) : 0,
      quranPages,
      moodAvg: Math.round(moodAvg * 10) / 10,
      goalsProgress,
      journalEntriesCount: periodJournal.length,
    };
  }, [currentWeekStart, currentWeekEnd, tasks, prayerRecords, habits, quranProgress, journalEntries, goals]);

  const monthlyInsights = useMemo(() => {
    const interval = { start: currentMonthStart, end: currentMonthEnd };

    // Finance
    const periodTransactions = transactions.filter(t => isWithinInterval(parseISO(t.date), interval));
    const income = periodTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = periodTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);

    // Goals achieved
    const goalsAchieved = goals.filter(g =>
      g.completed_at && isWithinInterval(parseISO(g.completed_at), interval)
    );

    // Fasting (placeholder)
    const fasts = 0;

    // Quran
    const periodQuran = quranProgress.filter(q => isWithinInterval(parseISO(q.date), interval));
    const quranPages = periodQuran.reduce((sum, q) => sum + (q.pages_read || 0), 0);

    // Prayer average
    const periodPrayers = prayerRecords.filter(p => isWithinInterval(parseISO(p.date), interval));
    let prayersCompleted = 0;
    let prayerTotal = 0;
    periodPrayers.forEach(p => {
      const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
      prayers.forEach(prayer => {
        prayerTotal++;
        const s = p[prayer];
        if (s && s !== 'none' && s !== 'missed') prayersCompleted++;
      });
    });

    return {
      income,
      expenses,
      savings: income - expenses,
      prayerAverage: prayerTotal > 0 ? Math.round((prayersCompleted / prayerTotal) * 100) : 0,
      quranPages,
      fasts,
      goalsAchieved: goalsAchieved.map(g => g.title),
    };
  }, [currentMonthStart, currentMonthEnd, transactions, goals, quranProgress, prayerRecords]);

  // Form state for new review
  const [newReview, setNewReview] = useState({
    accomplishments: [''],
    challenges: [''],
    lessonsLearned: [''],
    nextPriorities: [''],
    notes: '',
    overallRating: 3,
  });

  const handleAddItem = (field: 'accomplishments' | 'challenges' | 'lessonsLearned' | 'nextPriorities') => {
    setNewReview(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const handleUpdateItem = (field: 'accomplishments' | 'challenges' | 'lessonsLearned' | 'nextPriorities', index: number, value: string) => {
    setNewReview(prev => {
      const updated = [...prev[field]];
      updated[index] = value;
      return { ...prev, [field]: updated };
    });
  };

  const handleSaveWeeklyReview = () => {
    createWeeklyReview({
      week_start: format(currentWeekStart, 'yyyy-MM-dd'),
      week_end: format(currentWeekEnd, 'yyyy-MM-dd'),
      accomplishments: newReview.accomplishments.filter(a => a.trim()),
      challenges: newReview.challenges.filter(c => c.trim()),
      lessons_learned: newReview.lessonsLearned.filter(l => l.trim()),
      overall_rating: newReview.overallRating,
      next_week_priorities: newReview.nextPriorities.filter(p => p.trim()),
      notes: newReview.notes,
    });

    setShowCreateSheet(false);
    resetForm();
  };

  const handleSaveMonthlyReview = () => {
    createMonthlyReview({
      month: currentMonthStart.getMonth() + 1,
      year: currentMonthStart.getFullYear(),
      key_wins: newReview.accomplishments.filter(a => a.trim()),
      goals_missed: newReview.challenges.filter(c => c.trim()),
      areas_to_improve: newReview.lessonsLearned.filter(l => l.trim()),
      goals_achieved: monthlyInsights.goalsAchieved,
      overall_rating: newReview.overallRating,
      next_month_focus: newReview.nextPriorities.filter(p => p.trim()),
      notes: newReview.notes,
    });

    setShowCreateSheet(false);
    resetForm();
  };

  const resetForm = () => {
    setNewReview({
      accomplishments: [''],
      challenges: [''],
      lessonsLearned: [''],
      nextPriorities: [''],
      notes: '',
      overallRating: 3,
    });
  };

  const existingWeeklyReview = weeklyReviews.find(r => r.week_start === format(currentWeekStart, 'yyyy-MM-dd'));
  const existingMonthlyReview = monthlyReviews.find(r =>
    r.month === (currentMonthStart.getMonth() + 1) && r.year === currentMonthStart.getFullYear()
  );

  return (
    <div className="space-y-6 animate-fade-in app-3d-root">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews & Reflections</h1>
          <p className="text-muted-foreground mt-1">Structured reflection for continuous growth</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'weekly' | 'monthly')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="weekly">Weekly Review</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Review</TabsTrigger>
        </TabsList>

        {/* Weekly Review Tab */}
        <TabsContent value="weekly" className="space-y-6">
          {/* Period Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={() => setWeekOffset(prev => prev + 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center">
              <p className="font-semibold">
                {format(currentWeekStart, 'MMM d')} - {format(currentWeekEnd, 'MMM d, yyyy')}
              </p>
              <p className="text-sm text-muted-foreground">
                {weekOffset === 0 ? 'This Week' : weekOffset === 1 ? 'Last Week' : `${weekOffset} weeks ago`}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setWeekOffset(prev => Math.max(0, prev - 1))}
              disabled={weekOffset === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Auto-Generated Insights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{weeklyInsights.tasksCompleted}/{weeklyInsights.tasksPlanned}</p>
                <p className="text-xs text-muted-foreground">Tasks Completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Moon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{weeklyInsights.prayerScore}%</p>
                <p className="text-xs text-muted-foreground">Prayer Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Heart className="h-6 w-6 mx-auto mb-2 text-gold" />
                <p className="text-2xl font-bold">{weeklyInsights.habitScore}%</p>
                <p className="text-xs text-muted-foreground">Habit Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <BookOpen className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{weeklyInsights.quranPages}</p>
                <p className="text-xs text-muted-foreground">Quran Pages</p>
              </CardContent>
            </Card>
          </div>

          {/* Goals Progress */}
          {weeklyInsights.goalsProgress.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Goals Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {weeklyInsights.goalsProgress.map(goal => (
                  <div key={goal.goalId}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{goal.title}</span>
                      <span className="font-medium">{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Existing Review or Create Button */}
          {existingWeeklyReview ? (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-gold" />
                  Review Completed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Overall Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star
                        key={i}
                        className={cn(
                          "h-5 w-5",
                          i <= existingWeeklyReview.overall_rating ? "text-gold fill-gold" : "text-muted"
                        )}
                      />
                    ))}
                  </div>
                </div>

                {existingWeeklyReview.accomplishments.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Accomplishments</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {existingWeeklyReview.accomplishments.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                )}

                {existingWeeklyReview.lessons_learned && existingWeeklyReview.lessons_learned.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Lessons Learned</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {existingWeeklyReview.lessons_learned.map((l, i) => <li key={i}>{l}</li>)}
                    </ul>
                  </div>
                )}

                {existingWeeklyReview.next_week_priorities && existingWeeklyReview.next_week_priorities.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Next Week Priorities</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {existingWeeklyReview.next_week_priorities.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Button onClick={() => setShowCreateSheet(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create Weekly Review
            </Button>
          )}
        </TabsContent>

        {/* Monthly Review Tab */}
        <TabsContent value="monthly" className="space-y-6">
          {/* Period Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={() => setMonthOffset(prev => prev + 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center">
              <p className="font-semibold">{format(currentMonthStart, 'MMMM yyyy')}</p>
              <p className="text-sm text-muted-foreground">
                {monthOffset === 0 ? 'This Month' : monthOffset === 1 ? 'Last Month' : `${monthOffset} months ago`}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMonthOffset(prev => Math.max(0, prev - 1))}
              disabled={monthOffset === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-lg bg-green-light">
                  <p className="text-2xl font-bold text-primary">${monthlyInsights.income.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Income</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-destructive/10">
                  <p className="text-2xl font-bold text-destructive">${monthlyInsights.expenses.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Expenses</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary">
                  <p className={cn(
                    "text-2xl font-bold",
                    monthlyInsights.savings >= 0 ? "text-primary" : "text-destructive"
                  )}>
                    ${Math.abs(monthlyInsights.savings).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {monthlyInsights.savings >= 0 ? 'Saved' : 'Deficit'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Spiritual Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5 text-primary" />
                Spiritual Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-lg bg-primary/10">
                  <p className="text-2xl font-bold text-primary">{monthlyInsights.prayerAverage}%</p>
                  <p className="text-xs text-muted-foreground">Prayer Average</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-primary/10">
                  <p className="text-2xl font-bold text-primary">{monthlyInsights.quranPages}</p>
                  <p className="text-xs text-muted-foreground">Quran Pages</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-gold/10">
                  <p className="text-2xl font-bold text-gold">{monthlyInsights.fasts}</p>
                  <p className="text-xs text-muted-foreground">Fasts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goals Achieved */}
          {monthlyInsights.goalsAchieved.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-gold" />
                  Goals Achieved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm">
                  {monthlyInsights.goalsAchieved.map((g, i) => <li key={i}>{g}</li>)}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Existing Review or Create Button */}
          {existingMonthlyReview ? (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-gold" />
                  Review Completed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Overall Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star
                        key={i}
                        className={cn(
                          "h-5 w-5",
                          i <= existingMonthlyReview.overall_rating ? "text-gold fill-gold" : "text-muted"
                        )}
                      />
                    ))}
                  </div>
                </div>

                {existingMonthlyReview.key_wins && existingMonthlyReview.key_wins.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Accomplishments</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {existingMonthlyReview.key_wins.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                )}

                {existingMonthlyReview.notes && (
                  <div>
                    <p className="font-medium mb-2">Notes</p>
                    <p className="text-sm text-muted-foreground">{existingMonthlyReview.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Button onClick={() => setShowCreateSheet(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create Monthly Review
            </Button>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Review Sheet */}
      <Sheet open={showCreateSheet} onOpenChange={setShowCreateSheet}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {activeTab === 'weekly' ? 'Weekly Review' : 'Monthly Review'}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Overall Rating */}
            <div>
              <label className="text-sm font-medium mb-2 block">Overall Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <button
                    key={i}
                    onClick={() => setNewReview(prev => ({ ...prev, overallRating: i }))}
                    className="focus:outline-none"
                  >
                    <Star
                      className={cn(
                        "h-8 w-8 transition-colors",
                        i <= newReview.overallRating ? "text-gold fill-gold" : "text-muted hover:text-gold/50"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Accomplishments */}
            <div>
              <label className="text-sm font-medium mb-2 block">Accomplishments</label>
              {newReview.accomplishments.map((item, index) => (
                <Input
                  key={index}
                  value={item}
                  onChange={(e) => handleUpdateItem('accomplishments', index, e.target.value)}
                  placeholder="What did you accomplish?"
                  className="mb-2"
                />
              ))}
              <Button variant="ghost" size="sm" onClick={() => handleAddItem('accomplishments')}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>

            {/* Challenges */}
            <div>
              <label className="text-sm font-medium mb-2 block">Challenges</label>
              {newReview.challenges.map((item, index) => (
                <Input
                  key={index}
                  value={item}
                  onChange={(e) => handleUpdateItem('challenges', index, e.target.value)}
                  placeholder="What challenges did you face?"
                  className="mb-2"
                />
              ))}
              <Button variant="ghost" size="sm" onClick={() => handleAddItem('challenges')}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>

            {/* Lessons Learned */}
            <div>
              <label className="text-sm font-medium mb-2 block">Lessons Learned</label>
              {newReview.lessonsLearned.map((item, index) => (
                <Input
                  key={index}
                  value={item}
                  onChange={(e) => handleUpdateItem('lessonsLearned', index, e.target.value)}
                  placeholder="What did you learn?"
                  className="mb-2"
                />
              ))}
              <Button variant="ghost" size="sm" onClick={() => handleAddItem('lessonsLearned')}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>

            {/* Next Period Priorities */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {activeTab === 'weekly' ? 'Next Week Priorities' : 'Next Month Goals'}
              </label>
              {newReview.nextPriorities.map((item, index) => (
                <Input
                  key={index}
                  value={item}
                  onChange={(e) => handleUpdateItem('nextPriorities', index, e.target.value)}
                  placeholder="What's the priority?"
                  className="mb-2"
                />
              ))}
              <Button variant="ghost" size="sm" onClick={() => handleAddItem('nextPriorities')}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium mb-2 block">Additional Notes</label>
              <Textarea
                value={newReview.notes}
                onChange={(e) => setNewReview(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional thoughts or reflections..."
                rows={4}
              />
            </div>

            {/* Save Button */}
            <Button
              className="w-full"
              onClick={activeTab === 'weekly' ? handleSaveWeeklyReview : handleSaveMonthlyReview}
            >
              Save Review
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
