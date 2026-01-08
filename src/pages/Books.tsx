import { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { format, parseISO } from 'date-fns';
import {
  Plus, BookOpen, Star, Trash2, Search, BookMarked, CheckCircle, Clock, BookX, Tag, X, Edit2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const STATUS_ICONS: Record<string, any> = {
  want_to_read: BookMarked,
  reading: BookOpen,
  completed: CheckCircle,
  abandoned: BookX,
};

type BookStatus = 'want_to_read' | 'reading' | 'completed' | 'abandoned';

export default function Books() {
  const { books = [], createBook, updateBook, deleteBook: removeBook } = useApp();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [detailBookId, setDetailBookId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'want_to_read' | 'reading' | 'completed'>('all');
  const [filterTag, setFilterTag] = useState<string>('all');

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({ title: '', author: '', total_pages: '', tags: [] as string[] });
  const [tagInput, setTagInput] = useState('');

  const detailBook = useMemo(() => books.find(b => b.id === detailBookId) || null, [books, detailBookId]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => (b.tags || []).forEach((t) => set.add(t)));
    return Array.from(set);
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books
      .filter((b) => {
        const matchesSearch = !search ||
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          (b.author || '').toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || b.status === filter;
        const matchesTag = filterTag === 'all' || (b.tags || []).includes(filterTag);
        return matchesSearch && matchesFilter && matchesTag;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [books, search, filter, filterTag]);

  const stats = useMemo(() => ({
    total: books.length,
    reading: books.filter((b) => b.status === 'reading').length,
    completed: books.filter((b) => b.status === 'completed').length,
    wantToRead: books.filter((b) => b.status === 'want_to_read').length,
  }), [books]);

  const handleCreateBook = async () => {
    if (!draft.title.trim()) return;
    try {
      await createBook({
        title: draft.title.trim(),
        author: draft.author.trim(),
        status: 'want_to_read',
        total_pages: draft.total_pages ? parseInt(draft.total_pages) : null,
        current_page: 0,
        tags: draft.tags,
      });
      setDraft({ title: '', author: '', total_pages: '', tags: [] });
      setIsAddOpen(false);
      toast.success('Book added to library');
    } catch (e) {
      toast.error('Failed to add book');
    }
  };

  const handleUpdateBook = async () => {
    if (!detailBookId || !draft.title.trim()) return;
    try {
      await updateBook({
        id: detailBookId,
        title: draft.title.trim(),
        author: draft.author.trim(),
        total_pages: draft.total_pages ? parseInt(draft.total_pages) : null,
        tags: draft.tags,
      });
      setIsEditing(false);
      toast.success('Book updated');
    } catch (e) {
      toast.error('Failed to update book');
    }
  };

  const updateProgress = async (id: string, currentPage: number) => {
    const book = books.find(b => b.id === id);
    if (!book) return;

    // Clamp progress
    const totalPages = book.total_pages || Infinity;
    const actualPage = Math.max(0, Math.min(currentPage, totalPages));
    const status = book.total_pages && actualPage >= book.total_pages ? 'completed' : 'reading';

    await updateBook({
      id,
      current_page: actualPage,
      status,
      finish_date: status === 'completed' ? format(new Date(), 'yyyy-MM-dd') : null,
    });
  };

  const deleteBook = async (id: string) => {
    try {
      await removeBook(id);
      if (detailBookId === id) setDetailBookId(null);
      toast.success('Book removed');
    } catch (e) {
      toast.error('Failed to remove book');
    }
  };

  const startReading = async (id: string) => {
    await updateBook({
      id,
      status: 'reading',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      current_page: 0
    });
    toast.success('Started reading!');
  };

  const setRating = async (id: string, rating: number) => {
    await updateBook({ id, rating });
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !draft.tags.includes(t)) setDraft((p) => ({ ...p, tags: [...p.tags, t] }));
    setTagInput('');
  };
  const removeTag = (t: string) => setDraft((p) => ({ ...p, tags: p.tags.filter((x) => x !== t) }));

  const enterEditMode = () => {
    if (!detailBook) return;
    setDraft({
      title: detailBook.title,
      author: detailBook.author || '',
      total_pages: detailBook.total_pages?.toString() || '',
      tags: detailBook.tags || [],
    });
    setIsEditing(true);
  };

  return (
    <div className="flex h-full gap-4 animate-fade-in pb-6 overflow-hidden">
      {/* List Panel */}
      <div className={cn('flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-none', detailBookId && 'hidden md:block md:w-[40%] lg:w-[35%] md:flex-none')}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Bookshelf</h1>
            <p className="text-sm text-muted-foreground">Cultivate your knowledge</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={(v) => { setIsAddOpen(v); if (!v) setDraft({ title: '', author: '', total_pages: '', tags: [] }) }}>
            <DialogTrigger asChild><Button className="shadow-lg"><Plus className="h-4 w-4 mr-2" />Add New</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Add New Book</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input placeholder="Enter book title" value={draft.title} onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Author</label>
                  <Input placeholder="Enter author name" value={draft.author} onChange={(e) => setDraft((p) => ({ ...p, author: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Total Pages</label>
                    <Input type="number" placeholder="Optional" value={draft.total_pages} onChange={(e) => setDraft((p) => ({ ...p, total_pages: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags</label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {draft.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="flex items-center gap-1 py-1 px-2">
                        {t}
                        <button onClick={() => removeTag(t)} className="hover:text-destructive transition-colors"><X className="h-3 w-3" /></button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Add tag..." value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} className="h-9" />
                    <Button type="button" variant="outline" size="sm" onClick={addTag} className="h-9 w-9 p-0"><Plus className="h-4 w-4" /></Button>
                  </div>
                </div>
                <Button onClick={handleCreateBook} className="w-full mt-2" disabled={!draft.title.trim()}>Create Book</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bento-card py-3 px-1 text-center group cursor-default hover:bg-primary/5 transition-colors">
            <BookOpen className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-lg font-bold">{stats.total}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total</p>
          </div>
          <div className="bento-card py-3 px-1 text-center group cursor-default hover:bg-gold/5 transition-colors">
            <Clock className="h-4 w-4 mx-auto mb-1 text-gold animate-pulse" />
            <p className="text-lg font-bold text-gold">{stats.reading}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Reading</p>
          </div>
          <div className="bento-card py-3 px-1 text-center group cursor-default hover:bg-primary/5 transition-colors">
            <CheckCircle className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-lg font-bold text-primary">{stats.completed}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Done</p>
          </div>
          <div className="bento-card py-3 px-1 text-center group cursor-default bg-primary text-white">
            <BookMarked className="h-4 w-4 mx-auto mb-1 opacity-80" />
            <p className="text-lg font-bold">{stats.wantToRead}</p>
            <p className="text-[10px] opacity-80 uppercase tracking-wider font-semibold">Queued</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="space-y-3">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList className="grid w-full grid-cols-4 h-10 p-1 bg-secondary/50">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="reading" className="text-xs">Reading</TabsTrigger>
              <TabsTrigger value="completed" className="text-xs">Done</TabsTrigger>
              <TabsTrigger value="want_to_read" className="text-xs">Queue</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search library..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 bg-secondary/30 border-none focus-visible:ring-1"
              />
            </div>
            {allTags.length > 0 && (
              <Select value={filterTag} onValueChange={setFilterTag}>
                <SelectTrigger className="w-[100px] h-10 text-xs bg-secondary/30 border-none">
                  <SelectValue placeholder="Tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {allTags.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* List Content */}
        <div className="space-y-2 pb-10">
          {filteredBooks.length === 0 ? (
            <div className="bento-card text-center py-16 opacity-60">
              <BookX className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm font-medium">No books found</p>
            </div>
          ) : (
            filteredBooks.map((book) => {
              const progress = book.total_pages ? Math.round(((book.current_page || 0) / book.total_pages) * 100) : 0;
              const StatusIcon = STATUS_ICONS[book.status as string] || BookMarked;
              const isActive = detailBookId === book.id;

              return (
                <button
                  key={book.id}
                  onClick={() => { setDetailBookId(book.id); setIsEditing(false); }}
                  className={cn(
                    'bento-card w-full text-left flex items-start gap-4 p-4 transition-all duration-200 border border-transparent',
                    isActive ? 'ring-2 ring-primary bg-primary/5 border-primary/20' : 'hover:border-primary/20'
                  )}
                >
                  <div className={cn(
                    'h-12 w-12 rounded flex items-center justify-center flex-none mt-1 shadow-inner',
                    book.status === 'reading' ? 'bg-gold/10 text-gold' :
                      book.status === 'completed' ? 'bg-primary/10 text-primary' :
                        'bg-secondary text-muted-foreground/60'
                  )}>
                    <StatusIcon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-sm truncate leading-tight">{book.title}</h3>
                      {book.rating && (
                        <div className="flex gap-px flex-none">
                          {[...Array(book.rating)].map((_, i) => <Star key={i} className="h-2.5 w-2.5 fill-gold text-gold" />)}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-1">{book.author || 'Unknown Author'}</p>
                    {book.status === 'reading' && (
                      <div className="mt-3 space-y-1.5">
                        <div className="flex justify-between text-[9px] text-muted-foreground font-medium">
                          <span>{book.current_page} / {book.total_pages || '?'} pages</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Detail View */}
      {detailBookId && (
        <div className="flex-1 h-full overflow-y-auto scrollbar-none animate-in fade-in slide-in-from-right-4">
          <DetailComponent
            id={detailBookId}
            book={detailBook}
            isEditing={isEditing}
            draft={draft}
            setDraft={setDraft}
            tagInput={tagInput}
            setTagInput={setTagInput}
            onClose={() => setDetailBookId(null)}
            onSaveEdit={handleUpdateBook}
            onToggleEdit={() => isEditing ? handleUpdateBook() : enterEditMode()}
            onCancelEdit={() => setIsEditing(false)}
            onDelete={() => deleteBook(detailBookId)}
            onStartReading={() => startReading(detailBookId)}
            onUpdateProgress={(page: number) => updateProgress(detailBookId, page)}
            onSetRating={(r: number) => setRating(detailBookId, r)}
            addTag={addTag}
            removeTag={removeTag}
          />
        </div>
      )}
    </div>
  );
}

function DetailComponent({
  id, book, isEditing, draft, setDraft, tagInput, setTagInput,
  onClose, onSaveEdit, onToggleEdit, onCancelEdit, onDelete, onStartReading,
  onUpdateProgress, onSetRating, addTag, removeTag
}: any) {
  if (!book) return <div className="bento-card h-full flex items-center justify-center p-8 text-muted-foreground">Select a book to view details.</div>;

  const progress = book.total_pages ? Math.round(((book.current_page || 0) / book.total_pages) * 100) : 0;
  const statusLabels: Record<string, string> = {
    want_to_read: 'In Queue',
    reading: 'Currently Reading',
    completed: 'Finished',
    abandoned: 'Paused'
  };

  return (
    <div className="bento-card min-h-full flex flex-col p-6 shadow-xl border-primary/10 relative">
      <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors z-10">
        <X className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Detail Header */}
      <div className="flex items-center justify-between mb-8 pr-10">
        <Badge className={cn(
          'px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full border-none shadow-sm',
          book.status === 'reading' ? 'bg-gold hover:bg-gold text-white' :
            book.status === 'completed' ? 'bg-primary hover:bg-primary text-white' :
              'bg-secondary text-muted-foreground hover:bg-secondary'
        )}>
          {statusLabels[book.status as string] || book.status}
        </Badge>
        <div className="flex items-center gap-1">
          {isEditing ? (
            <>
              <Button variant="default" size="sm" className="h-8 text-xs font-bold" onClick={onSaveEdit}>
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Save
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold" onClick={onCancelEdit}>
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold group" onClick={onToggleEdit}>
              <Edit2 className="h-3.5 w-3.5 mr-1.5 group-hover:scale-110 transition-transform" /> Edit
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
        {/* Mock Cover */}
        <div className="w-full md:w-36 aspect-[2/3] bg-gradient-to-br from-secondary/50 to-secondary rounded-xl shadow-inner flex flex-col items-center justify-center p-4 text-center border overflow-hidden flex-none relative">
          <BookOpen className="h-10 w-10 text-muted-foreground/20 mb-2" />
          <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] relative z-0">SABR</span>
          <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/0 transition-colors pointer-events-none" />
        </div>

        <div className="flex-1 space-y-5 w-full">
          {isEditing ? (
            <div className="space-y-4 max-w-sm">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Book Title</label>
                <Input value={draft.title} onChange={(e) => setDraft((p: any) => ({ ...p, title: e.target.value }))} className="text-xl font-bold bg-secondary/10 border-none focus-visible:ring-1" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Author</label>
                <Input value={draft.author} onChange={(e) => setDraft((p: any) => ({ ...p, author: e.target.value }))} className="bg-secondary/10 border-none focus-visible:ring-1" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Total Pages</label>
                <Input type="number" value={draft.total_pages} onChange={(e) => setDraft((p: any) => ({ ...p, total_pages: e.target.value }))} className="bg-secondary/10 border-none focus-visible:ring-1 w-32" />
              </div>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-3xl font-bold leading-tight tracking-tight">{book.title}</h2>
                <p className="text-lg text-muted-foreground mt-1.5 font-medium">{book.author || 'Unknown Author'}</p>
              </div>

              {/* Action Buttons */}
              {book.status === 'want_to_read' && (
                <Button className="w-full h-14 text-sm font-black shadow-lg shadow-primary/20 tracking-widest bg-primary hover:bg-primary/90" onClick={onStartReading}>
                  START READING EXPERIENCE
                </Button>
              )}
            </>
          )}

          {/* Rating */}
          {!isEditing && (
            <div className="flex items-center gap-1.5 pt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => onSetRating(s)} className="hover:scale-125 transition-transform duration-200">
                  <Star className={cn('h-7 w-7 transition-all', (book.rating || 0) >= s ? 'fill-gold text-gold drop-shadow-sm' : 'text-muted-foreground/20')} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8 flex-1">
        {/* Progress Tracker */}
        {book.status === 'reading' && (
          <div className="p-6 rounded-2xl bg-secondary/20 border border-primary/5 shadow-sm">
            <h4 className="text-xs font-bold text-muted-foreground uppercase mb-5 tracking-[0.2em] flex items-center justify-between">
              Reading Progress
              <span className="text-primary font-black bg-primary/10 px-2 py-0.5 rounded-md">{progress}%</span>
            </h4>

            <div className="space-y-8">
              <Progress value={progress} className="h-3 bg-secondary/80 shadow-inner rounded-full" />

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-1 w-full space-y-3">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Update Current Page</label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-32">
                      <Input
                        type="number"
                        placeholder="Page"
                        value={book.current_page || 0}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                          onUpdateProgress(val);
                        }}
                        className="h-14 text-center text-xl font-bold bg-background border-none shadow-md ring-1 ring-primary/10 focus-visible:ring-primary/50"
                      />
                    </div>
                    <span className="text-muted-foreground text-sm font-medium">of {book.total_pages || '???'} pages</span>
                  </div>
                </div>
                {book.total_pages && (
                  <div className="flex-none p-5 rounded-2xl bg-primary/5 flex flex-col items-center justify-center min-w-[100px] border border-primary/10">
                    <span className="text-xl font-black text-primary leading-none">{book.total_pages - (book.current_page || 0)}</span>
                    <span className="text-[9px] font-bold uppercase text-primary/60 mt-1">Pages Left</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Finished Details */}
        {book.status === 'completed' && book.finish_date && (
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-primary/5 text-primary border border-primary/10 shadow-sm animate-in zoom-in-95 duration-500">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary/70">Completion Date</p>
              <p className="text-sm font-black">{format(parseISO(book.finish_date), 'MMMM d, yyyy')}</p>
            </div>
          </div>
        )}

        {/* Tags Section */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Classification & Tags</h4>
          <div className="flex flex-wrap gap-2">
            {isEditing ? (
              <div className="w-full space-y-4">
                <div className="flex flex-wrap gap-2">
                  {(draft.tags || []).map((t: any) => (
                    <Badge key={t} variant="secondary" className="flex items-center gap-1.5 py-1.5 px-3 bg-primary/10 text-primary border-none font-bold rounded-lg group">
                      {t}
                      <X className="h-3 w-3 cursor-pointer hover:scale-125 transition-transform" onClick={() => removeTag(t)} />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 max-w-sm">
                  <Input placeholder="Type tag and press enter..." value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} className="bg-secondary/10 border-none h-10" />
                  <Button variant="outline" size="icon" onClick={addTag} className="h-10 w-10"><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
            ) : (
              (book.tags || []).length > 0 ? (
                (book.tags || []).map((t) => (
                  <Badge key={t} variant="outline" className="text-[10px] py-1 px-3 font-black tracking-tight bg-secondary/10 border-none transition-colors hover:bg-secondary/20 cursor-default">
                    #{t.toUpperCase()}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground/60 italic ml-1">No identifiers assigned</span>
              )
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-8 flex justify-between items-center text-[9px] text-muted-foreground/40 font-bold uppercase tracking-[0.2em]">
        <div className="flex gap-4">
          <span>CAT: {id.split('-')[0]}</span>
          <span>SR: LIBRARY_V2</span>
        </div>
        <span>ADDED {format(parseISO(book.created_at || new Date().toISOString()), 'PPP')}</span>
      </div>
    </div>
  );
}
