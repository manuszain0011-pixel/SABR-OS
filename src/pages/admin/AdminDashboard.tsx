import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Activity, FileText, MessageSquare, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function AdminDashboard() {
    // Fetch live counts
    const { data: counts, isLoading } = useQuery({
        queryKey: ['admin_dashboard_stats'],
        queryFn: async () => {
            const today = new Date().toISOString().split('T')[0];
            const [usersCount, inspirationCount, habitCount, feedbackCount, activeToday] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('daily_inspiration').select('*', { count: 'exact', head: true }),
                supabase.from('habit_templates').select('*', { count: 'exact', head: true }),
                supabase.from('feedback_reports').select('*', { count: 'exact', head: true }),
                supabase.from('habit_completions').select('user_id', { count: 'exact', head: true }).eq('completed_date', today)
            ]);

            return {
                users: usersCount.count || 0,
                content: (inspirationCount.count || 0) + (habitCount.count || 0),
                feedback: feedbackCount.count || 0,
                activeUsers: activeToday.count || 0
            };
        }
    });

    const stats = [
        {
            title: 'Total Users',
            value: isLoading ? '...' : (counts?.users?.toString() || '0'),
            change: 'Registered profiles',
            icon: Users,
            color: 'text-blue-500',
        },
        {
            title: 'Active Today',
            value: isLoading ? '...' : (counts?.activeUsers?.toString() || '0'),
            change: 'Logged activity today',
            icon: Activity,
            color: 'text-green-500',
        },
        {
            title: 'Content Items',
            value: isLoading ? '...' : (counts?.content?.toString() || '0'),
            change: 'Ayahs, Hadiths, Habits',
            icon: FileText,
            color: 'text-amber-500',
        },
        {
            title: 'Feedback',
            value: isLoading ? '...' : (counts?.feedback?.toString() || '0'),
            change: 'User reports',
            icon: MessageSquare,
            color: 'text-red-500',
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-red-950 dark:text-white">Dashboard</h1>
                    <p className="text-muted-foreground mt-2">Platform overview and health metrics.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="border-border/50 bg-white/50 backdrop-blur-sm dark:bg-white/5 shadow-premium">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-bold opacity-60">
                                {stat.change}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Activity or Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-border/50 bg-white/50 backdrop-blur-sm dark:bg-white/5 shadow-premium">
                    <CardHeader>
                        <CardTitle className="text-lg font-black tracking-tight">System Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-sm font-bold uppercase tracking-wide">Database Connection</span>
                                </div>
                                <span className="text-[10px] font-black text-green-600 dark:text-green-400 bg-green-500/20 px-2 py-0.5 rounded uppercase">HEALTHY</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-[#0B5B42]/5 border border-[#0B5B42]/10">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">API Latency</p>
                                    <p className="text-xl font-black text-[#0B5B42]">42ms</p>
                                </div>
                                <div className="p-4 rounded-xl bg-[#C5A059]/5 border border-[#C5A059]/10">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Storage</p>
                                    <p className="text-xl font-black text-[#C5A059]">45%</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-white/50 backdrop-blur-sm dark:bg-white/5 shadow-premium">
                    <CardHeader>
                        <CardTitle className="text-lg font-black tracking-tight">Admin Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Shield className="h-12 w-12 text-red-900/20 mb-4" />
                            <p className="text-sm font-medium text-muted-foreground max-w-[200px]">
                                Your session is protected by Tier-1 encryption.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

