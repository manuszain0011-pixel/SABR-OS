import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { useApp } from '@/context/AppContext';
import { Clock, MapPin, Edit2, Check, X, Moon, Sun, Sunset, Settings, RotateCcw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CitySearchWidget } from './CitySearchWidget';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const PRAYER_ICONS: Record<string, typeof Moon> = {
  fajr: Moon,
  dhuhr: Sun,
  asr: Sun,
  maghrib: Sunset,
  isha: Moon,
};

const PRAYER_NAMES = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
type PrayerNameType = typeof PRAYER_NAMES[number];

export function PrayerTimesWidget() {
  const { settings, updateSettings, todayPrayerRecord } = useApp();

  // Get custom prayer times from settings
  const customTimes: Record<string, string | undefined> = settings?.custom_prayer_times
    ? (typeof settings.custom_prayer_times === 'object' ? settings.custom_prayer_times as Record<string, string> : {})
    : {};

  const { prayerTimes, loading, error, nextPrayer } = usePrayerTimes(
    settings?.city || 'London',
    settings?.country || 'UK',
    settings?.latitude || undefined,
    settings?.longitude || undefined,
    settings?.prayer_calculation_method === 'hanafi' ? 1 : 1, // Madhab
    settings?.prayer_calculation_method || 'MuslimWorldLeague',
    customTimes
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showTimeEditor, setShowTimeEditor] = useState(false);
  const [editingTimes, setEditingTimes] = useState<Record<string, string>>({});

  const handleLocationSelect = async (city: string, country: string, latitude?: number, longitude?: number) => {
    try {
      setIsSaving(true);
      await updateSettings({
        city,
        country,
        latitude,
        longitude
      });
      setIsSaving(false);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update location:", err);
      setIsSaving(false);
    }
  };

  const handleSetCustomTime = (prayer: PrayerNameType, time: string) => {
    console.log('Setting custom time for', prayer, ':', time);
    setEditingTimes(prev => {
      const updated = { ...prev, [prayer]: time };
      console.log('Updated editingTimes:', updated);
      return updated;
    });
  };

  const handleSaveCustomTimes = async () => {
    try {
      setIsSaving(true);

      // Convert editingTimes to the format expected by settings
      const customPrayerTimes: Record<string, string> = {};
      Object.entries(editingTimes).forEach(([prayer, time]) => {
        if (time) {
          customPrayerTimes[prayer] = time;
        }
      });

      // Save to database
      console.log('🕌 About to save:', customPrayerTimes);
      await updateSettings({
        custom_prayer_times: customPrayerTimes
      });
      console.log('✅ Save completed successfully!');

      setIsSaving(false);
      setShowTimeEditor(false);
      setEditingTimes({});
    } catch (err) {
      console.error("❌ Failed to save custom times:", err);
      alert('Error saving prayer times: ' + (err as Error).message);
      setIsSaving(false);
    }
  };

  const handleClearCustomTime = (prayer: PrayerNameType) => {
    setEditingTimes(prev => {
      const updated = { ...prev };
      delete updated[prayer];
      return updated;
    });
  };

  const handleResetAllCustomTimes = async () => {
    try {
      setIsSaving(true);
      // Clear all custom times from database
      await updateSettings({
        custom_prayer_times: {}
      });
      setEditingTimes({});
      setIsSaving(false);
    } catch (err) {
      console.error("Failed to reset custom times:", err);
      setIsSaving(false);
    }
  };

  const COMPLETED_PRAYER_STATUSES = new Set(['jamaah', 'on_time', 'late', 'qada']);

  const prayerStats = (() => {
    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
    let completed = 0;
    prayers.forEach((p) => {
      const status = todayPrayerRecord?.[p];
      if (status && status !== 'pending' && status !== 'missed') {
        completed++;
      }
    });
    return { completed, total: 5 };
  })();

  const hasAnyCustomTime = Object.values(editingTimes).some(v => v);

  const openTimeEditor = () => {
    const initial: Record<string, string> = {};
    prayerTimes.forEach(p => {
      initial[p.name] = p.time.replace(' (BST)', '').replace(' (GMT)', '');
    });
    console.log('Opening time editor with initial times:', initial);
    setEditingTimes(initial);
    setShowTimeEditor(true);
  };

  return (
    <div
      className={cn(
        "bento-card group relative h-full border-none shadow-none transition-all duration-500 text-white",
        (isEditing || showTimeEditor) ? "overflow-visible z-[70]" : "overflow-hidden"
      )}
      style={{
        background: 'linear-gradient(145deg, #0b5b42, #084a36)',
      }}
    >
      {/* Dynamic Glow Effect */}
      <div className="absolute -top-[20%] -right-[20%] w-[60%] h-[60%] rounded-full bg-white/10 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-[20%] -left-[20%] w-[60%] h-[60%] rounded-full bg-emerald-400/10 blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="relative flex items-center justify-between mb-8">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
              <Clock className="h-7 w-7 text-white animate-pulse-soft" />
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-[0.2em] text-white">Salat Times</h3>
              {!isEditing && !showTimeEditor && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 text-[11px] font-black text-white/50 hover:text-white transition-all uppercase tracking-[0.2em]"
                >
                  <MapPin className="h-3 w-3" />
                  <span>{settings?.city || 'London'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-2xl bg-white/5 border-none hover:bg-white/10 transition-all shadow-inner text-white"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <X className="h-6 w-6" /> : <Settings className="h-6 w-6" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-12 w-12 rounded-2xl bg-white/5 border-none hover:bg-white/10 transition-all shadow-inner text-white",
              showTimeEditor && "bg-white/10"
            )}
            onClick={() => showTimeEditor ? setShowTimeEditor(false) : openTimeEditor()}
          >
            {showTimeEditor ? <X className="h-6 w-6" /> : <Edit2 className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Editor Panels (High Legend Contrast) */}
      {(showTimeEditor || isEditing) && (
        <div className="relative z-[60] mb-6 p-4 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 space-y-4 animate-scale-in">
          {showTimeEditor ? (
            <>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-sm font-bold uppercase tracking-wider text-white">Adjustment Mode</span>
                <Button variant="ghost" size="sm" onClick={handleResetAllCustomTimes} className="h-7 text-[10px] text-white/60 hover:text-white">
                  <RotateCcw className="h-3 w-3 mr-1" /> Reset
                </Button>
              </div>
              <div className="space-y-3">
                {PRAYER_NAMES.map((prayer) => (
                  <div key={prayer} className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase w-20 text-white/80">{prayer}</span>
                    <Input
                      type="text"
                      value={editingTimes[prayer] || ''}
                      onChange={(e) => handleSetCustomTime(prayer, e.target.value)}
                      className="h-9 w-24 bg-white/10 border-white/20 text-white font-mono text-center focus:ring-1 focus:ring-white/50"
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={handleSaveCustomTimes}
                  className="w-full bg-white text-emerald-900 font-black hover:bg-white/90"
                >
                  Apply Changes
                </Button>
              </div>
            </>
          ) : (
            <CitySearchWidget
              onSelect={handleLocationSelect}
              currentCity={settings?.city || 'London'}
              currentCountry={settings?.country || 'UK'}
            />
          )}
        </div>
      )}

      {/* Next Prayer Spotlight */}
      {nextPrayer && !loading && !showTimeEditor && !isEditing && (
        <div className="relative mb-8 p-5 rounded-[1.75rem] bg-[#0b5b42] shadow-[inset_4px_4px_10px_rgba(0,0,0,0.2),inset_-4px_-4px_10px_rgba(255,255,255,0.05)] overflow-hidden group/next border border-white/5">
          <div className="relative flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Up Next</p>
              <h2 className="text-3xl font-black tracking-tighter text-white drop-shadow-md truncate leading-none">{nextPrayer.name}</h2>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-black text-white leading-none">{nextPrayer.timeRemaining}</p>
              <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-1">Countdown</p>
            </div>
          </div>
        </div>
      )}

      {/* Prayer Times List (Classic Glass Rows) */}
      <div className="relative space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-white/50" />
          </div>
        ) : (
          prayerTimes.map((prayer) => {
            const Icon = PRAYER_ICONS[prayer.name] || Moon;
            const status = todayPrayerRecord?.[prayer.name as keyof typeof todayPrayerRecord];
            const isPrayed = status && typeof status === 'string' && status !== 'pending' && status !== 'missed';
            const isNext = nextPrayer?.name === prayer.displayName;

            return (
              <div
                key={prayer.name}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl transition-all duration-300",
                  isNext ? "bg-[#0b5b42] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-4px_-4px_12px_rgba(255,255,255,0.05)] scale-[1.02] border border-white/10" : "hover:bg-white/5",
                  isPrayed && "opacity-40"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-2.5 rounded-xl shadow-inner",
                    isNext ? "bg-white text-emerald-900" : "bg-white/10 text-white"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={cn(
                    "text-sm font-black uppercase tracking-widest text-white",
                    isPrayed && "line-through"
                  )}>
                    {prayer.displayName}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-base font-black text-white">
                    {prayer.time.replace(' (BST)', '').replace(' (GMT)', '')}
                  </span>
                  {isPrayed && <Check className="h-5 w-5 text-white" />}
                  {isNext && <div className="h-2 w-2 rounded-full bg-white animate-ping" />}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Metrics */}
      <div className="relative mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
        <div className="flex flex-col">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Today's Journey</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-white">{prayerStats.completed}</span>
            <span className="text-white/40 font-black">/</span>
            <span className="text-xl font-bold text-white/40">5</span>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Success Rate</p>
          <div className="px-3 py-1 rounded-full bg-white/10 border border-white/10 font-black text-sm text-white">
            {Math.round((prayerStats.completed / 5) * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
}
