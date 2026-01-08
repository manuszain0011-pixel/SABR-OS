import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { format, parseISO, isPast, differenceInDays, addDays } from 'date-fns';
import {
  Plus, Target, Calendar, Trash2, Check, X,
  TrendingUp, Clock, MoreVertical, Archive, RotateCcw,
  AlertTriangle, Zap, BarChart3, Heart, Sparkles, Leaf
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const GOAL_TYPES = [
  { value: 'short_term', label: 'Short Term', color: 'bg-blue-500' },
  { value: 'medium_term', label: 'Medium Term', color: 'bg-gold' },
  { value: 'long_term', label: 'Long Term', color: 'bg-primary' },
];

const PRIORITY_CONFIG: Record<string, { label: string; icon: typeof AlertTriangle }> = {
  urgent: { label: 'Urgent', icon: AlertTriangle },
  high: { label: 'High', icon: Zap },
  medium: { label: 'Medium', icon: Target },
  low: { label: 'Low', icon: Clock },
};

export default function Goals() {
  const { goals, createGoal, updateGoal, deleteGoal: removeGoal, projects, tasks, areas } = useApp();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());

  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    area_id: '',
    target_date: format(addDays(new Date(), 90), 'yyyy-MM-dd'),
    niyyah: '',
    barakah_score: 0,
    attached_dua: '',
    is_sadaqah_jariyah: false,
  });

  const filteredGoals = useMemo(() => {
    return goals.filter(g => {
      if (filter === 'active') return g.status !== 'completed';
      if (filter === 'completed') return g.status === 'completed';
      return true;
    }).sort((a, b) => {
      const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
      const aPriority = priorityOrder[a.priority || 'medium'] ?? 2;
      const bPriority = priorityOrder[b.priority || 'medium'] ?? 2;
      if (aPriority !== bPriority) return aPriority - bPriority;
      if (a.target_date && b.target_date) {
        return new Date(a.target_date).getTime() - new Date(b.target_date).getTime();
      }
      return 0;
    });
  }, [goals, filter]);

  const stats = useMemo(() => {
    const activeGoals = goals.filter(g => g.status !== 'completed');
    const completed = goals.filter(g => g.status === 'completed');
    const overdue = activeGoals.filter(g => g.target_date && isPast(parseISO(g.target_date)));
    const avgProgress = activeGoals.length > 0
      ? Math.round(activeGoals.reduce((sum, g) => sum + (g.progress || 0), 0) / activeGoals.length)
      : 0;

    return {
      total: goals.length,
      active: activeGoals.length,
      completed: completed.length,
      overdue: overdue.length,
      avgProgress,
    };
  }, [goals]);

  const handleSaveGoal = async () => {
    if (!goalForm.title.trim()) return;

    await createGoal({
      title: goalForm.title,
      description: goalForm.description,
      area_id: goalForm.area_id || null,
      status: 'not_started',
      priority: goalForm.priority,
      target_date: goalForm.target_date,
      progress: 0,
      niyyah: goalForm.niyyah,
      barakah_score: goalForm.barakah_score,
      attached_dua: goalForm.attached_dua,
      is_sadaqah_jariyah: goalForm.is_sadaqah_jariyah,
    } as any);

    setGoalForm({
      title: '',
      description: '',
      priority: 'medium',
      area_id: '',
      target_date: format(addDays(new Date(), 90), 'yyyy-MM-dd'),
      niyyah: '',
      barakah_score: 0,
      attached_dua: '',
      is_sadaqah_jariyah: false,
    });
    setIsAddOpen(false);
  };

  const handleUpdateProgress = async (goalId: string, progress: number) => {
    const status = progress >= 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started';
    await updateGoal({ id: goalId, progress, status });
  };

  const handleDeleteGoal = async (id: string) => {
    await removeGoal(id);
  };

  const toggleExpand = (goalId: string) => {
    setExpandedGoals(prev => {
      const next = new Set(prev);
      if (next.has(goalId)) next.delete(goalId);
      else next.add(goalId);
      return next;
    });
  };

  const getDaysRemaining = (targetDate: string) => {
    return differenceInDays(parseISO(targetDate), new Date());
  };

  return (
    <div className="space-y-6 animate-fade-in app-3d-root">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Goals</h1>
          <p className="text-muted-foreground">Define and track your objectives</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Goal title"
                value={goalForm.title}
                onChange={(e) => setGoalForm(prev => ({ ...prev, title: e.target.value }))}
              />
              <Textarea
                placeholder="Description - Why is this goal important?"
                value={goalForm.description}
                onChange={(e) => setGoalForm(prev => ({ ...prev, description: e.target.value }))}
              />

              {/* Niyyah Field - Enhanced */}
              <div className="space-y-2 border-l-2 border-gold/50 pl-4 py-1 bg-gold/5 rounded-r-lg">
                <label className="text-sm font-medium flex items-center gap-2 text-gold">
                  <Heart className="h-4 w-4" />
                  Niyyah (Intention)
                </label>
                <Textarea
                  placeholder="I aim to achieve this for the sake of Allah by..."
                  value={goalForm.niyyah}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, niyyah: e.target.value }))}
                  className="border-gold/20 focus:border-gold h-20 resize-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Select value={goalForm.priority} onValueChange={(v) => setGoalForm(prev => ({ ...prev, priority: v }))}>
                  <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <config.icon className="h-3 w-3" />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={goalForm.target_date}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, target_date: e.target.value }))}
                />
              </div>

              {/* Additional Islamic Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Barakah Score</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(score => (
                      <button
                        key={score}
                        onClick={() => setGoalForm(prev => ({ ...prev, barakah_score: score }))}
                        className={cn(
                          "h-8 w-8 rounded-full border transition-all flex items-center justify-center text-xs",
                          goalForm.barakah_score >= score
                            ? "bg-gold border-gold text-white"
                            : "border-border hover:border-gold/50"
                        )}
                      >
                        <Sparkles className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Attached Dua</label>
                  <Select value={goalForm.attached_dua} onValueChange={(v) => setGoalForm(prev => ({ ...prev, attached_dua: v }))}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select Dua" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rabbi_ishrah">Rabbi Ishrah</SelectItem>
                      <SelectItem value="rabbana_taqabbal">Rabbana Taqabbal</SelectItem>
                      <SelectItem value="rabbi_zidni">Rabbi Zidni Ilma</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {areas.length > 0 && (
                <Select value={goalForm.area_id || 'none'} onValueChange={(v) => setGoalForm(prev => ({ ...prev, area_id: v === 'none' ? '' : v }))}>
                  <SelectTrigger><SelectValue placeholder="Link to Area (optional)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No area</SelectItem>
                    {areas.filter(a => a.is_active).map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="sadaqah"
                  checked={goalForm.is_sadaqah_jariyah}
                  onCheckedChange={(c) => setGoalForm(prev => ({ ...prev, is_sadaqah_jariyah: !!c }))}
                />
                <label
                  htmlFor="sadaqah"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1 cursor-pointer"
                >
                  <Leaf className="h-3 w-3 text-green-500" />
                  Is Sadaqah Jariyah?
                </label>
              </div>

              <Button onClick={handleSaveGoal} className="w-full" disabled={!goalForm.title.trim()}>
                Create Goal With Intention
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bento-card">
          <p className="text-sm font-medium text-muted-foreground mb-1">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bento-card">
          <p className="text-sm font-medium text-muted-foreground mb-1">Active</p>
          <p className="text-2xl font-bold text-primary">{stats.active}</p>
        </div>
        <div className="bento-card">
          <p className="text-sm font-medium text-muted-foreground mb-1">Completed</p>
          <p className="text-2xl font-bold text-success">{stats.completed}</p>
        </div>
        <div className="bento-card">
          <p className="text-sm font-medium text-muted-foreground mb-1">Overdue</p>
          <p className="text-2xl font-bold text-destructive">{stats.overdue}</p>
        </div>
        <div className="bento-card gradient-green text-primary-foreground">
          <p className="text-sm font-medium opacity-90 mb-1">Avg Progress</p>
          <p className="text-2xl font-bold">{stats.avgProgress}%</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4 space-y-3">
          {filteredGoals.length === 0 ? (
            <div className="bento-card text-center py-12">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No goals found. Create your first goal!</p>
            </div>
          ) : (
            filteredGoals.map((goal) => {
              const priorityInfo = PRIORITY_CONFIG[goal.priority || 'medium'];
              const isOverdue = goal.target_date && isPast(parseISO(goal.target_date)) && goal.status !== 'completed';
              const daysRemaining = goal.target_date ? getDaysRemaining(goal.target_date) : 0;
              const isExpanded = expandedGoals.has(goal.id);
              const area = goal.area_id ? areas.find(a => a.id === goal.area_id) : null;

              return (
                <Collapsible key={goal.id} open={isExpanded} onOpenChange={() => toggleExpand(goal.id)}>
                  <div className={cn(
                    "bento-card transition-all",
                    goal.status === 'completed' && "opacity-70",
                    isOverdue && "border-destructive/30"
                  )}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Badges */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant="outline" className={cn(
                            goal.priority === 'urgent' && "border-destructive text-destructive",
                            goal.priority === 'high' && "border-gold text-gold",
                          )}>
                            {priorityInfo?.label || 'Medium'}
                          </Badge>
                          {area && (
                            <Badge variant="secondary">{area.name}</Badge>
                          )}
                          {isOverdue && (
                            <Badge variant="destructive">Overdue</Badge>
                          )}
                        </div>

                        <h3 className={cn(
                          "text-lg font-bold",
                          goal.status === 'completed' && "line-through text-muted-foreground"
                        )}>{goal.title}</h3>

                        {goal.description && (
                          <p className="text-sm font-medium text-muted-foreground/80 mb-4 line-clamp-2 leading-relaxed">{goal.description}</p>
                        )}

                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground font-medium">Progress</span>
                            <span className="font-semibold">{goal.progress || 0}%</span>
                          </div>
                          <Progress value={goal.progress || 0} className="h-2" />
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {goal.target_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{daysRemaining > 0 ? `${daysRemaining} days left` : 'Due: ' + format(parseISO(goal.target_date), 'MMM d')}</span>
                            </div>
                          )}
                          {(goal as any).niyyah && (
                            <div className="flex items-center gap-1 text-gold" title="Has Intention">
                              <Heart className="h-3 w-3 fill-gold" />
                              <span className="hidden sm:inline line-clamp-1 max-w-[100px]">{(goal as any).niyyah}</span>
                            </div>
                          )}
                          {(goal as any).is_sadaqah_jariyah && (
                            <div className="flex items-center gap-1 text-green-600" title="Sadaqah Jariyah">
                              <Leaf className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleUpdateProgress(goal.id, 100)}>
                            <Check className="h-4 w-4 mr-2" /> Mark Complete
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteGoal(goal.id)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Collapsible>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
