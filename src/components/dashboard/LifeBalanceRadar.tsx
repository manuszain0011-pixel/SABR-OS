import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { useApp } from '@/context/AppContext';
import { useMemo } from 'react';
import { Shield, Brain, Heart, Wallet, Target } from 'lucide-react';

export function LifeBalanceRadar() {
    const { stats, goals, habits, projects, books } = useApp();

    const data = useMemo(() => {
        // Derive scores (0-100) from state

        // 1. Ibadat Score (from stats.prayerScoreToday)
        const ibadat = stats.prayerScoreToday;

        // 2. Wealth (Simplified: based on balance or projects related to career)
        const wealth = Math.min(100, (stats.monthlyBalance > 0 ? 70 : 30) + (stats.monthlyIncome > 0 ? 30 : 0));

        // 3. Knowledge (Based on books read or in progress)
        const knowledge = Math.min(100, (books.filter(b => b.status === 'read').length * 20) + (books.filter(b => b.status === 'reading').length * 10) || 40);

        // 4. Health/Wellness (Based on habits completion - simplified)
        const health = stats.habitStreakAvg > 0 ? Math.min(100, stats.habitStreakAvg * 10 + 50) : 50;

        // 5. Purpose/Projects (Based on projects and goals progress)
        const purpose = Math.min(100, (projects.filter(p => (p.status === 'completed')).length * 20) + (goals.filter(g => g.status === 'completed').length * 10) || 50);

        return [
            { subject: 'Ibadat', A: ibadat, fullMark: 100 },
            { subject: 'Wealth', A: wealth, fullMark: 100 },
            { subject: 'Knowledge', A: knowledge, fullMark: 100 },
            { subject: 'Wellness', A: health, fullMark: 100 },
            { subject: 'Purpose', A: purpose, fullMark: 100 },
        ];
    }, [stats, books, projects, goals, habits]);

    return (
        <div className="bento-card relative overflow-hidden h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-bold tracking-tight">Life Balance</h3>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Equilibrium Analysis</p>
                </div>
                <div className="flex gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/10" />
                </div>
            </div>

            <div className="flex-1 min-h-[200px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="currentColor" strokeOpacity={0.1} />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }}
                        />
                        <Radar
                            name="Balance"
                            dataKey="A"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.2}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="p-2 rounded-xl bg-secondary/50 border border-border/50">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Focus Area</p>
                    <p className="text-xs font-bold text-primary">Knowledge Expansion</p>
                </div>
                <div className="p-2 rounded-xl bg-secondary/50 border border-border/50">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Status</p>
                    <p className="text-xs font-bold text-gold">Growing</p>
                </div>
            </div>
        </div>
    );
}
