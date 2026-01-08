import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Timer, Trophy, Zap, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export function DeepWorkTimer() {
    const { user } = useAuth();
    const [workDuration, setWorkDuration] = useState(25);
    const [breakDuration, setBreakDuration] = useState(5);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'work' | 'break'>('work');
    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

    const toggleTimer = () => {
        if (!isActive) {
            // Starting timer
            setSessionStartTime(new Date());
        }
        setIsActive(!isActive);
    };

    const saveCompletedSession = async (durationMinutes: number, sessionMode: 'work' | 'break') => {
        if (!user || !sessionStartTime) return;

        try {
            await supabase.from('deep_work_sessions').insert({
                user_id: user.id,
                duration_minutes: durationMinutes,
                mode: sessionMode,
                completed: true,
                started_at: sessionStartTime.toISOString(),
                ended_at: new Date().toISOString()
            });

            if (sessionMode === 'work') {
                toast.success(`🎯 Deep work session completed! (${durationMinutes} min)`);
            }
        } catch (error) {
            console.error('Failed to save session:', error);
        }
    };

    const resetTimer = useCallback(() => {
        setIsActive(false);
        setTimeLeft(mode === 'work' ? workDuration * 60 : breakDuration * 60);
        setSessionStartTime(null);
    }, [mode, workDuration, breakDuration]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            if (mode === 'work') {
                // Save completed work session
                saveCompletedSession(workDuration, 'work');
                setSessionsCompleted(s => s + 1);
                setMode('break');
                setTimeLeft(breakDuration * 60);
                setSessionStartTime(null);
            } else {
                // Save completed break session
                saveCompletedSession(breakDuration, 'break');
                setMode('work');
                setTimeLeft(workDuration * 60);
                setSessionStartTime(null);
            }
            setIsActive(false);
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode, workDuration, breakDuration]);

    // Load today's completed sessions count on mount
    useEffect(() => {
        const loadTodaysSessions = async () => {
            if (!user) return;

            const today = new Date().toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('deep_work_sessions')
                .select('*')
                .eq('user_id', user.id)
                .eq('date', today)
                .eq('mode', 'work')
                .eq('completed', true);

            if (!error && data) {
                setSessionsCompleted(data.length);
            }
        };

        loadTodaysSessions();
    }, [user]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const currentTotalSeconds = mode === 'work' ? workDuration * 60 : breakDuration * 60;
    const progress = (timeLeft / currentTotalSeconds) * 100;

    const adjustDuration = (amount: number) => {
        if (isActive) return;
        if (mode === 'work') {
            const newDur = Math.max(1, workDuration + amount);
            setWorkDuration(newDur);
            setTimeLeft(newDur * 60);
        } else {
            const newDur = Math.max(1, breakDuration + amount);
            setBreakDuration(newDur);
            setTimeLeft(newDur * 60);
        }
    };

    return (
        <div className={cn(
            "bento-card relative overflow-hidden transition-all duration-500 h-full flex flex-col justify-between",
            isActive && mode === 'work' ? "ring-2 ring-primary shadow-2xl shadow-primary/10 scale-[1.02]" : ""
        )}>
            {/* Dynamic Background Glow */}
            <div className={cn(
                "absolute inset-0 opacity-10 blur-3xl transition-all duration-1000",
                isActive ? (mode === 'work' ? "bg-primary" : "bg-gold") : "bg-transparent"
            )} />

            <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-3 rounded-2xl shadow-sm transition-colors",
                            mode === 'work' ? "bg-primary/10 text-primary" : "bg-gold/10 text-gold"
                        )}>
                            <Timer className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold tracking-tight">
                                {mode === 'work' ? "Deep Work Session" : "Short Break"}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] leading-none mt-1">
                                {isActive ? "Flow State Active" : "Paused"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-xl border border-border/50">
                        <Trophy className="h-3 w-3 text-gold" />
                        <span className="text-xs font-black">{sessionsCompleted}</span>
                    </div>
                </div>

                <div className="text-center">
                    <div className="relative inline-block mb-4">
                        <h2 className="text-6xl font-black tracking-tighter font-mono leading-none">
                            {formatTime(timeLeft)}
                        </h2>
                        {isActive && mode === 'work' && (
                            <div className="absolute -right-10 top-0 animate-pulse text-primary">
                                <Zap className="h-6 w-6 fill-primary" />
                            </div>
                        )}
                    </div>

                    {!isActive && (
                        <div className="flex items-center justify-center gap-4 mb-6 animate-fade-in">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full border-border/50"
                                onClick={() => adjustDuration(-5)}
                            >
                                <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                {mode === 'work' ? `${workDuration} min` : `${breakDuration} min`}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full border-border/50"
                                onClick={() => adjustDuration(5)}
                            >
                                <Plus className="h-3 w-3" />
                            </Button>
                        </div>
                    )}

                    <div className="flex items-center justify-center gap-3">
                        <Button
                            variant={isActive ? "outline" : "default"}
                            size="lg"
                            onClick={toggleTimer}
                            className={cn(
                                "rounded-2xl px-10 font-bold uppercase tracking-widest text-[11px] h-12",
                                !isActive && "bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary/90",
                                isActive && "border-2"
                            )}
                        >
                            {isActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2 fill-current" />}
                            {isActive ? "Pause" : "Start Focus"}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={resetTimer}
                            className="rounded-2xl h-12 w-12 hover:bg-secondary"
                        >
                            <RotateCcw className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Session Progress</span>
                        <span className={cn(
                            "text-xs font-black",
                            mode === 'work' ? "text-primary" : "text-gold"
                        )}>
                            {Math.round(100 - progress)}%
                        </span>
                    </div>
                    <Progress
                        value={100 - progress}
                        className={cn(
                            "h-1.5 relative rounded-full bg-secondary",
                            mode === 'work' ? "[&>div]:bg-primary" : "[&>div]:bg-gold"
                        )}
                    />
                </div>
            </div>
        </div>
    );
}
