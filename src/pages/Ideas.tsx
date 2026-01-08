import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Idea } from '@/types';
import { format, parseISO } from 'date-fns';
import {
  Plus, Lightbulb, Star, Trash2, Search, Filter,
  Quote, HelpCircle, Eye, Sparkles, MessageSquare, Link, Tag, Edit2, X, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CATEGORIES = [
  { value: 'thought', label: 'Thought', icon: Lightbulb, color: 'bg-blue-500' },
  { value: 'inspiration', label: 'Inspiration', icon: Sparkles, color: 'bg-gold' },
  { value: 'quote', label: 'Quote', icon: Quote, color: 'bg-purple-500' },
  { value: 'question', label: 'Question', icon: HelpCircle, color: 'bg-orange-500' },
  { value: 'observation', label: 'Observation', icon: Eye, color: 'bg-[#0B5B42]' },
];

export default function Ideas() {
  const { ideas, createIdea, updateIdea, deleteIdea: removeIdea, goals, projects, notes, resources } = useApp();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [draft, setDraft] = useState({
    title: '',
    content: '',
    category: 'thought' as Idea['category'],
    source: '',
    tags: [] as string[],
    linkedGoals: [] as string[],
    linkedProjects: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');

  const allTags = useMemo(() => {
    const set = new Set<string>();
    (ideas as any[]).forEach((i) => (i.tags || []).forEach((t: string) => set.add(t)));
    return Array.from(set);
  }, [ideas]);

  const filteredIdeas = useMemo(() => {
    return (ideas as any[])
      .filter((i) => {
        if (i.status === 'archived') return false;
        if (showFavoritesOnly && i.priority !== 'high') return false;
        if (search && !i.title.toLowerCase().includes(search.toLowerCase()) && !(i.description || '').toLowerCase().includes(search.toLowerCase())) return false;
        if (filterCategory !== 'all' && i.status !== filterCategory) return false;
        if (filterTag !== 'all' && !(i.tags || []).includes(filterTag)) return false;
        return true;
      })
      .sort((a, b) => {
        if ((a.priority === 'high') !== (b.priority === 'high')) return a.priority === 'high' ? -1 : 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [ideas, search, filterCategory, filterTag, showFavoritesOnly]);

  const resetDraft = () => setDraft({ title: '', content: '', category: 'thought', source: '', tags: [], linkedGoals: [], linkedProjects: [] });

  const handleAddIdea = async () => {
    if (!draft.title.trim()) return;
    await createIdea({
      title: draft.title.trim(),
      description: draft.content,
      status: draft.category || 'thought',
      tags: draft.tags,
      priority: 'low',
    });
    resetDraft();
    setIsAddOpen(false);
  };

  const openEdit = (idea: any) => {
    setEditId(idea.id);
    setDraft({
      title: idea.title,
      content: idea.description || '',
      category: (idea.status as any) || 'thought',
      source: '',
      tags: idea.tags || [],
      linkedGoals: [],
      linkedProjects: [],
    });
  };

  const saveEdit = async () => {
    if (!editId) return;
    await updateIdea({
      id: editId,
      title: draft.title,
      description: draft.content,
      status: draft.category,
      tags: draft.tags,
    });
    setEditId(null);
    resetDraft();
  };

  const cancelEdit = () => {
    setEditId(null);
    resetDraft();
  };

  const toggleFavorite = async (id: string) => {
    const idea = ideas.find(i => i.id === id);
    if (!idea) return;
    await updateIdea({ id, priority: idea.priority === 'high' ? 'low' : 'high' });
  };
  const deleteIdea = async (id: string) => await removeIdea(id);
  const archiveIdea = async (id: string) => await updateIdea({ id, status: 'archived' });

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !draft.tags.includes(t)) setDraft((p) => ({ ...p, tags: [...p.tags, t] }));
    setTagInput('');
  };
  const removeTag = (t: string) => setDraft((p) => ({ ...p, tags: p.tags.filter((x) => x !== t) }));

  const getGoalTitle = (id: string) => (goals as any[]).find((g) => g.id === id)?.title || 'Unknown Goal';
  const getProjectTitle = (id: string) => (projects as any[]).find((p) => p.id === id)?.name || 'Unknown Project';

  // Backlinks: find notes/resources that link to this idea
  const getBacklinks = (ideaId: string) => {
    const linkedNotes = notes.filter((n) => (n as any).linkedIdeas?.includes(ideaId));
    const linkedResources = resources.filter((r) => (r as any).linkedIdeas?.includes(ideaId));
    return { linkedNotes, linkedResources };
  };

  return (
    <div className="space-y-6 animate-fade-in app-3d-root">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ideas Hub</h1>
          <p className="text-muted-foreground">Capture, tag & link your thoughts</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Idea</Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Capture New Idea</DialogTitle></DialogHeader>
            <IdeaForm draft={draft} setDraft={setDraft} tagInput={tagInput} setTagInput={setTagInput} addTag={addTag} removeTag={removeTag} goals={goals as any[]} projects={projects as any[]} onSubmit={handleAddIdea} submitLabel="Save Idea" />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {CATEGORIES.map((c) => {
          const count = (ideas as any[]).filter((i) => i.status !== 'archived' && i.status === c.value).length;
          return (
            <button
              key={c.value}
              className={cn(
                'bento-card text-center hover:ring-2 ring-primary/30 transition',
                filterCategory === c.value && 'ring-2 ring-primary',
                c.value === 'observation' && '!bg-[#0B5B42] text-white'
              )}
              onClick={() => setFilterCategory((p) => (p === c.value ? 'all' : c.value))}
            >
              <c.icon className={cn("h-5 w-5 mx-auto mb-1", c.value === 'observation' ? "text-white/80" : "text-muted-foreground")} />
              <p className="text-xl font-bold">{count}</p>
              <p className={cn("text-[10px]", c.value === 'observation' ? "text-white/70" : "text-muted-foreground")}>{c.label}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search ideas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        {allTags.length > 0 && (
          <Select value={filterTag} onValueChange={setFilterTag}>
            <SelectTrigger className="w-36"><Tag className="h-4 w-4 mr-2" /><SelectValue placeholder="Tag" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {allTags.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
            </SelectContent>
          </Select>
        )}
        <Button variant={showFavoritesOnly ? 'default' : 'outline'} size="sm" onClick={() => setShowFavoritesOnly((p) => !p)}>
          <Star className={cn('h-4 w-4', showFavoritesOnly && 'fill-current')} />
        </Button>
      </div>

      {/* Ideas Grid */}
      {filteredIdeas.length === 0 ? (
        <div className="bento-card text-center py-12">
          <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No ideas found. Capture your first idea!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIdeas.map((idea: any) => {
            const cat = CATEGORIES.find((c) => c.value === idea.status);
            const Icon = cat?.icon || Lightbulb;
            const isEditing = editId === idea.id;
            const backlinks = getBacklinks(idea.id);

            if (isEditing) {
              return (
                <div key={idea.id} className="bento-card space-y-3">
                  <IdeaForm draft={draft} setDraft={setDraft} tagInput={tagInput} setTagInput={setTagInput} addTag={addTag} removeTag={removeTag} goals={goals as any[]} projects={projects as any[]} onSubmit={saveEdit} submitLabel="Save" onCancel={cancelEdit} compact />
                </div>
              );
            }

            return (
              <div key={idea.id} className="bento-card group flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <Badge className={cn('text-white', cat?.color)}><Icon className="h-3 w-3 mr-1" />{cat?.label}</Badge>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(idea)}><Edit2 className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleFavorite(idea.id)}><Star className={cn('h-3.5 w-3.5', (idea as any).priority === 'high' && 'fill-gold text-gold')} /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteIdea(idea.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                <h3 className="font-semibold mb-1">{idea.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{idea.description}</p>

                {/* Tags */}
                {(idea.tags || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {idea.tags.map((t: string) => (<Badge key={t} variant="outline" className="text-xs">{t}</Badge>))}
                  </div>
                )}

                {/* Linked goals / projects */}
                {((idea.linkedGoals || []).length > 0 || (idea.linkedProjects || []).length > 0) && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {idea.linkedGoals.map((gid: string) => (<Badge key={gid} className="bg-primary/10 text-primary text-[10px]">Goal: {getGoalTitle(gid)}</Badge>))}
                    {idea.linkedProjects.map((pid: string) => (<Badge key={pid} className="bg-gold/20 text-gold text-[10px]">Project: {getProjectTitle(pid)}</Badge>))}
                  </div>
                )}

                {/* Backlinks */}
                {(backlinks.linkedNotes.length > 0 || backlinks.linkedResources.length > 0) && (
                  <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                    <Link className="h-3 w-3" />
                    {backlinks.linkedNotes.length > 0 && <span>{backlinks.linkedNotes.length} notes</span>}
                    {backlinks.linkedResources.length > 0 && <span>{backlinks.linkedResources.length} resources</span>}
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-2">{format(parseISO(idea.created_at), 'MMM d, yyyy')}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface IdeaFormProps {
  draft: { title: string; content: string; category: Idea['category']; source: string; tags: string[]; linkedGoals: string[]; linkedProjects: string[] };
  setDraft: React.Dispatch<React.SetStateAction<IdeaFormProps['draft']>>;
  tagInput: string;
  setTagInput: (v: string) => void;
  addTag: () => void;
  removeTag: (t: string) => void;
  goals: any[];
  projects: any[];
  onSubmit: () => void;
  submitLabel: string;
  onCancel?: () => void;
  compact?: boolean;
}

function IdeaForm({ draft, setDraft, tagInput, setTagInput, addTag, removeTag, goals, projects, onSubmit, submitLabel, onCancel, compact }: IdeaFormProps) {
  return (
    <div className={cn('space-y-4', compact && 'space-y-3')}>
      <Input placeholder="Idea title" value={draft.title} onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))} />
      <Textarea placeholder="Describe your idea..." value={draft.content} onChange={(e) => setDraft((p) => ({ ...p, content: e.target.value }))} className={cn('min-h-24', compact && 'min-h-16')} />
      <Select value={draft.category} onValueChange={(v) => setDraft((p) => ({ ...p, category: v as Idea['category'] }))}>
        <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
        <SelectContent>{CATEGORIES.map((c) => (<SelectItem key={c.value} value={c.value}><div className="flex items-center gap-2"><c.icon className="h-4 w-4" />{c.label}</div></SelectItem>))}</SelectContent>
      </Select>
      <Input placeholder="Source (optional)" value={draft.source} onChange={(e) => setDraft((p) => ({ ...p, source: e.target.value }))} />

      {/* Tags */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Tags</label>
        <div className="flex gap-2 flex-wrap mb-2">
          {draft.tags.map((t) => (<Badge key={t} variant="outline" className="flex items-center gap-1">{t}<button onClick={() => removeTag(t)}><X className="h-3 w-3" /></button></Badge>))}
        </div>
        <div className="flex gap-2">
          <Input placeholder="Add tag" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} className="flex-1" />
          <Button type="button" variant="outline" size="sm" onClick={addTag}><Plus className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Link to Goals */}
      {goals.filter((g) => !g.isArchived).length > 0 && (
        <Select value="select" onValueChange={(v) => { if (v !== 'select' && !draft.linkedGoals.includes(v)) setDraft((p) => ({ ...p, linkedGoals: [...p.linkedGoals, v] })); }}>
          <SelectTrigger><SelectValue placeholder="Link to Goal" /></SelectTrigger>
          <SelectContent><SelectItem value="select" disabled>Select a goal...</SelectItem>{goals.filter((g) => !g.isArchived && !draft.linkedGoals.includes(g.id)).map((g) => (<SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>))}</SelectContent>
        </Select>
      )}
      {draft.linkedGoals.length > 0 && (
        <div className="flex flex-wrap gap-1">{draft.linkedGoals.map((gid) => (<Badge key={gid} className="bg-primary/10 text-primary text-xs flex items-center gap-1">{goals.find((g) => g.id === gid)?.title}<button onClick={() => setDraft((p) => ({ ...p, linkedGoals: p.linkedGoals.filter((x) => x !== gid) }))}><X className="h-3 w-3" /></button></Badge>))}</div>
      )}

      {/* Link to Projects */}
      {projects.filter((p) => !p.status?.includes('archived')).length > 0 && (
        <Select value="select" onValueChange={(v) => { if (v !== 'select' && !draft.linkedProjects.includes(v)) setDraft((p) => ({ ...p, linkedProjects: [...p.linkedProjects, v] })); }}>
          <SelectTrigger><SelectValue placeholder="Link to Project" /></SelectTrigger>
          <SelectContent><SelectItem value="select" disabled>Select a project...</SelectItem>{projects.filter((p) => !p.status?.includes('archived') && !draft.linkedProjects.includes(p.id)).map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent>
        </Select>
      )}
      {draft.linkedProjects.length > 0 && (
        <div className="flex flex-wrap gap-1">{draft.linkedProjects.map((pid) => (<Badge key={pid} className="bg-gold/20 text-gold text-xs flex items-center gap-1">{projects.find((p) => p.id === pid)?.name}<button onClick={() => setDraft((p) => ({ ...p, linkedProjects: p.linkedProjects.filter((x) => x !== pid) }))}><X className="h-3 w-3" /></button></Badge>))}</div>
      )}

      <div className="flex gap-2">
        {onCancel && <Button variant="ghost" onClick={onCancel}>Cancel</Button>}
        <Button onClick={onSubmit} className="flex-1" disabled={!draft.title.trim()}>{submitLabel}</Button>
      </div>
    </div>
  );
}
