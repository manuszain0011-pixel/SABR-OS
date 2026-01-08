import { useState } from 'react';
import { useQuranMemorization, MemorizationQuality } from '@/hooks/useQuranMemorization';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Check, BookOpen, RotateCcw, Star, RefreshCw } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

import { useMemo } from 'react';
import { SURAHS } from '@/data/surahs';

export function QuranMemorization() {
    const { memorizedVerses, addMemorization, logRevision, getDueRevisions } = useQuranMemorization();
    const dueRevisions = getDueRevisions();

    const [surahSearch, setSurahSearch] = useState('');
    const [form, setForm] = useState({
        surahNumber: '1',
        ayahFrom: '',
        ayahTo: '',
        quality: '3',
        tajweedNotes: '',
        tafsirNotes: ''
    });

    const filteredSurahs = useMemo(() => {
        return SURAHS.filter(s =>
            s.name.toLowerCase().includes(surahSearch.toLowerCase()) ||
            s.number.toString().includes(surahSearch)
        );
    }, [surahSearch]);

    const handleSubmit = async () => {
        if (!form.ayahFrom || !form.ayahTo) return;

        await addMemorization.mutateAsync({
            surah_number: parseInt(form.surahNumber),
            ayah_from: parseInt(form.ayahFrom),
            ayah_to: parseInt(form.ayahTo),
            memorized_date: new Date().toISOString().split('T')[0],
            quality_rating: parseInt(form.quality) as MemorizationQuality,
            tajweed_notes: form.tajweedNotes,
            tafsir_notes: form.tafsirNotes
        });

        setForm(prev => ({ ...prev, ayahFrom: '', ayahTo: '', tajweedNotes: '', tafsirNotes: '' }));
    };

    const currentSurah = SURAHS.find(s => s.number === parseInt(form.surahNumber)) || SURAHS[0];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Revision Due Card */}
                <Card className="md:col-span-2 gradient-gold text-white border-0">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold flex items-center gap-2">
                                    <RotateCcw className="h-6 w-6" />
                                    Due for Revision
                                </h3>
                                <p className="opacity-90">{dueRevisions.length} sections need review today</p>
                            </div>
                            <div className="text-right">
                                <p className="text-4xl font-bold">{dueRevisions.length}</p>
                                <p className="text-xs uppercase tracking-wider opacity-80">Pending</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Due Revisions List */}
                {dueRevisions.length > 0 && (
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Repair Your Hifz</CardTitle>
                            <CardDescription>Scheduled spaced repetition reviews</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {dueRevisions.map(rev => {
                                const surah = SURAHS.find(s => s.number === rev.surah_number);
                                return (
                                    <div key={rev.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {rev.surah_number}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">{surah?.name || `Surah ${rev.surah_number}`}</h4>
                                                <p className="text-sm text-muted-foreground">Ayah {rev.ayah_from} - {rev.ayah_to}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Last revised: {rev.last_revised_date ? format(parseISO(rev.last_revised_date), 'MMM d') : 'Never'}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => logRevision.mutate({ id: rev.id, quality: 5 })}
                                            className="gap-2"
                                        >
                                            <Check className="h-4 w-4" /> Revised
                                        </Button>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                )}

                {/* New Memorization Form */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            Log New Hifz
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Surah</label>
                            <Input
                                placeholder="Search surah..."
                                value={surahSearch}
                                onChange={(e) => setSurahSearch(e.target.value)}
                                className="mb-2"
                            />
                            <Select
                                value={form.surahNumber}
                                onValueChange={v => {
                                    const sNum = parseInt(v);
                                    const s = SURAHS.find(surah => surah.number === sNum);
                                    setForm({ ...form, surahNumber: v, ayahFrom: '1', ayahTo: s?.verses.toString() || '' });
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    {filteredSurahs.map(s => (
                                        <SelectItem key={s.number} value={s.number.toString()}>
                                            {s.number}. {s.name} ({s.verses} v)
                                        </SelectItem>
                                    ))}
                                    {filteredSurahs.length === 0 && <p className="p-2 text-xs text-muted-foreground text-center">No surahs found</p>}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Ayah From</label>
                                <Input
                                    type="number"
                                    value={form.ayahFrom}
                                    onChange={e => setForm({ ...form, ayahFrom: e.target.value })}
                                    placeholder="1"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Ayah To</label>
                                <Input
                                    type="number"
                                    value={form.ayahTo}
                                    onChange={e => setForm({ ...form, ayahTo: e.target.value })}
                                    placeholder="10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Initial Quality</label>
                            <Select value={form.quality} onValueChange={v => setForm({ ...form, quality: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1 - Needs work</SelectItem>
                                    <SelectItem value="2">2 - Weak</SelectItem>
                                    <SelectItem value="3">3 - Good</SelectItem>
                                    <SelectItem value="4">4 - Strong</SelectItem>
                                    <SelectItem value="5">5 - Perfect (Solid)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Notes (Tajweed/Tafsir)</label>
                            <Textarea
                                placeholder="Any difficulties or reflections..."
                                value={form.tajweedNotes}
                                onChange={e => setForm({ ...form, tajweedNotes: e.target.value })}
                            />
                        </div>

                        <Button onClick={handleSubmit} className="w-full" disabled={!form.ayahFrom || !form.ayahTo}>
                            Save Progress
                        </Button>
                    </CardContent>
                </Card>

                {/* Progress Stats */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-gold" />
                            Hifz Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-center py-4">
                            <p className="text-3xl font-bold text-primary">{memorizedVerses.length}</p>
                            <p className="text-sm text-muted-foreground">Sessions Recorded</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Solid Hifz (5/5)</span>
                                <span className="font-bold">{memorizedVerses.filter(m => m.quality_rating === 5).length}</span>
                            </div>
                            <Progress value={(memorizedVerses.filter(m => m.quality_rating === 5).length / (memorizedVerses.length || 1)) * 100} className="h-2" />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Recent Activity</span>
                                <span className="text-muted-foreground">{memorizedVerses.filter(m => {
                                    const d = parseISO(m.created_at);
                                    const now = new Date();
                                    return now.getTime() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
                                }).length} this week</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Full History List */}
            <Card>
                <CardHeader>
                    <CardTitle>Memorization History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {memorizedVerses.map(m => {
                            const surah = SURAHS.find(s => s.number === m.surah_number);
                            return (
                                <div key={m.id} className="flex items-center justify-between p-3 border-b last:border-0 hover:bg-secondary/20 rounded-md transition-colors">
                                    <div>
                                        <p className="font-medium">{surah?.name || `Surah ${m.surah_number}`} <span className="text-sm text-muted-foreground font-normal">({m.ayah_from}-{m.ayah_to})</span></p>
                                        <p className="text-xs text-muted-foreground">Next revision: {m.next_revision_date || 'Not scheduled'}</p>
                                    </div>
                                    <Badge variant={m.quality_rating && m.quality_rating >= 4 ? 'default' : 'secondary'}>
                                        {m.quality_rating}/5 Quality
                                    </Badge>
                                </div>
                            )
                        })}
                        {memorizedVerses.length === 0 && (
                            <p className="text-center text-muted-foreground py-4">No memorization records yet.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
