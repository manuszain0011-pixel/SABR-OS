import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { format, parseISO, isPast } from 'date-fns';
import {
  Plus, FolderKanban, Calendar, Trash2, Check,
  MoreVertical, Clock, Target, CheckSquare, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const STATUS_COLORS: Record<string, string> = {
  not_started: 'bg-secondary text-secondary-foreground',
  planning: 'bg-secondary text-secondary-foreground',
  active: 'bg-gold text-foreground',
  in_progress: 'bg-gold text-foreground',
  completed: 'bg-primary text-primary-foreground',
  on_hold: 'bg-orange-500 text-white',
  cancelled: 'bg-destructive text-destructive-foreground',
};

export default function Projects() {
  const { projects, createProject, updateProject, deleteProject: removeProject, tasks, goals } = useApp();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    priority: 'medium',
    end_date: format(new Date(), 'yyyy-MM-dd'),
    goal_id: '',
  });

  const stats = useMemo(() => {
    const active = projects.filter(p => p.status !== 'completed' && p.status !== 'cancelled');
    const completed = projects.filter(p => p.status === 'completed');
    return { total: projects.length, active: active.length, completed: completed.length };
  }, [projects]);

  const projectsByStatus = useMemo(() => {
    const statuses = ['not_started', 'active', 'on_hold', 'completed'] as const;
    return statuses.map(status => ({
      status,
      projects: projects.filter(p => {
        if (status === 'active') return p.status === 'active' || p.status === 'in_progress';
        return p.status === status;
      }),
    }));
  }, [projects]);

  const handleAddProject = async () => {
    if (!newProject.name.trim()) return;

    await createProject({
      name: newProject.name,
      description: newProject.description,
      goal_id: newProject.goal_id || null,
      status: 'active',
      priority: newProject.priority,
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: newProject.end_date,
      progress: 0,
    });

    setNewProject({ name: '', description: '', priority: 'medium', end_date: format(new Date(), 'yyyy-MM-dd'), goal_id: '' });
    setIsAddOpen(false);
  };

  const handleUpdateStatus = async (projectId: string, status: string) => {
    const progress = status === 'completed' ? 100 : undefined;
    await updateProject({ id: projectId, status, ...(progress !== undefined && { progress }) });
  };

  const handleDeleteProject = async (id: string) => {
    await removeProject(id);
  };

  const getProjectTasks = (projectId: string) => {
    return tasks.filter(t => t.project_id === projectId);
  };

  const renderProjectCard = (project: typeof projects[0]) => {
    const projectTasks = getProjectTasks(project.id);
    const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
    const goal = project.goal_id ? goals.find(g => g.id === project.goal_id) : null;
    const isOverdue = project.end_date && isPast(parseISO(project.end_date)) && project.status !== 'completed';

    return (
      <div key={project.id} className={cn(
        "bento-card transition-all",
        project.status === 'completed' && "opacity-70"
      )}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={STATUS_COLORS[project.status || 'active']}>
                {(project.status || 'active').replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className={cn(
                project.priority === 'urgent' && "border-destructive text-destructive",
                project.priority === 'high' && "border-gold text-gold",
              )}>
                {project.priority}
              </Badge>
              {isOverdue && <Badge variant="destructive">Overdue</Badge>}
            </div>
            <h3 className={cn(
              "text-lg font-semibold mb-1",
              project.status === 'completed' && "line-through"
            )}>{project.name}</h3>
            {project.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
            )}

            {/* Progress */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Tasks</span>
                <span className="font-medium">{completedTasks}/{projectTasks.length}</span>
              </div>
              <Progress
                value={projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0}
                className="h-2"
              />
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {project.end_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Due: {format(parseISO(project.end_date), 'MMM d')}</span>
                </div>
              )}
              {goal && (
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  <span>{goal.title}</span>
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
              <DropdownMenuItem onClick={() => handleUpdateStatus(project.id, 'active')}>
                <Clock className="h-4 w-4 mr-2" /> Start
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUpdateStatus(project.id, 'completed')}>
                <Check className="h-4 w-4 mr-2" /> Complete
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUpdateStatus(project.id, 'on_hold')}>
                <Clock className="h-4 w-4 mr-2" /> Hold
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteProject(project.id)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in app-3d-root">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage your projects and initiatives</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border p-1">
            <Button variant={view === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setView('list')}>
              <Layers className="h-4 w-4" />
            </Button>
            <Button variant={view === 'kanban' ? 'default' : 'ghost'} size="sm" onClick={() => setView('kanban')}>
              <FolderKanban className="h-4 w-4" />
            </Button>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Project</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Project name"
                  value={newProject.name}
                  onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Select value={newProject.priority} onValueChange={(v) => setNewProject(prev => ({ ...prev, priority: v }))}>
                    <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    value={newProject.end_date}
                    onChange={(e) => setNewProject(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
                {goals.length > 0 && (
                  <Select value={newProject.goal_id || 'none'} onValueChange={(v) => setNewProject(prev => ({ ...prev, goal_id: v === 'none' ? '' : v }))}>
                    <SelectTrigger><SelectValue placeholder="Link to goal (optional)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No goal</SelectItem>
                      {goals.map(g => (
                        <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Button onClick={handleAddProject} className="w-full" disabled={!newProject.name.trim()}>
                  Create Project
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bento-card">
          <p className="text-sm font-medium text-muted-foreground mb-1">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bento-card">
          <p className="text-sm font-medium text-muted-foreground mb-1">Active</p>
          <p className="text-2xl font-bold text-gold">{stats.active}</p>
        </div>
        <div className="bento-card !bg-primary text-primary-foreground border-none shadow-md">
          <p className="text-sm font-medium opacity-80 mb-1">Completed</p>
          <p className="text-2xl font-bold">{stats.completed}</p>
        </div>
      </div>

      {/* View */}
      {view === 'list' ? (
        <div className="space-y-3">
          {projects.length === 0 ? (
            <div className="bento-card text-center py-12">
              <FolderKanban className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No projects yet. Create your first project!</p>
            </div>
          ) : (
            projects.map(renderProjectCard)
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {projectsByStatus.map(({ status, projects: statusProjects }) => (
            <div key={status} className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className={STATUS_COLORS[status]}>{status.replace('_', ' ')}</Badge>
                <span className="text-sm text-muted-foreground">{statusProjects.length}</span>
              </div>
              <div className="space-y-2 min-h-[200px] p-2 rounded-lg bg-secondary/30">
                {statusProjects.map(p => (
                  <div key={p.id} className="bento-card p-3">
                    <h4 className="font-medium text-sm mb-1">{p.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckSquare className="h-3 w-3" />
                      <span>{getProjectTasks(p.id).filter(t => t.status === 'completed').length}/{getProjectTasks(p.id).length}</span>
                    </div>
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
