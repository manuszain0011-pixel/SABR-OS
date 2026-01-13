import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, addDays } from 'date-fns';
import {
    ChevronLeft, ChevronRight, Calendar, Moon, CheckSquare,
    TrendingUp, DollarSign, BookOpen, Heart, Sparkles,
    Edit3, Save, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import type { DailyActivitySummary, DailyReflection } from '@/types/dailyReview';

export default function DailyReview() {
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [summary, setSummary] = useState<DailyActivitySummary | null>(null);
    const [reflection, setReflection] = useState<DailyReflection | null>(null);
    const [isEditingReflection, setIsEditingReflection] = useState(false);
    const [reflectionText, setReflectionText] = useState('');
    const [loading, setLoading] = useState(true);

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const displayDate = format(selectedDate, 'EEEE, MMMM d, yyyy');
    const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;

    useEffect(() => {
        if (user) {
            fetchDayData();
        } else {
            setLoading(false);
        }
    }, [user, selectedDate]);

    const fetchDayData = async () => {
        if (!user) return;

        setLoading(true);
        try {
            // First, aggregate the latest data for this date
            await supabase.rpc('aggregate_daily_data', {
                p_user_id: user.id,
                p_date: dateStr
            });

            // Then fetch the summary
            const { data: summaryData } = await supabase
                .from('daily_activity_summary')
                .select('*')
                .eq('user_id', user.id)
                .eq('date', dateStr)
                .single();

            setSummary(summaryData);

            // Fetch reflection
            const { data: reflectionData } = await supabase
                .from('daily_reflections')
                .select('*')
                .eq('user_id', user.id)
                .eq('date', dateStr)
                .single();

            setReflection(reflectionData);
            setReflectionText(reflectionData?.reflection_text || '');
        } catch (error) {
            console.error('Error fetching day data:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveReflection = async () => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('daily_reflections')
                .upsert({
                    user_id: user.id,
                    date: dateStr,
                    reflection_text: reflectionText,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            toast.success('Reflection saved!');
            setIsEditingReflection(false);
            fetchDayData();
        } catch (error) {
            console.error('Error saving reflection:', error);
            toast.error('Failed to save reflection');
        }
    };

    const goToPreviousDay = () => setSelectedDate(subDays(selectedDate, 1));
    const goToNextDay = () => setSelectedDate(addDays(selectedDate, 1));
    const goToToday = () => setSelectedDate(new Date());

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 dark:text-green-400';
        if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
        if (score >= 40) return 'text-orange-600 dark:text-orange-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getScoreBgColor = (score: number) => {
        if (score >= 80) return 'bg-green-100 dark:bg-green-900/20';
        if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
        if (score >= 40) return 'bg-orange-100 dark:bg-orange-900/20';
        return 'bg-red-100 dark:bg-red-900/20';
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Daily Review</h1>
                        <p className="text-muted-foreground mt-1">Reflect on your day and track your progress</p>
                    </div>
                </motion.div>

                {/* Date Navigation */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bento-card flex items-center justify-between p-4"
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToPreviousDay}
                        className="hover:bg-primary/10"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>

                    <div className="flex items-center gap-4">
                        <Calendar className="w-5 h-5 text-primary" />
                        <span className="text-lg font-semibold text-foreground">{displayDate}</span>
                        {!isToday && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToToday}
                                className="ml-4"
                            >
                                Today
                            </Button>
                        )}
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToNextDay}
                        disabled={isToday}
                        className="hover:bg-primary/10"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </motion.div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Overall Score */}
                        {summary?.overall_score !== undefined && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className={`bento-card p-8 text-center ${getScoreBgColor(summary.overall_score)}`}
                            >
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Sparkles className="w-6 h-6 text-primary" />
                                    <h2 className="text-xl font-bold text-foreground">Overall Score</h2>
                                </div>
                                <div className={`text-6xl font-black ${getScoreColor(summary.overall_score)} mb-2`}>
                                    {summary.overall_score}
                                </div>
                                <p className="text-sm text-muted-foreground">out of 100</p>
                            </motion.div>
                        )}

                        {/* Category Scores Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Spiritual */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bento-card p-6"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Moon className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground">Spiritual</h3>
                                        {summary?.spiritual_score !== undefined && (
                                            <p className={`text-2xl font-black ${getScoreColor(summary.spiritual_score)}`}>
                                                {summary.spiritual_score}%
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Prayers</span>
                                        <span className="font-semibold text-foreground">
                                            {summary?.prayers_completed || 0}/{summary?.prayers_total || 5}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Quran Pages</span>
                                        <span className="font-semibold text-foreground">{summary?.quran_pages_read || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Dhikr Count</span>
                                        <span className="font-semibold text-foreground">{summary?.dhikr_count || 0}</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Productivity */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bento-card p-6"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                                        <CheckSquare className="w-6 h-6 text-accent" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground">Productivity</h3>
                                        {summary?.productivity_score !== undefined && (
                                            <p className={`text-2xl font-black ${getScoreColor(summary.productivity_score)}`}>
                                                {summary.productivity_score}%
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Tasks</span>
                                        <span className="font-semibold text-foreground">
                                            {summary?.tasks_completed || 0}/{summary?.tasks_total || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Habits</span>
                                        <span className="font-semibold text-foreground">
                                            {summary?.habits_completed || 0}/{summary?.habits_total || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Deep Work</span>
                                        <span className="font-semibold text-foreground">{summary?.deep_work_minutes || 0} min</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Wellness */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bento-card p-6"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                                        <Heart className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground">Wellness</h3>
                                        {summary?.wellness_score !== undefined && (
                                            <p className={`text-2xl font-black ${getScoreColor(summary.wellness_score)}`}>
                                                {summary.wellness_score}%
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Exercise</span>
                                        <span className="font-semibold text-foreground">{summary?.exercise_minutes || 0} min</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Sleep</span>
                                        <span className="font-semibold text-foreground">
                                            {summary?.sleep_hours ? `${summary.sleep_hours}h` : '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Water</span>
                                        <span className="font-semibold text-foreground">{summary?.water_glasses || 0} glasses</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Additional Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="bento-card p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Finance</p>
                                        <p className="font-bold text-foreground">
                                            ${(summary?.income_amount || 0) - (summary?.expense_amount || 0)}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="bento-card p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Reading</p>
                                        <p className="font-bold text-foreground">{summary?.books_pages_read || 0} pages</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                className="bento-card p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <Edit3 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Notes</p>
                                        <p className="font-bold text-foreground">{summary?.notes_created || 0} created</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 }}
                                className="bento-card p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Ideas</p>
                                        <p className="font-bold text-foreground">{summary?.ideas_captured || 0} captured</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Daily Reflection */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.0 }}
                            className="bento-card p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-foreground">Daily Reflection</h3>
                                {!isEditingReflection ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsEditingReflection(true)}
                                    >
                                        <Edit3 className="w-4 h-4 mr-2" />
                                        {reflection ? 'Edit' : 'Add'}
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setIsEditingReflection(false);
                                                setReflectionText(reflection?.reflection_text || '');
                                            }}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={saveReflection}
                                            className="bg-primary"
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            Save
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {isEditingReflection ? (
                                <Textarea
                                    value={reflectionText}
                                    onChange={(e) => setReflectionText(e.target.value)}
                                    placeholder="What did you accomplish today? What are you grateful for? What could be improved tomorrow?"
                                    className="min-h-[200px] resize-none"
                                />
                            ) : (
                                <div className="text-muted-foreground">
                                    {reflection?.reflection_text || (
                                        <p className="italic">No reflection added for this day yet.</p>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    );
}
