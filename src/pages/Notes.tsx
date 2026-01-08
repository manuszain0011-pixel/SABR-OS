import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Note } from '@/types';
import { format, parseISO } from 'date-fns';
import {
  Plus, FileText, Star, Trash2, Search, Filter,
  BookOpen, Users, FlaskConical, Lightbulb, File, Tag, Link, Edit2, X, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const NOTE_TYPES = [
  { value: 'note', label: 'Note', icon: FileText, color: 'bg-blue-500' },
  { value: 'meeting', label: 'Meeting', icon: Users, color: 'bg-gold' },
  { value: 'research', label: 'Research', icon: FlaskConical, color: 'bg-purple-500' },
  { value: 'reflection', label: 'Reflection', icon: Lightbulb, color: 'bg-[#0B5B42]' },
  { value: 'template', label: 'Template', icon: File, color: 'bg-teal-500' },
];

export default function Notes() {
  const { notes, createNote, updateNote, deleteNote: removeNote, projects, resources, ideas, tasks, goals } = useApp();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [draft, setDraft] = useState<{
    title: string;
    content: string;
    type: Note['type'];
    projectId: string;
    tags: string[];
    linkedResources: string[];
    linkedTasks: string[];
  }>({ title: '', content: '', type: 'note', projectId: '', tags: [], linkedResources: [], linkedTasks: [] });
  const [tagInput, setTagInput] = useState('');

  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => (n.tags || []).forEach((t) => set.add(t)));
    return Array.from(set);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return (notes as any[])
      .filter((n) => {
        if (n.is_archived) return false;
        if (showFavoritesOnly && !n.is_pinned) return false;
        if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !(n.content || '').toLowerCase().includes(search.toLowerCase())) return false;
        if (filterType !== 'all' && n.type !== filterType) return false;
        if (filterTag !== 'all' && !(n.tags || []).includes(filterTag)) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
  }, [notes, search, filterType, filterTag, showFavoritesOnly]);

  const resetDraft = () => setDraft({ title: '', content: '', type: 'note', projectId: '', tags: [], linkedResources: [], linkedTasks: [] });

  const handleAddNote = async () => {
    if (!draft.title.trim()) return;
    await createNote({
      title: draft.title.trim(),
      content: draft.content,
      type: draft.type,
      project_id: draft.projectId || null,
      tags: draft.tags,
      is_archived: false,
      is_pinned: false,
    } as any);
    resetDraft();
    setIsAddOpen(false);
  };

  const toggleFavorite = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    await updateNote({ id, is_pinned: !note.is_pinned });
  };
  const deleteNote = async (id: string) => {
    await removeNote(id);
    if (selectedNote?.id === id) setSelectedNote(null);
  };
  const updateNoteContent = async (id: string, content: string) => {
    await updateNote({ id, content });
  };

  const addTag = () => { const t = tagInput.trim().toLowerCase(); if (t && !draft.tags.includes(t)) setDraft((p) => ({ ...p, tags: [...p.tags, t] })); setTagInput(''); };
  const removeTag = (t: string) => setDraft((p) => ({ ...p, tags: p.tags.filter((x) => x !== t) }));

  const getProjectTitle = (id?: string) => (projects as any[]).find((p) => p.id === id)?.name || 'Unknown';
  const getResourceTitle = (id: string) => resources.find((r) => r.id === id)?.title || 'Unknown';
  const getTaskTitle = (id: string) => tasks.find((t) => t.id === id)?.title || 'Unknown';

  // Backlinks: Ideas that link to this note (simple scan) + Resources that link to this note
  const getBacklinks = (noteId: string) => {
    const linkedIdeas = ideas.filter((i) => (i as any).linkedNotes?.includes(noteId));
    const linkedRes = resources.filter((r) => (r as any).linkedNotes?.includes(noteId));
    return { linkedIdeas, linkedRes };
  };

  return (
    <div className="flex h-full gap-4 app-3d-root">
      {/* List */}
      <div className={cn('flex-1 space-y-4 overflow-y-auto pr-2 animate-fade-in', selectedNote && 'hidden md:block md:w-1/3 md:flex-none')}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
            <p className="text-muted-foreground">Your linked knowledge base</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New Note</Button></DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Create New Note</DialogTitle></DialogHeader>
              <NoteForm draft={draft} setDraft={setDraft} tagInput={tagInput} setTagInput={setTagInput} addTag={addTag} removeTag={removeTag} projects={projects as any} resources={resources as any} tasks={tasks as any} onSubmit={handleAddNote} submitLabel="Create Note" />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {NOTE_TYPES.slice(0, 4).map((t) => {
            const count = notes.filter((n) => !n.is_archived && (n as any).type === t.value).length;
            return (
              <button
                key={t.value}
                className={cn(
                  'bento-card text-center hover:ring-2 ring-primary/30 transition py-2',
                  filterType === t.value && 'ring-2 ring-primary',
                  t.value === 'reflection' && '!bg-[#0B5B42] text-white'
                )}
                onClick={() => setFilterType((p) => (p === t.value ? 'all' : t.value))}
              >
                <t.icon className={cn("h-4 w-4 mx-auto mb-1", t.value === 'reflection' ? "text-white/80" : "text-muted-foreground")} />
                <p className="font-bold">{count}</p>
                <p className={cn("text-[10px]", t.value === 'reflection' ? "text-white/70" : "text-muted-foreground")}>{t.label}</p>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[160px] dev-detached-tabs !p-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
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

        {/* Notes List */}
        {filteredNotes.length === 0 ? (
          <div className="bento-card text-center py-12"><FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /><p className="text-muted-foreground">No notes found.</p></div>
        ) : (
          <div className="space-y-2">
            {filteredNotes.map((note) => {
              const typeInfo = NOTE_TYPES.find((t) => t.value === note.type);
              const Icon = typeInfo?.icon || FileText;
              const isSelected = selectedNote?.id === note.id;
              return (
                <button key={note.id} onClick={() => setSelectedNote(note)} className={cn('bento-card w-full text-left flex items-center gap-3 py-3 px-4 transition', isSelected && 'ring-2 ring-primary')}>
                  <div className={cn('p-2 rounded-lg', typeInfo?.color, 'text-white')}><Icon className="h-4 w-4" /></div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('font-medium truncate', note.is_pinned && 'text-gold')}>{note.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{format(parseISO(note.updated_at), 'MMM d, yyyy')} · {note.content ? note.content.slice(0, 40) : ''}…</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selectedNote && (
        <div className="flex-1 bento-card overflow-y-auto animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <Badge className={cn('text-white', NOTE_TYPES.find((t) => t.value === selectedNote.type)?.color)}>{NOTE_TYPES.find((t) => t.value === selectedNote.type)?.label}</Badge>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleFavorite(selectedNote.id)}><Star className={cn('h-4 w-4', (selectedNote as any).is_pinned && 'fill-gold text-gold')} /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteNote(selectedNote.id)}><Trash2 className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={() => setSelectedNote(null)}><X className="h-4 w-4" /></Button>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-2">{selectedNote.title}</h2>

          {/* Tags */}
          {(selectedNote.tags || []).length > 0 && (<div className="flex flex-wrap gap-1 mb-3">{(selectedNote.tags || []).map((t) => (<Badge key={t} variant="outline" className="text-xs">{t}</Badge>))}</div>)}

          {/* Linked project */}
          {(selectedNote as any).project_id && (<p className="text-xs text-muted-foreground mb-3"><Link className="inline h-3 w-3 mr-1" />Project: {getProjectTitle((selectedNote as any).project_id)}</p>)}

          {/* Linked resources & tasks */}
          {(((selectedNote as any).linkedResources || []).length > 0 || ((selectedNote as any).linkedTasks || []).length > 0) && (
            <div className="flex flex-wrap gap-1 mb-3">
              {((selectedNote as any).linkedResources || []).map((rid: string) => (<Badge key={rid} className="bg-purple-500/10 text-purple-500 text-[10px]">Res: {getResourceTitle(rid)}</Badge>))}
              {((selectedNote as any).linkedTasks || []).map((tid: string) => (<Badge key={tid} className="bg-primary/10 text-primary text-[10px]">Task: {getTaskTitle(tid)}</Badge>))}
            </div>
          )}

          {/* Backlinks */}
          {(() => { const bl = getBacklinks(selectedNote.id); return (bl.linkedIdeas.length > 0 || bl.linkedRes.length > 0) && (<p className="text-xs text-muted-foreground mb-3"><Link className="inline h-3 w-3 mr-1" />Backlinks: {bl.linkedIdeas.length} ideas, {bl.linkedRes.length} resources</p>); })()}

          <Textarea
            value={selectedNote.content || ''}
            onChange={(e) => { updateNoteContent(selectedNote.id, e.target.value); setSelectedNote({ ...selectedNote, content: e.target.value }); }}
            className="min-h-[300px] font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-3">Last updated {format(parseISO((selectedNote as any).updated_at), 'PPPp')}</p>
        </div>
      )}
    </div>
  );
}

interface NoteFormProps {
  draft: { title: string; content: string; type: Note['type']; projectId: string; tags: string[]; linkedResources: string[]; linkedTasks: string[] };
  setDraft: React.Dispatch<React.SetStateAction<NoteFormProps['draft']>>;
  tagInput: string;
  setTagInput: (v: string) => void;
  addTag: () => void;
  removeTag: (t: string) => void;
  projects: { id: string; title: string }[];
  resources: { id: string; title: string }[];
  tasks: { id: string; title: string }[];
  onSubmit: () => void;
  submitLabel: string;
}

function NoteForm({ draft, setDraft, tagInput, setTagInput, addTag, removeTag, projects, resources, tasks, onSubmit, submitLabel }: NoteFormProps) {
  return (
    <div className="space-y-4 pt-4">
      <Input placeholder="Note title" value={draft.title} onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))} />
      <div className="grid grid-cols-2 gap-3">
        <Select value={draft.type} onValueChange={(v) => setDraft((p) => ({ ...p, type: v as Note['type'] }))}>
          <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>{NOTE_TYPES.map((t) => (<SelectItem key={t.value} value={t.value}><div className="flex items-center gap-2"><t.icon className="h-4 w-4" />{t.label}</div></SelectItem>))}</SelectContent>
        </Select>
        {projects.length > 0 && (
          <Select value={draft.projectId || 'none'} onValueChange={(v) => setDraft((p) => ({ ...p, projectId: v === 'none' ? '' : v }))}>
            <SelectTrigger><SelectValue placeholder="Link to project" /></SelectTrigger>
            <SelectContent><SelectItem value="none">No project</SelectItem>{projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>))}</SelectContent>
          </Select>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Tags</label>
        <div className="flex flex-wrap gap-1 mb-2">{draft.tags.map((t) => (<Badge key={t} variant="outline" className="flex items-center gap-1">{t}<button onClick={() => removeTag(t)}><X className="h-3 w-3" /></button></Badge>))}</div>
        <div className="flex gap-2"><Input placeholder="Add tag" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} className="flex-1" /><Button type="button" variant="outline" size="sm" onClick={addTag}><Plus className="h-4 w-4" /></Button></div>
      </div>

      {/* Link Resources */}
      {resources.length > 0 && (
        <Select value="select" onValueChange={(v) => { if (v !== 'select' && !draft.linkedResources.includes(v)) setDraft((p) => ({ ...p, linkedResources: [...p.linkedResources, v] })); }}>
          <SelectTrigger><SelectValue placeholder="Link to Resource" /></SelectTrigger>
          <SelectContent><SelectItem value="select" disabled>Select a resource...</SelectItem>{resources.filter((r) => !draft.linkedResources.includes(r.id)).map((r) => (<SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>))}</SelectContent>
        </Select>
      )}
      {draft.linkedResources.length > 0 && (<div className="flex flex-wrap gap-1">{draft.linkedResources.map((rid) => (<Badge key={rid} className="bg-purple-500/10 text-purple-500 text-xs flex items-center gap-1">{resources.find((r) => r.id === rid)?.title}<button onClick={() => setDraft((p) => ({ ...p, linkedResources: p.linkedResources.filter((x) => x !== rid) }))}><X className="h-3 w-3" /></button></Badge>))}</div>)}

      {/* Link Tasks */}
      {tasks.length > 0 && (
        <Select value="select" onValueChange={(v) => { if (v !== 'select' && !draft.linkedTasks.includes(v)) setDraft((p) => ({ ...p, linkedTasks: [...p.linkedTasks, v] })); }}>
          <SelectTrigger><SelectValue placeholder="Link to Task" /></SelectTrigger>
          <SelectContent><SelectItem value="select" disabled>Select a task...</SelectItem>{tasks.filter((t) => !draft.linkedTasks.includes(t.id)).map((t) => (<SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>))}</SelectContent>
        </Select>
      )}
      {draft.linkedTasks.length > 0 && (<div className="flex flex-wrap gap-1">{draft.linkedTasks.map((tid) => (<Badge key={tid} className="bg-primary/10 text-primary text-xs flex items-center gap-1">{tasks.find((t) => t.id === tid)?.title}<button onClick={() => setDraft((p) => ({ ...p, linkedTasks: p.linkedTasks.filter((x) => x !== tid) }))}><X className="h-3 w-3" /></button></Badge>))}</div>)}

      <Textarea placeholder="Start writing..." value={draft.content} onChange={(e) => setDraft((p) => ({ ...p, content: e.target.value }))} className="min-h-48" />
      <Button onClick={onSubmit} className="w-full" disabled={!draft.title.trim()}>{submitLabel}</Button>
    </div>
  );
}
