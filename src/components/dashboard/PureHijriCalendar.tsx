import { useState } from 'react';
import { Moon, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { isSameDay } from 'date-fns';



// Accurate Hijri Calculation
const getHijriDate = (date: Date) => {
    // Using 'islamic-umalqura' for the most accurate calculation
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        weekday: 'long'
    });
    const parts = formatter.formatToParts(date);
    const day = parts.find(p => p.type === 'day')?.value || '1';
    const month = parts.find(p => p.type === 'month')?.value || '';
    const year = parts.find(p => p.type === 'year')?.value || '';
    const weekday = parts.find(p => p.type === 'weekday')?.value || '';

    return {
        day: parseInt(day),
        month,
        year: year.replace(' AH', '').trim(),
        weekday
    };
};

export function PureHijriCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const today = new Date();
    const hToday = getHijriDate(currentDate);

    // Generate a fixed 30-day grid centered on the Hijri month
    const generateGrid = () => {
        const days = [];
        const startOfHijri = new Date(currentDate);
        startOfHijri.setDate(currentDate.getDate() - hToday.day + 1);

        // Show 30 days to cover a full lunar cycle
        for (let i = 0; i < 30; i++) {
            const d = new Date(startOfHijri);
            d.setDate(startOfHijri.getDate() + i);
            const info = getHijriDate(d);
            if (info.month === hToday.month) {
                days.push({
                    date: d,
                    hDay: info.day,
                    weekday: info.weekday
                });
            }
        }
        return days;
    };

    const days = generateGrid();

    return (
        <div className="bento-card group flex flex-col h-full animate-fade-in-up delay-400 relative overflow-hidden">
            {/* Mesh Gradient Background (Internal) */}
            <div className="absolute inset-0 opacity-10 pointer-events-none transition-opacity group-hover:opacity-20">
                <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-primary blur-[80px]" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-gold blur-[80px]" />
            </div>

            {/* Symmetric Header */}
            <div className="relative flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20">
                        <Moon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-widest text-primary">{hToday.month}</h3>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em]">{hToday.year} AH</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl bg-secondary/50 border border-border/50 hover:bg-primary/20 hover:border-primary/50" onClick={() => {
                        const d = new Date(currentDate);
                        d.setDate(d.getDate() - 29);
                        setCurrentDate(d);
                    }}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl bg-secondary/50 border border-border/50 hover:bg-primary/20 hover:border-primary/50" onClick={() => {
                        const d = new Date(currentDate);
                        d.setDate(d.getDate() + 29);
                        setCurrentDate(d);
                    }}>
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Symmetric Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 flex-grow">
                {['1', '2', '3', '4', '5', '6', '7'].map((d) => (
                    <div key={d} className="text-center text-[10px] font-bold text-primary/40 uppercase py-2">
                        D{d}
                    </div>
                ))}
                {days.map((dt, i) => {
                    const isToday = isSameDay(dt.date, today);
                    const isFriday = dt.weekday === 'Friday';

                    return (
                        <div
                            key={i}
                            className={cn(
                                "aspect-square flex flex-col items-center justify-center rounded-xl transition-all relative",
                                isToday ? "bg-primary text-primary-foreground shadow-lg font-bold" : "hover:bg-primary/5 border border-transparent hover:border-primary/10",
                                isFriday && !isToday && "bg-gold/5 border-gold/20"
                            )}
                        >
                            <span className="text-sm">{dt.hDay}</span>
                            {isFriday && !isToday && (
                                <Star className="absolute top-1 right-1 h-2 w-2 text-gold fill-current" />
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
                        <span>Lunar Active</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                        <span>Jumu'ah</span>
                    </div>
                </div>
                <span className="opacity-50 tracking-tighter uppercase">Islamic Path</span>
            </div>
        </div>
    );
}
