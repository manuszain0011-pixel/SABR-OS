import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Moon, Sun, CheckSquare, Wallet, Settings, BookOpen,
  Target, FolderKanban, Lightbulb, FileText, Heart, BookMarked, Users, UserRound, LogOut, Zap
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
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/profile', label: 'Profile & Areas', icon: UserRound },
    ],
  },
  {
    title: 'Productivity',
    items: [
      { path: '/goals', label: 'Goals', icon: Target },
      { path: '/projects', label: 'Projects', icon: FolderKanban },
      { path: '/tasks', label: 'Tasks', icon: CheckSquare },
    ],
  },
  {
    title: 'Knowledge',
    items: [
      { path: '/ideas', label: 'Ideas', icon: Lightbulb },
      { path: '/notes', label: 'Notes', icon: FileText },
      { path: '/resources', label: 'Resources', icon: BookOpen },
      { path: '/books', label: 'Books', icon: BookMarked },
    ],
  },
  {
    title: 'Spiritual',
    items: [
      { path: '/ibadat', label: 'Ibadat Hub', icon: Moon },
    ],
  },
  {
    title: 'Life',
    items: [
      { path: '/finance', label: 'Finance', icon: Wallet },
      { path: '/wellness', label: 'Wellness', icon: Heart },
      { path: '/contacts', label: 'Contacts', icon: Users },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { path: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

interface SidebarProps {
  onNavigate?: () => void;
  className?: string;
}

export function Sidebar({ onNavigate, className }: SidebarProps) {
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
    // "local" guarantees client session is cleared even if the server session is already invalid
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      // ignore
    }

    toast.success('Logged out successfully');
    navigate('/', { replace: true });
  };

  return (
    <aside className={cn("flex flex-col h-full border-r border-[#0B5B42]/10 bg-white dark:bg-[#031510] shadow-2xl", className)}>
      <div className="flex h-full flex-col">
        {/* Logo Section */}
        <div className="flex h-32 flex-col justify-center px-10 border-b border-[#0B5B42]/5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-[#0B5B42] shadow-xl shadow-[#0B5B42]/20">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-[#0B5B42] dark:text-white">SABR<span className="text-[#C5A059]">OS</span></h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0B5B42]/40">Mastery System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-6 py-10 scrollbar-none">
          <nav className="space-y-12">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-4">
                <div className="flex items-center gap-3 px-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B5B42]/30 dark:text-white/20">
                    {group.title}
                  </span>
                  <div className="h-[1px] flex-1 bg-[#0B5B42]/5 dark:bg-white/5" />
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
                            ? "bg-[#0B5B42] text-white shadow-lg shadow-[#0B5B42]/20 translate-x-1"
                            : "text-[#0B5B42]/60 hover:text-[#0B5B42] hover:bg-[#0B5B42]/5 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/5"
                        )}
                      >
                        <item.icon className={cn(
                          "h-5 w-5 transition-transform group-hover:scale-110",
                          isActive ? "text-[#C5A059]" : "text-[#0B5B42]/40 dark:text-white/20"
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
        <div className="p-8 space-y-4 border-t border-[#0B5B42]/5 bg-[#0B5B42]/[0.02] dark:bg-white/[0.01]">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-black uppercase tracking-wide text-[#0B5B42]/60 hover:bg-[#0B5B42]/5 dark:text-white/40 dark:hover:bg-white/5 transition-all outline-none"
          >
            {theme === 'dark' ? (
              <><Sun className="h-5 w-5 text-[#C5A059]" /> Light Mode</>
            ) : (
              <><Moon className="h-5 w-5 text-[#C5A059]" /> Dark Mode</>
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
