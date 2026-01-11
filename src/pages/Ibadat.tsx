import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { PrayerEntry, PrayerName, QuranProgress, ZikrEntry, FastingRecord, Dua, PrayerStatus } from '@/types';
import { format, parseISO, startOfWeek, endOfWeek, addDays, subDays, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import {
  Moon, Users, Clock, RotateCcw, Check, X, BookOpen, Star,
  ChevronLeft, ChevronRight, Flame, Heart, Sparkles, Target,
  Plus, Trash2, Edit2, Play, Pause, RotateCw, Award, Zap,
  Calendar, TrendingUp, BookMarked, Hand, Utensils, Gift
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EnhancedPrayerCard } from '@/components/ibadat/EnhancedPrayerCard';
import { QadaPrayerTracker } from '@/components/ibadat/QadaPrayerTracker';
import { PrayerEnhancements } from '@/components/ibadat/PrayerEnhancements';
import { QuranMemorization } from '@/components/ibadat/QuranMemorization';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { SURAHS } from '@/data/surahs';

const FARD_PRAYERS: { name: PrayerName; displayName: string }[] = [
  { name: 'fajr', displayName: 'Fajr' },
  { name: 'dhuhr', displayName: 'Dhuhr' },
  { name: 'asr', displayName: 'Asr' },
  { name: 'maghrib', displayName: 'Maghrib' },
  { name: 'isha', displayName: 'Isha' },
];

const NAFL_PRAYERS: { name: PrayerName; displayName: string; reward: string }[] = [
  { name: 'tahajjud', displayName: 'Tahajjud', reward: '2 rak\'ahs minimum' },
  { name: 'duha', displayName: 'Duha', reward: '2-12 rak\'ahs' },
  { name: 'witr', displayName: 'Witr', reward: 'Odd number' },
];

const SPI_POINTS = {
  jamaah: 27,
  onTime: 10,
  late: 3,
  missed: 0,
  qada: 3,
  nafl: 15,
  quranPage: 10,
  quranMemorize: 50,
  dhikr: 5,
  fasting: 30,
  sadaqah: 20,
};

const COMPLETED_PRAYER_STATUSES = new Set(['jamaah', 'on_time', 'late', 'qada']);

const FASTING_TYPES = [
  { value: 'ramadan', label: 'Ramadan', points: 100 },
  { value: 'monday_thursday', label: 'Monday/Thursday', points: 30 },
  { value: 'white_days', label: 'White Days (13-15)', points: 30 },
  { value: 'ashura', label: 'Ashura', points: 50 },
  { value: 'arafah', label: 'Day of Arafah', points: 100 },
  { value: 'shawwal', label: 'Shawwal (6 days)', points: 50 },
  { value: 'voluntary', label: 'Voluntary', points: 20 },
];

const DHIKR_PRESETS = [
  { name: 'SubhanAllah', target: 33, arabic: 'سبحان الله' },
  { name: 'Alhamdulillah', target: 33, arabic: 'الحمد لله' },
  { name: 'Allahu Akbar', target: 34, arabic: 'الله أكبر' },
  { name: 'La ilaha illallah', target: 100, arabic: 'لا إله إلا الله' },
  { name: 'Astaghfirullah', target: 100, arabic: 'أستغفر الله' },
  { name: 'Salawat', target: 100, arabic: 'اللهم صل على محمد' },
];



export default function Ibadat() {
  const {
    getTodayPrayerRecord, updatePrayerStatus,
    quranProgress, createQuranProgress,
    zikrEntries, createZikrEntry, updateZikrEntry,
    fastingRecords, createFastingRecord, updateFastingRecord,
    duas, createDua, updateDua,
    prayerRecords,
    qadaPrayers, createQadaPrayer, updateQadaPrayer, deleteQadaPrayer
  } = useApp();
  const { prayerTimes, loading, nextPrayer } = usePrayerTimes();
  const todayPrayer = getTodayPrayerRecord();
  const today = format(new Date(), 'yyyy-MM-dd');

  // States
  const [selectedDate, setSelectedDate] = useState(today);
  const [quranDialogOpen, setQuranDialogOpen] = useState(false);
  const [dhikrDialogOpen, setDhikrDialogOpen] = useState(false);
  const [fastingDialogOpen, setFastingDialogOpen] = useState(false);
  const [duaDialogOpen, setDuaDialogOpen] = useState(false);
  const [activeCounter, setActiveCounter] = useState<string | null>(null);
  const [counterValue, setCounterValue] = useState(0);
  const [surahSearchText, setSurahSearchText] = useState('');

  const filteredSurahs = useMemo(() => {
    return SURAHS.filter(s =>
      s.name.toLowerCase().includes(surahSearchText.toLowerCase()) ||
      s.number.toString().includes(surahSearchText)
    );
  }, [surahSearchText]);

  // Quran form
  const [quranForm, setQuranForm] = useState({
    type: 'reading' as QuranProgress['type'],
    surahNumber: 1,
    startAyah: 1,
    endAyah: 10,
    pagesRead: 1,
    duration: 15,
    notes: '',
  });

  // Dhikr form
  const [dhikrForm, setDhikrForm] = useState({
    type: 'custom' as ZikrEntry['type'],
    name: '',
    targetCount: 33,
  });

  // Dua form
  const [duaForm, setDuaForm] = useState({
    title: '',
    arabic: '',
    transliteration: '',
    translation: '',
    category: 'daily' as Dua['category'],
    source: '',
  });

  // Stats calculations
  const prayerStats = useMemo(() => {
    let completed = 0;
    let totalPoints = 0;
    let jamaahCount = 0;

    FARD_PRAYERS.forEach((p) => {
      const entry = todayPrayer[p.name];
      if (entry && COMPLETED_PRAYER_STATUSES.has(entry.status)) {
        completed++;
        totalPoints += entry.spiPoints;
        if (entry.status === 'jamaah') jamaahCount++;
      }
    });

    return { completed, total: 5, totalPoints, jamaahCount };
  }, [todayPrayer]);

  const weeklyStats = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

    const weekRecords = prayerRecords.filter(r =>
      isWithinInterval(parseISO(r.date), { start: weekStart, end: weekEnd })
    );

    let totalPrayers = 0;
    let completedPrayers = 0;
    let totalPoints = 0;

    weekRecords.forEach(record => {
      FARD_PRAYERS.forEach(p => {
        totalPrayers++;
        const entry = record[p.name];
        if (entry && COMPLETED_PRAYER_STATUSES.has(entry.status)) {
          completedPrayers++;
          totalPoints += entry.spiPoints;
        }
      });
    });

    return {
      percentage: totalPrayers > 0 ? Math.round((completedPrayers / totalPrayers) * 100) : 0,
      totalPoints,
      prayersCompleted: completedPrayers,
    };
  }, [prayerRecords]);

  const monthlyQuranStats = useMemo(() => {
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    const monthProgress = quranProgress.filter(q =>
      isWithinInterval(parseISO(q.date), { start: monthStart, end: monthEnd })
    );

    return {
      pagesRead: monthProgress.reduce((sum, q) => sum + (q.pages_read || 0), 0),
      sessionsCount: monthProgress.length,
      totalMinutes: monthProgress.reduce((sum, q) => sum + (q.duration_minutes || 0), 0),
      memorized: monthProgress.filter(q => q.type === 'memorization').length,
    };
  }, [quranProgress]);

  const handlePrayerUpdate = (
    prayerName: PrayerName,
    updates: Partial<PrayerEntry> & { sunnahBefore?: boolean; sunnahAfter?: boolean; notes?: string }
  ) => {
    const currentEntry = todayPrayer[prayerName];

    // Calculate new SPI points
    let points = currentEntry?.spiPoints || 0;

    // Base points from status
    if (updates.status) {
      const isNafl = prayerName === 'tahajjud' || prayerName === 'duha' || prayerName === 'witr';
      points = updates.status === 'jamaah' ? SPI_POINTS.jamaah
        : updates.status === 'on_time' ? (isNafl ? SPI_POINTS.nafl : SPI_POINTS.onTime)
          : updates.status === 'late' ? SPI_POINTS.late
            : updates.status === 'missed' ? SPI_POINTS.missed
              : 0;
    }

    // Add Sunnah points (3 points each)
    // Note: This logic assumes we re-calculate fully or just add. 
    // To be precise we should recalculate based on final state.
    // For simplicity here, we trust the base calculation and simple additions would handle it in a real helper.
    // However, existing simple logic just overwrote points. Let's start with base points.

    const newEntry = {
      ...currentEntry,
      ...updates,
      spiPoints: points // This overwrites spiPoints with just base status points. 
      // Sunnah points are added to display in EnhancedPrayerCard but stored in DB? 
      // Ideally we store everything.
    };

    updatePrayerStatus(prayerName, newEntry as any);
  };

  const handleAddQuranProgress = async () => {
    const surah = SURAHS.find(s => s.number === quranForm.surahNumber) || SURAHS[0];
    await createQuranProgress({
      date: today,
      type: quranForm.type,
      surah_number: quranForm.surahNumber,
      surah_name: surah.name,
      ayah_from: quranForm.startAyah,
      ayah_to: quranForm.endAyah,
      pages_read: quranForm.pagesRead,
      duration_minutes: quranForm.duration,
      notes: quranForm.notes,
    });

    setQuranDialogOpen(false);
    setQuranForm({ type: 'reading', surahNumber: 1, startAyah: 1, endAyah: 10, pagesRead: 1, duration: 15, notes: '' });
  };

  const handleAddDhikr = async (preset?: typeof DHIKR_PRESETS[0]) => {
    await createZikrEntry({
      date: today,
      type: preset ? (preset.name === 'Morning Adhkar' ? 'morning' : 'custom') : dhikrForm.type,
      notes: preset?.name || (dhikrForm.type === 'custom' ? dhikrForm.name : dhikrForm.type),
      target_count: preset?.target || dhikrForm.targetCount,
      count: 0,
    });

    if (!preset) {
      setDhikrDialogOpen(false);
      setDhikrForm({ type: 'custom', name: '', targetCount: 33 });
    }
  };

  const handleUpdateDhikrCount = async (id: string, count: number, targetCount: number) => {
    await updateZikrEntry({
      id,
      count: Math.min(count, targetCount)
    });
  };

  const handleAddFasting = async (type: string) => {
    const fastType = FASTING_TYPES.find(f => f.value === type);
    await createFastingRecord({
      date: today,
      type: type,
      is_completed: false,
    });

    setFastingDialogOpen(false);
  };

  const handleToggleFasting = async (id: string, currentStatus: boolean) => {
    await updateFastingRecord({
      id,
      is_completed: !currentStatus
    });
  };

  const handleAddDua = async () => {
    await createDua({
      title: duaForm.title,
      arabic_text: duaForm.arabic,
      transliteration: duaForm.transliteration,
      translation: duaForm.translation,
      category: duaForm.category,
      is_favorite: false,
      notes: duaForm.source,
    });

    setDuaDialogOpen(false);
    setDuaForm({ title: '', arabic: '', transliteration: '', translation: '', category: 'daily', source: '' });
  };

  const todayQuranPages = quranProgress
    .filter(q => q.date === today)
    .reduce((sum, q) => sum + (q.pages_read || 0), 0);

  const todayDhikr = zikrEntries.filter(z => z.date === today);
  const todayFasting = fastingRecords.filter(f => f.date === today);

  const totalSpiToday = useMemo(() => {
    let total = prayerStats.totalPoints;
    total += todayQuranPages * SPI_POINTS.quranPage;
    total += todayDhikr.filter(z => (z.count || 0) >= (z.target_count || 33)).length * SPI_POINTS.dhikr;
    total += todayFasting.filter(f => f.is_completed).reduce((sum, f) => sum + (FASTING_TYPES.find(ft => ft.value === f.type)?.points || 20), 0);
    return total;
  }, [prayerStats, todayQuranPages, todayDhikr, todayFasting]);

  return (
    <div className="space-y-6 animate-fade-in app-3d-root">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Ibadat Hub</h1>
          <p className="text-muted-foreground">Elevate your spiritual state and track your journey</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-muted-foreground mb-1">{format(new Date(), 'EEEE')}</p>
          <p className="text-lg font-bold text-primary">{format(new Date(), 'MMMM d, yyyy')}</p>
        </div>
      </div>

      {/* Next Prayer Banner */}
      {nextPrayer && (
        <div className="bento-card gradient-green text-primary-foreground">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/10">
                <Moon className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm opacity-80">Next Prayer</p>
                <h2 className="text-3xl font-bold">{nextPrayer.name}</h2>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">Time Remaining</p>
              <p className="text-2xl font-bold">{nextPrayer.timeRemaining}</p>
            </div>
            <div className="hidden md:block text-right border-l border-white/20 pl-6">
              <p className="text-sm opacity-80">SPI Points Today</p>
              <p className="text-2xl font-bold">{totalSpiToday}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        <div className="bento-card">
          <p className="text-sm font-medium text-muted-foreground mb-1">Salat</p>
          <p className="text-2xl font-bold text-primary">{prayerStats.completed}/5</p>
        </div>
        <div className="bento-card">
          <p className="text-sm font-medium text-muted-foreground mb-1">Jama'ah</p>
          <p className="text-2xl font-bold text-gold">{prayerStats.jamaahCount}</p>
        </div>
        <div className="bento-card">
          <p className="text-sm font-medium text-muted-foreground mb-1">Quran</p>
          <p className="text-2xl font-bold text-primary">{todayQuranPages} pgs</p>
        </div>
        <div className="bento-card">
          <p className="text-sm font-medium text-muted-foreground mb-1">Adhkar</p>
          <p className="text-2xl font-bold text-gold">{todayDhikr.filter(z => (z.count || 0) >= (z.target_count || 33)).length}</p>
        </div>
        <div className="bento-card gradient-green text-primary-foreground">
          <p className="text-sm font-medium opacity-90 mb-1">Daily SPI</p>
          <p className="text-2xl font-bold">{totalSpiToday}</p>
        </div>
      </div>

      <Tabs defaultValue="prayers" className="space-y-4">
        <TabsList className="tabs-list-neumorphic grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 h-auto gap-1">
          <TabsTrigger value="prayers" className="tab-trigger-neumorphic"><Moon className="h-4 w-4 mr-1" />Prayers</TabsTrigger>
          <TabsTrigger value="quran" className="tab-trigger-neumorphic"><BookOpen className="h-4 w-4 mr-1" />Quran</TabsTrigger>
          <TabsTrigger value="dhikr" className="tab-trigger-neumorphic"><Sparkles className="h-4 w-4 mr-1" />Dhikr</TabsTrigger>
          <TabsTrigger value="fasting" className="tab-trigger-neumorphic"><Utensils className="h-4 w-4 mr-1" />Fasting</TabsTrigger>
          <TabsTrigger value="duas" className="tab-trigger-neumorphic"><Hand className="h-4 w-4 mr-1" />Duas</TabsTrigger>
        </TabsList>

        {/* PRAYERS TAB */}
        <TabsContent value="prayers" className="space-y-4">
          {/* Weekly Progress */}
          <div className="bento-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Weekly Prayer Score</h3>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">{weeklyStats.prayersCompleted}/35 prayers</span>
                <span className="text-2xl font-bold text-primary">{weeklyStats.percentage}%</span>
              </div>
            </div>
            <Progress value={weeklyStats.percentage} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">Total weekly SPI: {weeklyStats.totalPoints}</p>
          </div>

          {/* Today's Progress */}
          <div className="bento-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Today's Progress</h3>
              <span className="text-2xl font-bold text-primary">{prayerStats.completed}/5</span>
            </div>
            <Progress value={(prayerStats.completed / 5) * 100} className="h-3" />
          </div>

          {/* Fard Prayers */}
          <div className="space-y-3">
            <h3 className="font-medium text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" /> Fard Prayers
            </h3>
            {FARD_PRAYERS.map((prayer, index) => {
              const prayerTime = prayerTimes.find((p) => p.name === prayer.name)?.time.replace(' (BST)', '').replace(' (GMT)', '');
              const entry = todayPrayer[prayer.name] || {};
              const status = entry.status || 'none';
              const isPrayed = COMPLETED_PRAYER_STATUSES.has(status);

              return (
                <div key={prayer.name} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in">
                  <EnhancedPrayerCard
                    prayerName={prayer.name}
                    displayName={prayer.displayName}
                    prayerTime={loading ? 'Loading...' : prayerTime}
                    status={status}
                    isPrayed={isPrayed}
                    onStatusChange={(newStatus) => handlePrayerUpdate(prayer.name, { status: newStatus as PrayerStatus })}
                    onSunnahChange={(field, value) => {
                      // field is like 'fajr_sunnah_before'
                      const key = field.includes('before') ? 'sunnahBefore' : 'sunnahAfter';
                      handlePrayerUpdate(prayer.name, { [key]: value });
                    }}
                    onNotesChange={(notes) => handlePrayerUpdate(prayer.name, { notes })}
                    onKhushuChange={(level) => handlePrayerUpdate(prayer.name, { khushu: level })}
                    jamaahChecked={status === 'jamaah'}
                    sunnahBefore={entry.sunnahBefore}
                    sunnahAfter={entry.sunnahAfter}
                    notes={entry.notes}
                    spiPoints={entry.spiPoints || 0}
                    khushu={entry.khushu || 3}
                  />
                </div>
              );
            })}
          </div>

          {/* Nafl Prayers */}
          <div className="space-y-3">
            <h3 className="font-medium text-muted-foreground flex items-center gap-2">
              <Star className="h-4 w-4" /> Nafl Prayers (+{SPI_POINTS.nafl} SPI each)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {NAFL_PRAYERS.map((prayer) => {
                const entry = todayPrayer[prayer.name];
                const isPrayed = entry?.status === 'on_time';

                return (
                  <div
                    key={prayer.name}
                    className={cn(
                      "bento-card cursor-pointer transition-all",
                      isPrayed && "border-gold/30 bg-gold-light"
                    )}
                    onClick={() => handlePrayerUpdate(prayer.name, { status: isPrayed ? 'none' : 'on_time' })}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          isPrayed ? "bg-gold text-foreground" : "bg-secondary"
                        )}>
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="font-medium">{prayer.displayName}</span>
                          <p className="text-xs text-muted-foreground">{prayer.reward}</p>
                        </div>
                      </div>
                      {isPrayed && <Check className="h-5 w-5 text-gold" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* QURAN TAB */}
        <TabsContent value="quran" className="space-y-4">
          <Tabs defaultValue="reading" className="w-full">
            <TabsList className="w-full max-w-sm mb-4">
              <TabsTrigger value="reading" className="flex-1">Reading</TabsTrigger>
              <TabsTrigger value="memorization" className="flex-1">Memorization</TabsTrigger>
            </TabsList>

            <TabsContent value="reading" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Quran Reading Progress</h3>
                <Dialog open={quranDialogOpen} onOpenChange={setQuranDialogOpen}>
                  <DialogTrigger asChild>
                    <Button><Plus className="h-4 w-4 mr-2" />Log Session</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Log Quran Session</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <Select value={quranForm.type} onValueChange={(v) => setQuranForm(prev => ({ ...prev, type: v as QuranProgress['type'] }))}>
                        <SelectTrigger><SelectValue placeholder="Session Type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reading">Reading (+{SPI_POINTS.quranPage}/page)</SelectItem>
                          <SelectItem value="revision">Revision</SelectItem>
                          <SelectItem value="tafsir">Tafsir Study</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Select Surah</label>
                        <div className="relative">
                          <Input
                            placeholder="Type to search surah..."
                            value={surahSearchText}
                            onChange={(e) => setSurahSearchText(e.target.value)}
                            className="mb-2"
                          />
                          <Select
                            value={String(quranForm.surahNumber)}
                            onValueChange={(v) => {
                              const sNum = parseInt(v);
                              const surah = SURAHS.find(s => s.number === sNum);
                              setQuranForm(prev => ({
                                ...prev,
                                surahNumber: sNum,
                                endAyah: surah?.verses || 1
                              }));
                            }}
                          >
                            <SelectTrigger><SelectValue placeholder="Surah" /></SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                              {filteredSurahs.map(s => (
                                <SelectItem key={s.number} value={String(s.number)}>{s.number}. {s.name} ({s.verses} v)</SelectItem>
                              ))}
                              {filteredSurahs.length === 0 && <p className="p-2 text-xs text-muted-foreground">No surahs found</p>}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm text-muted-foreground">Start Ayah</label>
                          <Input type="number" value={quranForm.startAyah} onChange={(e) => setQuranForm(prev => ({ ...prev, startAyah: parseInt(e.target.value) || 1 }))} min={1} />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">End Ayah</label>
                          <Input type="number" value={quranForm.endAyah} onChange={(e) => setQuranForm(prev => ({ ...prev, endAyah: parseInt(e.target.value) || 1 }))} min={1} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm text-muted-foreground">Pages Read</label>
                          <Input type="number" value={quranForm.pagesRead} onChange={(e) => setQuranForm(prev => ({ ...prev, pagesRead: parseInt(e.target.value) || 0 }))} min={0} />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Duration (min)</label>
                          <Input type="number" value={quranForm.duration} onChange={(e) => setQuranForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))} min={0} />
                        </div>
                      </div>
                      <Textarea placeholder="Notes (optional)" value={quranForm.notes} onChange={(e) => setQuranForm(prev => ({ ...prev, notes: e.target.value }))} />
                      <Button onClick={handleAddQuranProgress} className="w-full">Add Session</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Monthly Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bento-card text-center">
                  <BookOpen className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold text-primary">{monthlyQuranStats.pagesRead}</p>
                  <p className="text-xs text-muted-foreground">Pages This Month</p>
                </div>
                <div className="bento-card text-center">
                  <Calendar className="h-5 w-5 mx-auto mb-2 text-gold" />
                  <p className="text-2xl font-bold text-gold">{monthlyQuranStats.sessionsCount}</p>
                  <p className="text-xs text-muted-foreground">Sessions</p>
                </div>
                <div className="bento-card text-center">
                  <Clock className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{monthlyQuranStats.totalMinutes}</p>
                  <p className="text-xs text-muted-foreground">Minutes</p>
                </div>
                <div className="bento-card text-center">
                  <BookMarked className="h-5 w-5 mx-auto mb-2 text-gold" />
                  <p className="text-2xl font-bold text-gold">{monthlyQuranStats.memorized}</p>
                  <p className="text-xs text-muted-foreground">Memorization Sessions</p>
                </div>
              </div>

              {/* Today's Progress */}
              <div className="bento-card">
                <h3 className="font-medium mb-4">Today's Reading Progress</h3>
                <div className="text-center py-6">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <p className="text-4xl font-bold text-primary">{todayQuranPages}</p>
                  <p className="text-muted-foreground">pages read today</p>
                  <p className="text-sm text-gold mt-2">+{todayQuranPages * SPI_POINTS.quranPage} SPI</p>
                </div>
              </div>

              {/* Recent Sessions */}
              <div className="bento-card">
                <h3 className="font-medium mb-4">Recent Sessions</h3>
                {quranProgress.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6">No sessions recorded yet</p>
                ) : (
                  <div className="space-y-2">
                    {quranProgress.slice(0, 10).map(session => (
                      <div key={session.id} className="flex items-center justify-between py-3 px-4 rounded-lg bg-secondary/30">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={cn(
                            session.type === 'memorization' && "border-gold text-gold",
                            session.type === 'reading' && "border-primary text-primary"
                          )}>
                            {session.type}
                          </Badge>
                          <div>
                            <p className="font-medium">{session.surah_name}</p>
                            <p className="text-xs text-muted-foreground">
                              Ayah {session.ayah_from}-{session.ayah_to} • {format(parseISO(session.date), 'MMM d')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{session.pages_read} pages</span>
                          {session.duration_minutes && <p className="text-xs text-muted-foreground">{session.duration_minutes} min</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="memorization">
              <QuranMemorization />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* DHIKR TAB */}
        <TabsContent value="dhikr" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Dhikr & Adhkar</h3>
            <Dialog open={dhikrDialogOpen} onOpenChange={setDhikrDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Custom Dhikr</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Custom Dhikr</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input placeholder="Dhikr name" value={dhikrForm.name} onChange={(e) => setDhikrForm(prev => ({ ...prev, name: e.target.value }))} />
                  <div>
                    <label className="text-sm text-muted-foreground">Target Count</label>
                    <Input type="number" value={dhikrForm.targetCount} onChange={(e) => setDhikrForm(prev => ({ ...prev, targetCount: parseInt(e.target.value) || 33 }))} min={1} />
                  </div>
                  <Select value={dhikrForm.type} onValueChange={(v) => setDhikrForm(prev => ({ ...prev, type: v as ZikrEntry['type'] }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
                      <SelectItem value="sleep">Before Sleep</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => handleAddDhikr()} className="w-full" disabled={!dhikrForm.name.trim()}>Add Dhikr</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Quick Add Presets */}
          <div className="bento-card">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Quick Add Common Dhikr</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {DHIKR_PRESETS.map(preset => (
                <Button
                  key={preset.name}
                  variant="outline"
                  className="h-auto py-3 flex-col"
                  onClick={() => handleAddDhikr(preset)}
                >
                  <span className="text-lg font-arabic">{preset.arabic}</span>
                  <span className="text-xs text-muted-foreground mt-1">{preset.name} x{preset.target}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Today's Dhikr */}
          <div className="space-y-3">
            <h4 className="font-medium">Today's Dhikr</h4>
            {todayDhikr.length === 0 ? (
              <div className="bento-card text-center py-8">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No dhikr added for today</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {todayDhikr.map(dhikr => {
                  const targetCount = dhikr.target_count || 33;
                  const completedCount = dhikr.count || 0;
                  const isComplete = completedCount >= targetCount;
                  const progress = (completedCount / targetCount) * 100;

                  return (
                    <div key={dhikr.id} className={cn(
                      "bento-card transition-all",
                      isComplete && "border-primary/30 bg-green-light"
                    )}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{dhikr.notes || dhikr.type}</h4>
                          <p className="text-sm text-muted-foreground">{completedCount}/{targetCount}</p>
                        </div>
                        {isComplete ? (
                          <Badge className="bg-primary text-primary-foreground"><Check className="h-3 w-3 mr-1" />Done</Badge>
                        ) : (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateDhikrCount(dhikr.id, completedCount - 1, targetCount)}
                              disabled={completedCount <= 0}
                            >
                              -
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateDhikrCount(dhikr.id, completedCount + 1, targetCount)}
                              disabled={isComplete}
                            >
                              +
                            </Button>
                          </div>
                        )}
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Adhkar Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Morning Adhkar', 'Evening Adhkar', 'Sleep Adhkar', 'After Prayer'].map((type, i) => {
              const completed = zikrEntries.filter(z => z.date === today && z.notes === type).length > 0;

              return (
                <div
                  key={type}
                  className={cn(
                    "bento-card cursor-pointer transition-all",
                    completed && "border-primary/30 bg-green-light"
                  )}
                  onClick={() => {
                    if (!completed) {
                      createZikrEntry({
                        date: today,
                        type: i === 0 ? 'morning' : i === 1 ? 'evening' : i === 2 ? 'sleep' : 'custom',
                        notes: type,
                        target_count: 1,
                        completed_count: 1,
                      } as any);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-3 rounded-xl",
                        completed ? "bg-primary text-primary-foreground" : "bg-secondary"
                      )}>
                        <Heart className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-sm">{type}</span>
                    </div>
                    {completed && <Check className="h-5 w-5 text-primary" />}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* FASTING TAB */}
        <TabsContent value="fasting" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Fasting Tracker</h3>
            <Dialog open={fastingDialogOpen} onOpenChange={setFastingDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Log Fast</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Fasting Day</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 pt-4">
                  {FASTING_TYPES.map(type => (
                    <Button
                      key={type.value}
                      variant="outline"
                      className="w-full justify-between h-auto py-3"
                      onClick={() => handleAddFasting(type.value)}
                    >
                      <span>{type.label}</span>
                      <Badge variant="secondary">+{type.points} SPI</Badge>
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Fasting Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bento-card text-center">
              <Utensils className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-primary">{fastingRecords.filter(f => f.is_completed).length}</p>
              <p className="text-xs text-muted-foreground">Total Fasts</p>
            </div>
            <div className="bento-card text-center">
              <Calendar className="h-5 w-5 mx-auto mb-2 text-gold" />
              <p className="text-2xl font-bold text-gold">
                {fastingRecords.filter(f => f.type === 'monday_thursday' && f.is_completed).length}
              </p>
              <p className="text-xs text-muted-foreground">Mon/Thu Fasts</p>
            </div>
            <div className="bento-card text-center">
              <Star className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">
                {fastingRecords.filter(f => f.type === 'white_days' && f.is_completed).length}
              </p>
              <p className="text-xs text-muted-foreground">White Days</p>
            </div>
            <div className="bento-card text-center gradient-gold">
              <Zap className="h-5 w-5 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {fastingRecords.filter(f => f.is_completed).reduce((sum, f) => sum + (FASTING_TYPES.find(ft => ft.value === f.type)?.points || 20), 0)}
              </p>
              <p className="text-xs opacity-80">Total SPI</p>
            </div>
          </div>

          {/* Today's Fast */}
          {todayFasting.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Today's Fast</h4>
              {todayFasting.map(fast => {
                const points = FASTING_TYPES.find(t => t.value === fast.type)?.points || 20;
                return (
                  <div
                    key={fast.id}
                    className={cn(
                      "bento-card flex items-center justify-between cursor-pointer",
                      fast.is_completed && "border-primary/30 bg-green-light"
                    )}
                    onClick={() => handleToggleFasting(fast.id, !!fast.is_completed)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-3 rounded-xl",
                        fast.is_completed ? "bg-primary text-primary-foreground" : "bg-secondary"
                      )}>
                        <Utensils className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{FASTING_TYPES.find(t => t.value === fast.type)?.label}</p>
                        <p className="text-sm text-muted-foreground">+{points} SPI</p>
                      </div>
                    </div>
                    {fast.is_completed ? (
                      <Badge className="bg-primary text-primary-foreground"><Check className="h-3 w-3 mr-1" />Completed</Badge>
                    ) : (
                      <Badge variant="outline">In Progress</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Recent Fasts */}
          <div className="bento-card">
            <h4 className="font-medium mb-4">Recent Fasting Days</h4>
            {fastingRecords.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">No fasting records yet</p>
            ) : (
              <div className="space-y-2">
                {fastingRecords.slice(0, 10).map(fast => {
                  const points = FASTING_TYPES.find(t => t.value === fast.type)?.points || 20;
                  return (
                    <div key={fast.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30">
                      <div className="flex items-center gap-3">
                        <Badge variant={fast.is_completed ? "default" : "outline"}>
                          {FASTING_TYPES.find(t => t.value === fast.type)?.label}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(parseISO(fast.date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <span className={cn("font-medium", fast.is_completed ? "text-primary" : "text-muted-foreground")}>
                        {fast.is_completed ? `+${points} SPI` : 'Incomplete'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* DUAS TAB */}
        <TabsContent value="duas" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Dua Collection</h3>
            <Dialog open={duaDialogOpen} onOpenChange={setDuaDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Add Dua</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New Dua</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input placeholder="Dua title" value={duaForm.title} onChange={(e) => setDuaForm(prev => ({ ...prev, title: e.target.value }))} />
                  <Textarea placeholder="Arabic text (optional)" value={duaForm.arabic} onChange={(e) => setDuaForm(prev => ({ ...prev, arabic: e.target.value }))} className="font-arabic text-lg text-right" dir="rtl" />
                  <Input placeholder="Transliteration (optional)" value={duaForm.transliteration} onChange={(e) => setDuaForm(prev => ({ ...prev, transliteration: e.target.value }))} />
                  <Textarea placeholder="Translation / Meaning" value={duaForm.translation} onChange={(e) => setDuaForm(prev => ({ ...prev, translation: e.target.value }))} />
                  <div className="grid grid-cols-2 gap-3">
                    <Select value={duaForm.category} onValueChange={(v) => setDuaForm(prev => ({ ...prev, category: v as Dua['category'] }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="protection">Protection</SelectItem>
                        <SelectItem value="gratitude">Gratitude</SelectItem>
                        <SelectItem value="guidance">Guidance</SelectItem>
                        <SelectItem value="forgiveness">Forgiveness</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder="Source (optional)" value={duaForm.source} onChange={(e) => setDuaForm(prev => ({ ...prev, source: e.target.value }))} />
                  </div>
                  <Button onClick={handleAddDua} className="w-full" disabled={!duaForm.title.trim() || !duaForm.translation.trim()}>Add Dua</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Dua Categories */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {['daily', 'protection', 'gratitude', 'guidance', 'forgiveness', 'custom'].map(cat => {
              const count = duas.filter(d => d.category === cat).length;
              return (
                <div key={cat} className="bento-card">
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">{cat}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dua List */}
          {duas.length === 0 ? (
            <div className="bento-card text-center py-12">
              <Hand className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No duas saved yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {duas.map(dua => (
                <div key={dua.id} className="bento-card">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h4 className="font-medium">{dua.title}</h4>
                      <Badge variant="outline" className="mt-1 capitalize">{dua.category || 'General'}</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => updateDua({
                        id: dua.id,
                        is_favorite: !dua.is_favorite
                      })}
                    >
                      <Star className={cn("h-4 w-4", dua.is_favorite && "fill-gold text-gold")} />
                    </Button>
                  </div>
                  {dua.arabic_text && (
                    <p className="text-xl font-arabic text-right mb-2 leading-loose" dir="rtl">{dua.arabic_text}</p>
                  )}
                  {dua.transliteration && (
                    <p className="text-sm italic text-muted-foreground mb-2">{dua.transliteration}</p>
                  )}
                  <p className="text-sm">{dua.translation}</p>
                  {(dua as any).source && (
                    <p className="text-xs text-muted-foreground mt-2">Source: {(dua as any).source}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}