import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, startOfYear, endOfYear, eachDayOfInterval, isSameDay, subYears, addYears } from 'date-fns';
import { ChevronLeft, ChevronRight, TrendingUp, Calendar, Flame, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { HeatmapDay } from '@/types/dailyReview';

export default function LifeHeatmap() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [heatmapData, setHeatmapData] = useState<Map<string, HeatmapDay>>(new Map());
    const [selectedDay, setSelectedDay] = useState<HeatmapDay | null>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalDays: 0,
        activeDays: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageScore: 0
    });

    useEffect(() => {
        if (user) {
            fetchYearData();
        } else {
            setLoading(false);
        }
    }, [user, selectedYear]);

    const fetchYearData = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const yearStart = format(startOfYear(new Date(selectedYear, 0, 1)), 'yyyy-MM-dd');
            const yearEnd = format(endOfYear(new Date(selectedYear, 0, 1)), 'yyyy-MM-dd');

            const { data, error } = await supabase
                .from('daily_activity_summary')
                .select('date, overall_score')
                .eq('user_id', user.id)
                .gte('date', yearStart)
                .lte('date', yearEnd);

            if (error) throw error;

            const dataMap = new Map<string, HeatmapDay>();
            data?.forEach(item => {
                dataMap.set(item.date, {
                    date: item.date,
                    score: item.overall_score || 0,
                    activities_count: 0,
                    has_reflection: false
                });
            });

            setHeatmapData(dataMap);
            calculateStats(dataMap);
        } catch (error) {
            console.error('Error fetching heatmap data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data: Map<string, HeatmapDay>) => {
        const days = Array.from(data.values());
        const activeDays = days.filter(d => d.score > 0);
        const totalScore = activeDays.reduce((sum, d) => sum + d.score, 0);
        const avgScore = activeDays.length > 0 ? Math.round(totalScore / activeDays.length) : 0;

        // Calculate streaks
        const sortedDates = Array.from(data.keys()).sort();
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;

        const today = format(new Date(), 'yyyy-MM-dd');
        let streakActive = false;

        for (let i = sortedDates.length - 1; i >= 0; i--) {
            const date = sortedDates[i];
            const dayData = data.get(date);

            if (dayData && dayData.score > 0) {
                tempStreak++;
                if (date === today || streakActive) {
                    currentStreak = tempStreak;
                    streakActive = true;
                }
                longestStreak = Math.max(longestStreak, tempStreak);
            } else {
                if (streakActive) break;
                tempStreak = 0;
            }
        }

        setStats({
            totalDays: 365,
            activeDays: activeDays.length,
            currentStreak,
            longestStreak,
            averageScore: avgScore
        });
    };

    const getScoreColor = (score: number) => {
        if (score === 0) return 'bg-muted/30';
        if (score >= 80) return 'bg-green-500 dark:bg-green-600';
        if (score >= 60) return 'bg-yellow-500 dark:bg-yellow-600';
        if (score >= 40) return 'bg-orange-500 dark:bg-orange-600';
        return 'bg-red-500 dark:bg-red-600';
    };

    const getScoreIntensity = (score: number) => {
        if (score === 0) return '';
        if (score >= 80) return 'opacity-100';
        if (score >= 60) return 'opacity-75';
        if (score >= 40) return 'opacity-50';
        return 'opacity-30';
    };

    const handleDayClick = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayData = heatmapData.get(dateStr);

        if (dayData) {
            setSelectedDay(dayData);
        } else {
            // Navigate to daily review for this date
            navigate(`/daily-review?date=${dateStr}`);
        }
    };

    const goToPreviousYear = () => setSelectedYear(selectedYear - 1);
    const goToNextYear = () => setSelectedYear(selectedYear + 1);
    const goToCurrentYear = () => setSelectedYear(new Date().getFullYear());

    // Generate calendar grid
    const yearStart = startOfYear(new Date(selectedYear, 0, 1));
    const yearEnd = endOfYear(new Date(selectedYear, 0, 1));
    const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });

    // Group by months
    const monthsData = allDays.reduce((acc, day) => {
        const month = format(day, 'MMM');
        if (!acc[month]) acc[month] = [];
        acc[month].push(day);
        return acc;
    }, {} as Record<string, Date[]>);

    const isCurrentYear = selectedYear === new Date().getFullYear();

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Life Heatmap</h1>
                        <p className="text-muted-foreground mt-1">Visualize your daily progress throughout the year</p>
                    </div>
                </motion.div>

                {/* Year Navigation */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bento-card flex items-center justify-between p-4"
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToPreviousYear}
                        className="hover:bg-primary/10"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>

                    <div className="flex items-center gap-4">
                        <Calendar className="w-5 h-5 text-primary" />
                        <span className="text-2xl font-bold text-foreground">{selectedYear}</span>
                        {!isCurrentYear && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToCurrentYear}
                                className="ml-4"
                            >
                                Current Year
                            </Button>
                        )}
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToNextYear}
                        disabled={isCurrentYear}
                        className="hover:bg-primary/10"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bento-card p-4"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <p className="text-xs text-muted-foreground">Active Days</p>
                        </div>
                        <p className="text-2xl font-black text-foreground">{stats.activeDays}</p>
                        <p className="text-xs text-muted-foreground">of {stats.totalDays}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bento-card p-4"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Flame className="w-4 h-4 text-orange-500" />
                            <p className="text-xs text-muted-foreground">Current Streak</p>
                        </div>
                        <p className="text-2xl font-black text-foreground">{stats.currentStreak}</p>
                        <p className="text-xs text-muted-foreground">days</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bento-card p-4"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-green-500" />
                            <p className="text-xs text-muted-foreground">Longest Streak</p>
                        </div>
                        <p className="text-2xl font-black text-foreground">{stats.longestStreak}</p>
                        <p className="text-xs text-muted-foreground">days</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bento-card p-4"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            <p className="text-xs text-muted-foreground">Avg Score</p>
                        </div>
                        <p className="text-2xl font-black text-foreground">{stats.averageScore}</p>
                        <p className="text-xs text-muted-foreground">out of 100</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bento-card p-4"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-purple-500" />
                            <p className="text-xs text-muted-foreground">Completion</p>
                        </div>
                        <p className="text-2xl font-black text-foreground">
                            {Math.round((stats.activeDays / stats.totalDays) * 100)}%
                        </p>
                        <p className="text-xs text-muted-foreground">of year</p>
                    </motion.div>
                </div>

                {/* Heatmap */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bento-card p-4 md:p-6"
                >
                    <h2 className="text-lg md:text-xl font-bold text-foreground mb-4 md:mb-6">Year at a Glance</h2>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                            <div className="inline-grid grid-cols-12 gap-2 md:gap-4 min-w-max">
                                {Object.entries(monthsData).map(([month, days], monthIndex) => (
                                    <div key={month} className="space-y-1 md:space-y-2">
                                        <p className="text-[10px] md:text-xs font-semibold text-muted-foreground text-center">{month}</p>
                                        <div className="grid grid-cols-7 gap-[2px] md:gap-1">
                                            {days.map((day, dayIndex) => {
                                                const dateStr = format(day, 'yyyy-MM-dd');
                                                const dayData = heatmapData.get(dateStr);
                                                const score = dayData?.score || 0;
                                                const isToday = isSameDay(day, new Date());

                                                return (
                                                    <button
                                                        key={dayIndex}
                                                        onClick={() => handleDayClick(day)}
                                                        className={`
                              w-2 h-2 md:w-3 md:h-3 rounded-[2px] md:rounded-sm 
                              transition-all hover:scale-150 hover:z-10
                              ${getScoreColor(score)} ${getScoreIntensity(score)}
                              ${isToday ? 'ring-1 md:ring-2 ring-primary ring-offset-[1px] md:ring-offset-1' : ''}
                            `}
                                                        title={`${format(day, 'MMM d, yyyy')} - Score: ${score}`}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-3 md:gap-6 mt-6 md:mt-8 pt-4 md:pt-6 border-t border-border">
                        <span className="text-[10px] md:text-xs text-muted-foreground">Less</span>
                        <div className="flex gap-[2px] md:gap-1">
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-sm bg-muted/30" />
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-sm bg-red-500 opacity-30" />
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-sm bg-orange-500 opacity-50" />
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-sm bg-yellow-500 opacity-75" />
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-sm bg-green-500 opacity-100" />
                        </div>
                        <span className="text-[10px] md:text-xs text-muted-foreground">More</span>
                    </div>
                </motion.div>

                {/* Selected Day Details */}
                {selectedDay && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bento-card p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-foreground">
                                {format(new Date(selectedDay.date), 'EEEE, MMMM d, yyyy')}
                            </h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/daily-review?date=${selectedDay.date}`)}
                            >
                                View Full Day
                            </Button>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <p className="text-4xl font-black text-primary">{selectedDay.score}</p>
                                <p className="text-xs text-muted-foreground">Overall Score</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
