import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { format, parseISO, isToday, isTomorrow, isPast, isFuture } from 'date-fns';
import {
  Plus, Check, Trash2, Calendar, Search,
  LayoutList, Kanban, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

type FilterType = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';
type ViewType = 'list' | 'kanban';

const PRIORITY_CONFIG: Record<string, { label: string; class: string }> = {
  urgent: { label: 'Urgent', class: 'badge-priority-urgent' },
  high: { label: 'High', class: 'badge-priority-high' },
  medium: { label: 'Medium', class: 'badge-priority-medium' },
  low: { label: 'Low', class: 'badge-priority-low' },
};

const STATUS_CONFIG: Record<string, { label: string }> = {
  todo: { label: 'To Do' },
  not_started: { label: 'To Do' },
  in_progress: { label: 'In Progress' },
  completed: { label: 'Done' },
  on_hold: { label: 'On Hold' },
  cancelled: { label: 'Cancelled' },
};

export default function Tasks() {
  const { tasks, createTask, updateTask, deleteTask: removeTask, projects } = useApp();
  const [filter, setFilter] = useState<FilterType>('all');
  const [view, setView] = useState<ViewType>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    due_date: format(new Date(), 'yyyy-MM-dd'),
    project_id: '',
  });

  const handleAddTask = async () => {
    if (!newTask.title?.trim()) return;

    await createTask({
      title: newTask.title,
      description: newTask.description,
      project_id: newTask.project_id || null,
      status: newTask.status || 'todo',
      priority: newTask.priority || 'medium',
      due_date: newTask.due_date,
    });

    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      due_date: format(new Date(), 'yyyy-MM-dd'),
      project_id: '',
    });
    setShowAddDialog(false);
  };

  const toggleTaskStatus = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    await updateTask({
      id,
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
    });
  };

  const deleteTask = async (id: string) => {
    await removeTask(id);
  };

  const updateTaskStatus = async (id: string, status: string) => {
    await updateTask({
      id,
      status,
      completed_at: status === 'completed' ? new Date().toISOString() : null,
    });
  };

  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(query) ||
        (t.description || '').toLowerCase().includes(query)
      );
    }

    // Apply filter
    const today = format(new Date(), 'yyyy-MM-dd');
    switch (filter) {
      case 'today':
        result = result.filter(t => t.due_date === today && t.status !== 'completed');
        break;
      case 'upcoming':
        result = result.filter(t => t.due_date && isFuture(parseISO(t.due_date)) && t.status !== 'completed');
        break;
      case 'overdue':
        result = result.filter(t => t.due_date && isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date)) && t.status !== 'completed');
        break;
      case 'completed':
        result = result.filter(t => t.status === 'completed');
        break;
    }

    // Sort
    return result.sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;

      const priorityOrder = ['urgent', 'high', 'medium', 'low'];
      const priorityDiff = priorityOrder.indexOf(a.priority || 'medium') - priorityOrder.indexOf(b.priority || 'medium');
      if (priorityDiff !== 0) return priorityDiff;

      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      return 0;
    });
  }, [tasks, filter, searchQuery]);

  const stats = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      today: tasks.filter(t => t.due_date === today && t.status !== 'completed').length,
      overdue: tasks.filter(t => t.due_date && isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date)) && t.status !== 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
    };
  }, [tasks]);

  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, typeof tasks> = {
      todo: [],
      not_started: [],
      in_progress: [],
      completed: [],
      on_hold: [],
      cancelled: [],
    };
    filteredTasks.forEach(task => {
      const status = task.status || 'todo';
      if (grouped[status]) {
        grouped[status].push(task);
      }
    });
    return grouped;
  }, [filteredTasks]);

  return (
    <div className="space-y-6 animate-fade-in app-3d-root">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Manage your daily tasks and to-dos</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input
                placeholder="Task title..."
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                className="text-lg"
                autoFocus
              />
              <Textarea
                placeholder="Description (optional)"
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(v) => setNewTask(prev => ({ ...prev, priority: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITY_CONFIG).map(([value, config]) => (
                        <SelectItem key={value} value={value}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {projects.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Project</label>
                    <Select
                      value={newTask.project_id || 'none'}
                      onValueChange={(v) => setNewTask(prev => ({ ...prev, project_id: v === 'none' ? '' : v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="No project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No project</SelectItem>
                        {projects.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button onClick={handleAddTask} disabled={!newTask.title?.trim()}>Create Task</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bento-card">
          <p className="text-sm font-medium text-muted-foreground mb-1">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bento-card">
          <p className="text-sm font-medium text-muted-foreground mb-1">Today</p>
          <p className="text-2xl font-bold text-primary">{stats.today}</p>
        </div>
        <div className="bento-card">
          <p className="text-sm font-medium text-muted-foreground mb-1">In Progress</p>
          <p className="text-2xl font-bold text-accent">{stats.inProgress}</p>
        </div>
        <div className="bento-card">
          <p className="text-sm font-medium text-muted-foreground mb-1">Overdue</p>
          <p className="text-2xl font-bold text-destructive">{stats.overdue}</p>
        </div>
        <div className="bento-card !bg-[#0B5B42] text-white">
          <p className="text-sm font-medium opacity-80 mb-1">Done</p>
          <p className="text-2xl font-bold">{stats.completed}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 dev-detached-tabs !p-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-none bg-transparent focus-visible:ring-0 h-11"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 dev-detached-tabs p-1">
            {(['all', 'today', 'upcoming', 'overdue', 'completed'] as FilterType[]).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter(f)}
                className={cn(
                  "capitalize",
                  filter === f ? "!bg-[#C5A059] text-white hover:bg-[#C5A059]/90" : "hover:bg-secondary/80"
                )}
              >
                {f}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
            <Button
              variant={view === 'list' ? "default" : "ghost"}
              size="icon"
              onClick={() => setView('list')}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'kanban' ? "default" : "ghost"}
              size="icon"
              onClick={() => setView('kanban')}
            >
              <Kanban className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Task List View */}
      {view === 'list' && (
        <div className="space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="bento-card text-center py-12">
              <p className="text-muted-foreground">No tasks found</p>
            </div>
          ) : (
            filteredTasks.map((task, index) => {
              const dueDate = task.due_date ? parseISO(task.due_date) : null;
              const isOverdue = dueDate && isPast(dueDate) && !isToday(dueDate) && task.status !== 'completed';
              const project = projects.find(p => p.id === task.project_id);

              return (
                <div
                  key={task.id}
                  className={cn(
                    "bento-card flex items-center gap-4 group",
                    task.status === 'completed' && "opacity-60"
                  )}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className={cn(
                      "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                      task.status === 'completed'
                        ? "bg-primary border-primary shadow-sm"
                        : "border-muted-foreground/40 hover:border-primary"
                    )}
                  >
                    {task.status === 'completed' && <Check className="h-3.5 w-3.5 text-white" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={cn(
                        "font-medium",
                        task.status === 'completed' && "line-through text-muted-foreground"
                      )}>
                        {task.title}
                      </p>
                      {project && (
                        <Badge variant="outline" className="text-xs">
                          {project.name}
                        </Badge>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground truncate">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-sm mt-1">
                      {dueDate && (
                        <span className={cn(
                          "flex items-center gap-1",
                          isOverdue ? "text-destructive font-medium" : "text-muted-foreground"
                        )}>
                          {isOverdue && <AlertCircle className="h-3 w-3" />}
                          <Calendar className="h-3 w-3" />
                          {isToday(dueDate) ? 'Today' : isTomorrow(dueDate) ? 'Tomorrow' : format(dueDate, 'MMM d')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-xs", PRIORITY_CONFIG[task.priority || 'medium']?.class)}>
                      {PRIORITY_CONFIG[task.priority || 'medium']?.label || 'Medium'}
                    </Badge>
                    <Select
                      value={task.status || 'todo'}
                      onValueChange={(v) => updateTaskStatus(task.id, v)}
                    >
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                          <SelectItem key={value} value={value}>{config.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Kanban View */}
      {view === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'todo', label: 'To Do' },
            { key: 'in_progress', label: 'In Progress' },
            { key: 'completed', label: 'Done' },
          ].map(column => (
            <div key={column.key} className="space-y-2">
              <div className="flex items-center justify-between p-2">
                <h3 className="font-medium">{column.label}</h3>
                <Badge variant="secondary">{tasksByStatus[column.key]?.length || 0}</Badge>
              </div>
              <div className="space-y-2 min-h-[200px] p-2 rounded-lg bg-secondary/30">
                {(tasksByStatus[column.key] || []).map(task => (
                  <div key={task.id} className="bento-card p-3">
                    <h4 className="font-medium text-sm mb-1">{task.title}</h4>
                    {task.due_date && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{format(parseISO(task.due_date), 'MMM d')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
