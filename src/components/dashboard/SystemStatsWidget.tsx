import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Target, FolderKanban, CheckSquare, Lightbulb, FileText, 
  BookOpen, Users, Heart, Moon, BookMarked, Flame, BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function SystemStatsWidget() {
  const { 
    goals, projects, tasks, ideas, notes, resources, books, 
    contacts, habits, prayerRecords, quranProgress,
    journalEntries
  } = useApp();

  const stats = useMemo(() => {
    const activeGoals = goals.filter(g => g.status !== 'completed');
    const activeProjects = projects.filter(p => p.status !== 'completed');
    const pendingTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
    const activeHabits = habits.filter(h => h.is_active);
    const completedPrayers = prayerRecords.reduce((sum, p) => {
      const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
      return sum + prayers.filter((prayer) => {
        const status = p[prayer];
        return status && status !== 'pending' && status !== 'missed';
      }).length;
    }, 0);
    const quranPages = quranProgress.reduce((sum, q) => sum + (q.pages_read || 0), 0);

    return [
      { label: 'Goals', value: activeGoals.length, icon: Target, color: 'text-primary bg-primary/10' },
      { label: 'Projects', value: activeProjects.length, icon: FolderKanban, color: 'text-gold bg-gold-light' },
      { label: 'Tasks', value: pendingTasks.length, icon: CheckSquare, color: 'text-primary bg-green-light' },
      { label: 'Ideas', value: ideas.length, icon: Lightbulb, color: 'text-yellow-600 bg-yellow-500/10' },
      { label: 'Notes', value: notes.filter(n => !n.is_archived).length, icon: FileText, color: 'text-blue-600 bg-blue-500/10' },
      { label: 'Resources', value: resources.length, icon: BookOpen, color: 'text-purple-600 bg-purple-500/10' },
      { label: 'Books', value: books.filter(b => b.status === 'reading').length, icon: BookMarked, color: 'text-orange-600 bg-orange-500/10' },
      { label: 'Contacts', value: contacts.length, icon: Users, color: 'text-teal-600 bg-teal-500/10' },
      { label: 'Habits', value: activeHabits.length, icon: Flame, color: 'text-gold bg-gold-light' },
      { label: 'Journal', value: journalEntries.length, icon: Heart, color: 'text-pink-600 bg-pink-500/10' },
      { label: 'Prayers', value: completedPrayers, icon: Moon, color: 'text-primary bg-primary/10' },
      { label: 'Quran', value: quranPages, icon: BookOpen, color: 'text-primary bg-green-light' },
    ];
  }, [goals, projects, tasks, ideas, notes, resources, books, contacts, habits, prayerRecords, quranProgress, journalEntries]);

  return (
    <div className="bento-card">
      <div className="flex items-center gap-3 mb-5">
        <div className="icon-box-sm bg-secondary">
          <BarChart3 className="h-4 w-4 text-foreground" />
        </div>
        <h3 className="font-semibold">System Overview</h3>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {stats.map((stat) => (
          <div 
            key={stat.label}
            className="group p-3 rounded-xl bg-secondary/30 hover:bg-secondary/60 transition-colors text-center"
          >
            <div className={cn("icon-box-sm mx-auto mb-2", stat.color)}>
              <stat.icon className="h-3.5 w-3.5" />
            </div>
            <p className="text-lg font-bold tracking-tight">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground font-medium truncate">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
