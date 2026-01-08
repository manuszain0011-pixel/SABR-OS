import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { ArrowUpRight, Target, CheckCircle2, Wallet, Flame, Quote, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { PrayerTimesWidget } from '@/components/dashboard/PrayerTimesWidget';
import { StandardCalendarWidget } from '@/components/dashboard/StandardCalendarWidget';
import { ProgressChartsWidget } from '@/components/dashboard/ProgressChartsWidget';
import { MonthlyOverviewWidget } from '@/components/dashboard/MonthlyOverviewWidget';
import { QuickActionsWidget } from '@/components/dashboard/QuickActionsWidget';
import { QuickCaptureWidget } from '@/components/dashboard/QuickCaptureWidget';
import { SystemStatsWidget } from '@/components/dashboard/SystemStatsWidget';
import { PureHijriCalendar } from '@/components/dashboard/PureHijriCalendar';
import { AyahHadithWidget } from '@/components/dashboard/AyahHadithWidget';
import { DeepWorkTimer } from '@/components/dashboard/DeepWorkTimer';

export default function Dashboard() {
  const { stats, goals, habits } = useApp();
  const navigate = useNavigate();

  const goalStats = useMemo(() => {
    const active = goals.filter(g => g.status !== 'completed');
    const avgProgress = active.length > 0 ? active.reduce((sum, g) => sum + (g.progress || 0), 0) / active.length : 0;
    return { active: active.length, avgProgress: Math.round(avgProgress) };
  }, [goals]);

  const habitStats = useMemo(() => {
    const activeHabits = habits.filter(h => h.is_active);
    const avgStreak = activeHabits.length > 0 ? activeHabits.reduce((sum, h) => sum + (h.streak_current || 0), 0) / activeHabits.length : 0;
    return { total: activeHabits.length, avgStreak: Math.round(avgStreak) };
  }, [habits]);

  return (
    <div className="space-y-8 md:space-y-10 animate-fade-in app-3d-root px-1 sm:px-2 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-2">
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-foreground">
            Assalamu Alaikum
          </h1>
        </div>
        <div className="flex items-center gap-4 px-6 py-3.5 rounded-3xl !bg-[#C5A059] text-white shadow-2xl shadow-[#C5A059]/30 transition-all hover:scale-105 active:scale-95 cursor-default border-none">
          <div className="p-2.5 rounded-2xl bg-white/20">
            <Flame className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest opacity-90">Today's SPI</p>
            <p className="text-3xl font-black tracking-tight leading-none mt-0.5">{stats.prayerScoreToday}</p>
          </div>
        </div>
      </div>

      {/* Ambiance Row (Top Level) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div className="h-full">
          <AyahHadithWidget />
        </div>
        <div className="h-full">
          <DeepWorkTimer />
        </div>
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
        {/* Prayer Times Widget */}
        <div className="lg:row-span-2 xl:row-span-2">
          <PrayerTimesWidget />
        </div>

        {/* Quick Capture */}
        <QuickCaptureWidget />

        {/* Quick Actions */}
        <QuickActionsWidget />

        {/* Goals Card */}
        <div
          className="bento-card-interactive group"
          onClick={() => navigate('/goals')}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="icon-box bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-lg">Goals</span>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="metric-value text-primary">{goalStats.active}</span>
              <span className="text-sm text-muted-foreground">active goals</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Average Progress</span>
                <span className="font-semibold text-primary">{goalStats.avgProgress}%</span>
              </div>
              <Progress value={goalStats.avgProgress} className="h-2 rounded-full" />
            </div>
          </div>
        </div>

        {/* Tasks Card */}
        <div
          className="bento-card-interactive group"
          onClick={() => navigate('/tasks')}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="icon-box bg-green-light">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-lg">Tasks</span>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="metric-value">{stats.tasksToday}</p>
              <p className="metric-label">due today</p>
            </div>
            <div>
              <p className="metric-value text-destructive">{stats.tasksOverdue}</p>
              <p className="metric-label">overdue</p>
            </div>
          </div>
        </div>

        {/* Habits Card */}
        <div
          className="bento-card-interactive group"
          onClick={() => navigate('/wellness')}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="icon-box bg-gold-light">
                <Flame className="h-5 w-5 text-gold" />
              </div>
              <span className="font-semibold text-lg">Habits</span>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="metric-value text-gold">{habitStats.total}</span>
            <span className="text-sm text-muted-foreground">active habits</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Average streak: <span className="font-medium text-foreground">{habitStats.avgStreak} days</span>
          </p>
        </div>

        {/* Finance Card */}
        <div
          className="bento-card-interactive group md:col-span-2 xl:col-span-2"
          onClick={() => navigate('/finance')}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="icon-box bg-gold-light">
                <Wallet className="h-5 w-5 text-gold" />
              </div>
              <span className="font-semibold text-lg">Finance</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">
                {format(new Date(), 'MMMM yyyy')}
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="metric-label mb-1">Income</p>
              <p className="text-2xl sm:text-3xl font-black tracking-tighter text-primary">
                ${stats.monthlyIncome.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="metric-label mb-1">Expenses</p>
              <p className="text-2xl sm:text-3xl font-black tracking-tighter text-destructive">
                ${stats.monthlyExpenses.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="metric-label mb-1">Balance</p>
              <p className={cn(
                "text-2xl sm:text-3xl font-black tracking-tighter",
                stats.monthlyBalance >= 0 ? "text-primary" : "text-destructive"
              )}>
                ${Math.abs(stats.monthlyBalance).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Calendars */}
        <StandardCalendarWidget />
        <PureHijriCalendar />

        {/* Progress Charts & Monthly Overview */}
        <div className="md:col-span-2 xl:col-span-2">
          <ProgressChartsWidget />
        </div>

        <div className="md:col-span-2">
          <MonthlyOverviewWidget />
        </div>

        {/* System Stats */}
        <div className="md:col-span-2 xl:col-span-3">
          <SystemStatsWidget />
        </div>
      </div>
    </div>
  );
}
