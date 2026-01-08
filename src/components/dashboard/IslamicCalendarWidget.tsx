import { useState } from 'react';
import { Calendar, Moon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, addDays, startOfWeek } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { useHijriDate } from '@/hooks/useHijriDate';

export function IslamicCalendarWidget() {
  const { prayerRecords, tasks } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const hijriDate = useHijriDate();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: addDays(monthEnd, 6 - getDay(monthEnd)) });

  const getDayData = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const prayer = prayerRecords.find(p => p.date === dateStr);
    const dayTasks = tasks.filter(t => t.due_date === dateStr);
    const completedTasks = dayTasks.filter(t => t.status === 'completed').length;

    let prayerScore = 0;
    if (prayer) {
      const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
      prayers.forEach((p) => {
        const status = prayer[p];
        if (status && status !== 'pending' && status !== 'missed') {
          prayerScore++;
        }
      });
    }

    return { prayerScore, tasksTotal: dayTasks.length, tasksCompleted: completedTasks };
  };

  const today = new Date();

  return (
    <div className="bento-card animate-fade-in-up delay-400">
      {/* Hijri Date Header */}
      {hijriDate && (
        <div className="mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg bg-gold/10 border border-gold/20">
          <div className="flex items-center gap-2 text-gold mb-1">
            <Moon className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm font-medium">Islamic Date</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm sm:text-lg font-semibold text-foreground">
              {hijriDate}
            </p>
          </div>
        </div>
      )}

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <h3 className="font-semibold text-sm sm:text-base">{format(currentMonth, 'MMMM yyyy')}</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
          <div key={i} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
        {days.map((day, i) => {
          const isCurrentMonth = format(day, 'M') === format(currentMonth, 'M');
          const isToday = isSameDay(day, today);
          const { prayerScore, tasksTotal, tasksCompleted } = getDayData(day);
          const hasPrayers = prayerScore > 0;
          const hasTasks = tasksTotal > 0;
          const allTasksDone = tasksTotal > 0 && tasksCompleted === tasksTotal;
          const allPrayersDone = prayerScore === 5;

          return (
            <div
              key={i}
              className={cn(
                "aspect-square p-1 rounded-lg text-center relative transition-colors",
                !isCurrentMonth && "opacity-30",
                isToday && "bg-primary text-primary-foreground font-bold",
                !isToday && hasPrayers && allPrayersDone && "bg-green-light",
                !isToday && hasTasks && allTasksDone && "bg-gold/10",
                !isToday && isCurrentMonth && "hover:bg-secondary cursor-pointer"
              )}
            >
              <span className="text-sm">{format(day, 'd')}</span>
              {isCurrentMonth && (hasPrayers || hasTasks) && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {hasPrayers && (
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      allPrayersDone ? "bg-primary" : "bg-primary/40"
                    )} />
                  )}
                  {hasTasks && (
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      allTasksDone ? "bg-gold" : "bg-gold/40"
                    )} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-border flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span>Prayers</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-gold" />
          <span>Tasks</span>
        </div>
      </div>
    </div>
  );
}
