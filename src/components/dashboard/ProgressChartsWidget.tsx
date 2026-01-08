import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { format, subDays, startOfWeek, addDays, parseISO } from 'date-fns';
import { TrendingUp, Target, Zap, BookOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const COLORS = {
  primary: 'hsl(160, 84%, 39%)',
  gold: 'hsl(38, 92%, 50%)',
  green: 'hsl(160, 84%, 39%)',
  destructive: 'hsl(0, 84%, 60%)',
  muted: 'hsl(215, 16%, 47%)',
};

export function ProgressChartsWidget() {
  const { tasks, goals, prayerRecords, habits, transactions } = useApp();

  const weeklyPrayerData = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => {
      const day = addDays(weekStart, i);
      const dateStr = format(day, 'yyyy-MM-dd');
      const record = prayerRecords.find(r => r.date === dateStr);
      
      let completed = 0;
      if (record) {
        const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
        prayers.forEach((p) => {
          const status = record[p];
          if (status && status !== 'pending' && status !== 'missed') {
            completed++;
          }
        });
      }

      return {
        day: format(day, 'EEE'),
        prayers: completed,
        target: 5,
      };
    });
  }, [prayerRecords]);

  const taskCompletionData = useMemo(() => {
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const pending = tasks.filter(t => t.status === 'not_started' || t.status === 'todo').length;
    const overdue = tasks.filter(t => {
      if (!t.due_date || t.status === 'completed') return false;
      return parseISO(t.due_date) < new Date();
    }).length;

    return [
      { name: 'Completed', value: completed, color: COLORS.primary },
      { name: 'In Progress', value: inProgress, color: COLORS.gold },
      { name: 'Pending', value: pending, color: COLORS.muted },
      { name: 'Overdue', value: overdue, color: COLORS.destructive },
    ].filter(d => d.value > 0);
  }, [tasks]);

  const goalProgressData = useMemo(() => {
    return goals
      .filter(g => g.status !== 'completed')
      .slice(0, 5)
      .map(g => ({
        name: g.title.length > 12 ? g.title.substring(0, 12) + '...' : g.title,
        progress: g.progress || 0,
        target: 100,
      }));
  }, [goals]);

  const financeData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const day = subDays(new Date(), 6 - i);
      const dateStr = format(day, 'yyyy-MM-dd');
      
      const dayIncome = transactions
        .filter(t => t.date === dateStr && t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const dayExpense = transactions
        .filter(t => t.date === dateStr && t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        day: format(day, 'EEE'),
        income: dayIncome,
        expense: dayExpense,
      };
    });

    return last7Days;
  }, [transactions]);

  const overallStats = useMemo(() => {
    const avgGoalProgress = goals.length > 0
      ? goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length
      : 0;

    const weekPrayers = weeklyPrayerData.reduce((sum, d) => sum + d.prayers, 0);
    const weekPrayerTarget = 35;

    const activeHabits = habits.filter(h => h.is_active);
    const avgStreak = activeHabits.length > 0
      ? activeHabits.reduce((sum, h) => sum + (h.streak_current || 0), 0) / activeHabits.length
      : 0;

    return {
      goalProgress: Math.round(avgGoalProgress),
      prayerScore: Math.round((weekPrayers / weekPrayerTarget) * 100),
      habitStreak: Math.round(avgStreak),
    };
  }, [goals, weeklyPrayerData, habits]);

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    fontSize: '12px',
  };

  return (
    <div className="bento-card">
      <div className="flex items-center gap-3 mb-5">
        <div className="icon-box-sm bg-primary/10">
          <TrendingUp className="h-4 w-4 text-primary" />
        </div>
        <h3 className="font-semibold">Progress Overview</h3>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-4 rounded-xl bg-gradient-to-br from-green-light to-primary/10 text-center">
          <Target className="h-5 w-5 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold tracking-tight text-primary">{overallStats.goalProgress}%</p>
          <p className="text-xs text-muted-foreground font-medium">Goals Avg</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 text-center">
          <Zap className="h-5 w-5 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold tracking-tight text-primary">{overallStats.prayerScore}%</p>
          <p className="text-xs text-muted-foreground font-medium">Prayer Week</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-gold-light to-gold/10 text-center">
          <BookOpen className="h-5 w-5 mx-auto mb-2 text-gold" />
          <p className="text-2xl font-bold tracking-tight text-gold">{overallStats.habitStreak}</p>
          <p className="text-xs text-muted-foreground font-medium">Avg Streak</p>
        </div>
      </div>

      <Tabs defaultValue="prayers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 h-10 p-1 bg-secondary/50 rounded-xl">
          <TabsTrigger value="prayers" className="text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Prayers</TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Tasks</TabsTrigger>
          <TabsTrigger value="goals" className="text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Goals</TabsTrigger>
          <TabsTrigger value="finance" className="text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Finance</TabsTrigger>
        </TabsList>

        <TabsContent value="prayers" className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyPrayerData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="prayers" fill="hsl(160, 84%, 39%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="tasks" className="h-48">
          {taskCompletionData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskCompletionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {taskCompletionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              No tasks yet
            </div>
          )}
        </TabsContent>

        <TabsContent value="goals" className="h-48">
          {goalProgressData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={goalProgressData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="progress" fill="hsl(38, 92%, 50%)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              No goals yet
            </div>
          )}
        </TabsContent>

        <TabsContent value="finance" className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={financeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="income" stroke="hsl(160, 84%, 39%)" fill="hsl(160, 84%, 39%)" fillOpacity={0.15} strokeWidth={2} />
              <Area type="monotone" dataKey="expense" stroke="hsl(0, 84%, 60%)" fill="hsl(0, 84%, 60%)" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </div>
  );
}
