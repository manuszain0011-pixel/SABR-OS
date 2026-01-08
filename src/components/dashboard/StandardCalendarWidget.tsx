import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, addDays, startOfWeek } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';

export function StandardCalendarWidget() {
    const { tasks } = useApp();
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: calendarStart, end: addDays(monthEnd, 6 - getDay(monthEnd)) });

    const getDayData = (day: Date) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayTasks = tasks.filter(t => t.due_date === dateStr);
        const completedTasks = dayTasks.filter(t => t.status === 'completed').length;
        return { tasksTotal: dayTasks.length, tasksCompleted: completedTasks };
    };

    const today = new Date();

    return (
        <div className="bento-card group flex flex-col h-full animate-fade-in-up delay-400 relative overflow-hidden">
            {/* Mesh Gradient Background (Internal) */}
            <div className="absolute inset-0 opacity-10 pointer-events-none transition-opacity group-hover:opacity-20">
                <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-secondary blur-[80px]" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-primary blur-[80px]" />
            </div>

            {/* Symmetric Header */}
            <div className="relative flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-2xl bg-secondary/50 border border-border/50">
                        <Calendar className="h-6 w-6 text-foreground/80" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-widest text-foreground/80">{format(currentMonth, 'MMMM')}</h3>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em]">{format(currentMonth, 'yyyy')}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl bg-secondary/50 border border-border/50 hover:bg-primary/20 hover:border-primary/50" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl bg-secondary/50 border border-border/50 hover:bg-primary/20 hover:border-primary/50" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Symmetric Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 flex-grow">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="text-center text-[10px] font-bold text-muted-foreground/40 uppercase py-2">
                        {day.slice(0, 2)}
                    </div>
                ))}
                {days.map((day, i) => {
                    const isCurrentMonth = format(day, 'M') === format(currentMonth, 'M');
                    const isToday = isSameDay(day, today);
                    const { tasksTotal, tasksCompleted } = getDayData(day);
                    const hasTasks = tasksTotal > 0;
                    const allTasksDone = tasksTotal > 0 && tasksCompleted === tasksTotal;

                    return (
                        <div
                            key={i}
                            className={cn(
                                "aspect-square flex flex-col items-center justify-center rounded-xl relative transition-all",
                                !isCurrentMonth && "opacity-20 grayscale-100",
                                isToday ? "bg-primary text-primary-foreground shadow-lg font-bold" : "hover:bg-secondary cursor-pointer border border-transparent hover:border-border",
                                !isToday && hasTasks && allTasksDone && "bg-gold/10"
                            )}
                        >
                            <span className="text-sm">{format(day, 'd')}</span>
                            {isCurrentMonth && hasTasks && (
                                <div className="absolute top-1 right-1">
                                    <div className={cn(
                                        "w-1 h-1 rounded-full",
                                        allTasksDone ? "bg-gold" : "bg-gold/40"
                                    )} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Symmetric Footer */}
            <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>Today</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                        <span>Task Done</span>
                    </div>
                </div>
                <span className="opacity-50 tracking-tighter uppercase">System View</span>
            </div>
        </div>
    );
}
