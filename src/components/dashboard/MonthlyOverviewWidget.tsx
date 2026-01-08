import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, isWithinInterval } from 'date-fns';
import { Calendar, TrendingUp, TrendingDown, Target, CheckCircle, Moon, BookOpen, Wallet, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export function MonthlyOverviewWidget() {
  const { tasks, goals, prayerRecords, habits, transactions, quranProgress, journalEntries } = useApp();

  const monthlyData = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const totalDays = eachDayOfInterval({ start: monthStart, end: now }).length;

    // Tasks
    const monthTasks = tasks.filter(t => {
      if (!t.created_at) return false;
      return isWithinInterval(parseISO(t.created_at), { start: monthStart, end: monthEnd });
    });
    const completedTasks = monthTasks.filter(t => t.status === 'completed').length;

    // Goals
    const activeGoals = goals.filter(g => g.status === 'in_progress');
    const avgGoalProgress = activeGoals.length > 0
      ? activeGoals.reduce((sum, g) => sum + (g.progress || 0), 0) / activeGoals.length
      : 0;

    // Prayers
    const monthPrayers = prayerRecords.filter(p => {
      return isWithinInterval(parseISO(p.date), { start: monthStart, end: monthEnd });
    });
    let totalPrayersCompleted = 0;
    monthPrayers.forEach((p) => {
      const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
      prayers.forEach((prayer) => {
        const status = p[prayer];
        if (status && status !== 'pending' && status !== 'missed') {
          totalPrayersCompleted++;
        }
      });
    });
    const prayerPercentage = totalDays > 0 ? (totalPrayersCompleted / (totalDays * 5)) * 100 : 0;

    // Quran
    const monthQuran = quranProgress.filter(q => {
      return isWithinInterval(parseISO(q.date), { start: monthStart, end: monthEnd });
    });
    const quranPages = monthQuran.reduce((sum, q) => sum + (q.pages_read || 0), 0);

    // Habits - now we don't have completions embedded, just count active habits with current streaks
    const activeHabits = habits.filter(h => h.is_active);
    const habitStreakTotal = activeHabits.reduce((sum, h) => sum + (h.streak_current || 0), 0);
    const habitPercentage = activeHabits.length > 0
      ? Math.min((habitStreakTotal / (activeHabits.length * 7)) * 100, 100)
      : 0;

    // Finance
    const monthTransactions = transactions.filter(t => {
      return isWithinInterval(parseISO(t.date), { start: monthStart, end: monthEnd });
    });
    const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);

    // Journal
    const monthJournal = journalEntries.filter(j => {
      return isWithinInterval(parseISO(j.entry_date), { start: monthStart, end: monthEnd });
    });

    return {
      tasks: { completed: completedTasks, total: monthTasks.length },
      goals: { active: activeGoals.length, avgProgress: Math.round(avgGoalProgress) },
      prayers: { completed: totalPrayersCompleted, percentage: Math.round(prayerPercentage) },
      quran: { pages: quranPages },
      habits: { streakTotal: habitStreakTotal, percentage: Math.round(habitPercentage) },
      finance: { income, expenses, balance: income - expenses },
      journal: { entries: monthJournal.length },
      daysTracked: totalDays,
    };
  }, [tasks, goals, prayerRecords, habits, transactions, quranProgress, journalEntries]);

  const metrics = [
    {
      label: 'Prayers',
      icon: Moon,
      value: `${monthlyData.prayers.percentage}%`,
      subtext: `${monthlyData.prayers.completed} completed`,
      progress: monthlyData.prayers.percentage,
      color: 'primary',
    },
    {
      label: 'Tasks',
      icon: CheckCircle,
      value: monthlyData.tasks.completed.toString(),
      subtext: `of ${monthlyData.tasks.total} completed`,
      progress: monthlyData.tasks.total > 0 ? (monthlyData.tasks.completed / monthlyData.tasks.total) * 100 : 0,
      color: 'primary',
    },
    {
      label: 'Goals',
      icon: Target,
      value: `${monthlyData.goals.avgProgress}%`,
      subtext: `${monthlyData.goals.active} active`,
      progress: monthlyData.goals.avgProgress,
      color: 'gold',
    },
    {
      label: 'Quran',
      icon: BookOpen,
      value: monthlyData.quran.pages.toString(),
      subtext: 'pages read',
      progress: Math.min((monthlyData.quran.pages / 30) * 100, 100),
      color: 'primary',
    },
    {
      label: 'Habits',
      icon: Heart,
      value: `${monthlyData.habits.percentage}%`,
      subtext: `${monthlyData.habits.streakTotal} streak days`,
      progress: monthlyData.habits.percentage,
      color: 'gold',
    },
  ];

  return (
    <div className="bento-card">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="icon-box-sm bg-primary/10">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-semibold">Monthly Overview</h3>
        </div>
        <span className="text-xs font-medium text-muted-foreground px-2.5 py-1 rounded-full bg-secondary">
          {format(new Date(), 'MMM yyyy')}
        </span>
      </div>

      {/* Days Tracked */}
      <div className="mb-5 p-4 neumorphic-inset text-center">
        <p className="text-3xl font-bold tracking-tight text-primary">{monthlyData.daysTracked}</p>
        <p className="text-sm text-muted-foreground">days tracked this month</p>
      </div>

      {/* Metrics Grid */}
      <div className="space-y-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="group">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <metric.icon className={cn(
                  "h-4 w-4",
                  metric.color === 'primary' ? "text-primary" : "text-gold"
                )} />
                <span className="text-sm font-medium">{metric.label}</span>
              </div>
              <div className="text-right flex items-baseline gap-1.5">
                <span className={cn(
                  "text-lg font-bold tracking-tight",
                  metric.color === 'primary' ? "text-primary" : "text-gold"
                )}>
                  {metric.value}
                </span>
                <span className="text-xs text-muted-foreground">{metric.subtext}</span>
              </div>
            </div>
            <Progress
              value={metric.progress}
              className={cn(
                "h-1.5",
                metric.color === 'gold' && "[&>div]:bg-gold"
              )}
            />
          </div>
        ))}
      </div>

      {/* Finance Summary */}
      <div className="mt-5 pt-5 border-t border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="h-4 w-4 text-gold" />
          <span className="text-sm font-semibold">Finance Summary</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 neumorphic-inset text-center overflow-hidden">
            <TrendingUp className="h-5 w-5 mx-auto mb-1.5 text-primary" />
            <p className="text-xl font-black tracking-tighter text-primary truncate" title={`$${monthlyData.finance.income.toLocaleString()}`}>
              ${monthlyData.finance.income.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Monthly Income</p>
          </div>
          <div className="p-4 neumorphic-inset text-center overflow-hidden">
            <TrendingDown className="h-5 w-5 mx-auto mb-1.5 text-destructive" />
            <p className="text-xl font-black tracking-tighter text-destructive truncate" title={`$${monthlyData.finance.expenses.toLocaleString()}`}>
              ${monthlyData.finance.expenses.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Monthly Expenses</p>
          </div>
          <div className="p-4 neumorphic-inset text-center overflow-hidden">
            <Wallet className="h-5 w-5 mx-auto mb-1.5 text-foreground" />
            <p className={cn(
              "text-xl font-black tracking-tighter truncate",
              monthlyData.finance.balance >= 0 ? "text-primary" : "text-destructive"
            )} title={`$${Math.abs(monthlyData.finance.balance).toLocaleString()}`}>
              ${Math.abs(monthlyData.finance.balance).toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Net Balance</p>
          </div>
        </div>
      </div>
    </div>
  );
}
