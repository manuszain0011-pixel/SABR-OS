import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Moon, Sun, Users, LogOut, Settings, MessageSquare, Megaphone, FileText, Activity, TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTheme } from '@/components/ThemeProvider';

const navGroups = [
    {
        title: 'Overview',
        items: [
            { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
        ],
    },
    {
        title: 'Management',
        items: [
            { path: '/admin/users', label: 'Users', icon: Users },
            { path: '/admin/content', label: 'Content CMS', icon: FileText },
            { path: '/admin/announcements', label: 'Announcements', icon: Megaphone },
        ],
    },
    {
        title: 'Support',
        items: [
            { path: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
        ],
    },
    {
        title: 'System',
        items: [
            { path: '/admin/health', label: 'System Health', icon: Activity },
            { path: '/admin/settings', label: 'Settings', icon: Settings },
        ],
    },
];

interface SidebarProps {
    onNavigate?: () => void;
}

export function AdminSidebar({ onNavigate }: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();

    const handleClick = () => {
        onNavigate?.();
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut({ scope: 'local' });
        } catch {
            // ignore
        }

        toast.success('Logged out successfully');
        navigate('/', { replace: true });
    };

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-72 border-r border-red-900/10 bg-white dark:bg-[#1a0505] shadow-2xl">
            <div className="flex h-full flex-col">
                {/* Logo Section */}
                <div className="flex h-32 flex-col justify-center px-10 border-b border-red-900/5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-red-900 shadow-xl shadow-red-900/20">
                            <Settings className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tighter text-red-900 dark:text-white">SABR<span className="text-red-500">ADMIN</span></h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-900/40">Command Center</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <ScrollArea className="flex-1 px-6 py-10 scrollbar-none">
                    <nav className="space-y-12">
                        {navGroups.map((group) => (
                            <div key={group.title} className="space-y-4">
                                <div className="flex items-center gap-3 px-4">
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-900/30 dark:text-white/20">
                                        {group.title}
                                    </span>
                                    <div className="h-[1px] flex-1 bg-red-900/5 dark:bg-white/5" />
                                </div>

                                <div className="space-y-2">
                                    {group.items.map((item) => {
                                        const isActive = location.pathname === item.path;
                                        return (
                                            <NavLink
                                                key={item.path}
                                                to={item.path}
                                                onClick={handleClick}
                                                className={cn(
                                                    "group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300",
                                                    isActive
                                                        ? "bg-red-900 text-white shadow-lg shadow-red-900/20 translate-x-1"
                                                        : "text-red-900/60 hover:text-red-900 hover:bg-red-900/5 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/5"
                                                )}
                                            >
                                                <item.icon className={cn(
                                                    "h-5 w-5 transition-transform group-hover:scale-110",
                                                    isActive ? "text-red-200" : "text-red-900/40 dark:text-white/20"
                                                )} />
                                                <span className="text-sm font-black tracking-wide uppercase">{item.label}</span>
                                            </NavLink>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>
                </ScrollArea>

                {/* Footer Actions */}
                <div className="p-8 space-y-4 border-t border-red-900/5 bg-red-900/[0.02] dark:bg-white/[0.01]">
                    <button
                        onClick={toggleTheme}
                        className="flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-black uppercase tracking-wide text-red-900/60 hover:bg-red-900/5 dark:text-white/40 dark:hover:bg-white/5 transition-all outline-none"
                    >
                        {theme === 'dark' ? (
                            <><Sun className="h-5 w-5 text-red-500" /> Light Mode</>
                        ) : (
                            <><Moon className="h-5 w-5 text-red-500" /> Dark Mode</>
                        )}
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-black uppercase tracking-wide text-destructive/60 hover:bg-destructive/10 transition-all outline-none"
                    >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </div>
        </aside >
    );
}
