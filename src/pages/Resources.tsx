import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Resource } from '@/types';
import { format, parseISO } from 'date-fns';
import {
  Plus, BookOpen, Star, Trash2, Search, Filter, ExternalLink,
  FileText, Video, Headphones, GraduationCap, Wrench, Globe, Tag, Link, X, Edit2, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const RESOURCE_TYPES = [
  { value: 'article', label: 'Article', icon: FileText, color: 'bg-blue-500' },
  { value: 'video', label: 'Video', icon: Video, color: 'bg-red-500' },
  { value: 'podcast', label: 'Podcast', icon: Headphones, color: 'bg-purple-500' },
  { value: 'course', label: 'Course', icon: GraduationCap, color: 'bg-gold' },
  { value: 'tool', label: 'Tool', icon: Wrench, color: 'bg-primary' },
  { value: 'website', label: 'Website', icon: Globe, color: 'bg-[#0B5B42]' },
];

const STATUS_COLORS: Record<string, string> = {
  to_consume: 'bg-secondary text-secondary-foreground',
  in_progress: 'bg-gold text-foreground',
  completed: 'bg-primary text-primary-foreground',
};

export default function Resources() {
  const { resources, createResource, updateResource, deleteResource: removeResource, notes, ideas, areas } = useApp();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [draft, setDraft] = useState<{
    title: string;
    description: string;
    type: string;
    url: string;
    status: string;
    areaId: string;
    tags: string[];
  }>({ title: '', description: '', type: 'article', url: '', status: 'to_consume', areaId: '', tags: [] });
  const [tagInput, setTagInput] = useState('');

  const allTags = useMemo(() => {
    const set = new Set<string>();
    resources.forEach((r) => (r.tags || []).forEach((t) => set.add(t)));
    return Array.from(set);
  }, [resources]);

  const filteredResources = useMemo(() => {
    return resources
      .filter((r) => {
        if (showFavoritesOnly && !r.is_favorite) return false;
        if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterType !== 'all' && r.type !== filterType) return false;
        if (filterTag !== 'all' && !(r.tags || []).includes(filterTag)) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [resources, search, filterType, filterTag, showFavoritesOnly]);

  const resetDraft = () => setDraft({ title: '', description: '', type: 'article', url: '', status: 'to_consume', areaId: '', tags: [] });

  const handleAddResource = async () => {
    if (!draft.title.trim()) return;
    await createResource({
      title: draft.title.trim(),
      type: draft.type,
      url: draft.url || null,
      description: draft.description,
      status: draft.status,
      area_id: draft.areaId || null,
      tags: draft.tags,
      is_favorite: false,
    });
    resetDraft();
    setIsAddOpen(false);
  };

  const toggleFavorite = async (id: string) => {
    const resource = resources.find(r => r.id === id);
    if (!resource) return;
    await updateResource({ id, is_favorite: !resource.is_favorite });
  };
  const updateStatus = async (id: string, status: any) => await updateResource({ id, status });
  const deleteResource = async (id: string) => await removeResource(id);

  const addTag = () => { const t = tagInput.trim().toLowerCase(); if (t && !draft.tags.includes(t)) setDraft((p) => ({ ...p, tags: [...p.tags, t] })); setTagInput(''); };
  const removeTag = (t: string) => setDraft((p) => ({ ...p, tags: p.tags.filter((x) => x !== t) }));

  return (
    <div className="space-y-6 animate-fade-in app-3d-root">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Resources</h1>
          <p className="text-muted-foreground">Organize learning materials & tools</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Resource</Button></DialogTrigger>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add New Resource</DialogTitle></DialogHeader>
            <ResourceForm draft={draft} setDraft={setDraft} tagInput={tagInput} setTagInput={setTagInput} addTag={addTag} removeTag={removeTag} areas={areas.filter((a) => a.is_active)} onSubmit={handleAddResource} submitLabel="Add Resource" />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {RESOURCE_TYPES.map((t) => {
          const count = resources.filter((r) => r.type === t.value).length;
          return (
            <button
              key={t.value}
              className={cn(
                'bento-card text-center py-2 hover:ring-2 ring-primary/30 transition',
                filterType === t.value && 'ring-2 ring-primary',
                t.value === 'website' && '!bg-[#0B5B42] text-white'
              )}
              onClick={() => setFilterType((p) => (p === t.value ? 'all' : t.value))}
            >
              <t.icon className={cn("h-4 w-4 mx-auto mb-1", t.value === 'website' ? "text-white/80" : "text-muted-foreground")} />
              <p className="font-bold">{count}</p>
              <p className={cn("text-[10px]", t.value === 'website' ? "text-white/70" : "text-muted-foreground")}>{t.label}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px] dev-detached-tabs !p-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-none bg-transparent focus-visible:ring-0 h-11"
          />
        </div>
        {allTags.length > 0 && (
          <Select value={filterTag} onValueChange={setFilterTag}>
            <SelectTrigger className="w-32"><Tag className="h-4 w-4 mr-2" /><SelectValue placeholder="Tag" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Tags</SelectItem>{allTags.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent>
          </Select>
        )}
        <Button variant={showFavoritesOnly ? 'default' : 'outline'} size="sm" onClick={() => setShowFavoritesOnly((p) => !p)}><Star className={cn('h-4 w-4', showFavoritesOnly && 'fill-current')} /></Button>
      </div>

      {/* Resources List */}
      {filteredResources.length === 0 ? (
        <div className="bento-card text-center py-12"><BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /><p className="text-muted-foreground">No resources found.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((resource) => {
            const typeInfo = RESOURCE_TYPES.find((t) => t.value === resource.type);
            const Icon = typeInfo?.icon || BookOpen;

            return (
              <div key={resource.id} className="bento-card group flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={cn('text-white', typeInfo?.color)}><Icon className="h-3 w-3 mr-1" />{typeInfo?.label}</Badge>
                    <Badge className={STATUS_COLORS[resource.status || 'to_consume']}>{resource.status?.replace('_', ' ') || 'to consume'}</Badge>
                  </div>
                  <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleFavorite(resource.id)}><Star className={cn('h-3.5 w-3.5', resource.is_favorite && 'fill-gold text-gold')} /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteResource(resource.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>

                <h3 className="font-semibold mb-1 flex items-center gap-1">
                  {resource.title}
                  {resource.url && (<a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><ExternalLink className="h-3.5 w-3.5" /></a>)}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{resource.description}</p>

                {/* Tags */}
                {(resource.tags || []).length > 0 && (<div className="flex flex-wrap gap-1 mt-2">{(resource.tags || []).map((t) => (<Badge key={t} variant="outline" className="text-xs">{t}</Badge>))}</div>)}

                {/* Status quick toggle */}
                <div className="flex gap-1 mt-4">
                  {(['to_consume', 'in_progress', 'completed'] as const).map((st) => (<Button key={st} variant={resource.status === st ? 'default' : 'outline'} size="sm" className="flex-1 text-[10px] px-1" onClick={() => updateStatus(resource.id, st)}>{st === 'to_consume' ? 'To Do' : st === 'in_progress' ? 'Doing' : 'Done'}</Button>))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface ResourceFormProps {
  draft: { title: string; description: string; type: string; url: string; status: string; areaId: string; tags: string[] };
  setDraft: React.Dispatch<React.SetStateAction<ResourceFormProps['draft']>>;
  tagInput: string;
  setTagInput: (v: string) => void;
  addTag: () => void;
  removeTag: (t: string) => void;
  areas: { id: string; name: string }[];
  onSubmit: () => void;
  submitLabel: string;
}

function ResourceForm({ draft, setDraft, tagInput, setTagInput, addTag, removeTag, areas, onSubmit, submitLabel }: ResourceFormProps) {
  return (
    <div className="space-y-4 pt-4">
      <Input placeholder="Resource title" value={draft.title} onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))} />
      <Input placeholder="URL (optional)" value={draft.url} onChange={(e) => setDraft((p) => ({ ...p, url: e.target.value }))} />
      <Textarea placeholder="Description" value={draft.description} onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))} />
      <div className="grid grid-cols-2 gap-3">
        <Select value={draft.type} onValueChange={(v) => setDraft((p) => ({ ...p, type: v }))}>
          <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>{RESOURCE_TYPES.map((t) => (<SelectItem key={t.value} value={t.value}><div className="flex items-center gap-2"><t.icon className="h-4 w-4" />{t.label}</div></SelectItem>))}</SelectContent>
        </Select>
        <Select value={draft.status} onValueChange={(v) => setDraft((p) => ({ ...p, status: v }))}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent><SelectItem value="to_consume">To Consume</SelectItem><SelectItem value="in_progress">In Progress</SelectItem><SelectItem value="completed">Completed</SelectItem></SelectContent>
        </Select>
      </div>
      {areas.length > 0 && (
        <Select value={draft.areaId || 'none'} onValueChange={(v) => setDraft((p) => ({ ...p, areaId: v === 'none' ? '' : v }))}>
          <SelectTrigger><SelectValue placeholder="Link to Area" /></SelectTrigger>
          <SelectContent><SelectItem value="none">No area</SelectItem>{areas.map((a) => (<SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>))}</SelectContent>
        </Select>
      )}

      {/* Tags */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Tags</label>
        <div className="flex flex-wrap gap-1 mb-2">{(draft.tags || []).map((t) => (<Badge key={t} variant="outline" className="flex items-center gap-1">{t}<button onClick={() => removeTag(t)}><X className="h-3 w-3" /></button></Badge>))}</div>
        <div className="flex gap-2"><Input placeholder="Add tag" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} className="flex-1" /><Button type="button" variant="outline" size="sm" onClick={addTag}><Plus className="h-4 w-4" /></Button></div>
      </div>

      <Button onClick={onSubmit} className="w-full" disabled={!draft.title.trim()}>{submitLabel}</Button>
    </div>
  );
}
