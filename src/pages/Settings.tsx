import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Download,
  Upload,
  Trash2,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function Settings() {
  const { tasks, prayerRecords, transactions, habits, journalEntries, setTasks, setPrayerRecords, setTransactions, setHabits, setJournalEntries } = useApp();

  const handleExportData = () => {
    const data = {
      tasks,
      prayerRecords,
      transactions,
      habits,
      journalEntries,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sabr-os-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Data exported successfully!');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);

        if (data.tasks) setTasks(() => data.tasks);
        if (data.prayerRecords) setPrayerRecords(() => data.prayerRecords);
        if (data.transactions) setTransactions(() => data.transactions);
        if (data.habits) setHabits(() => data.habits);
        if (data.journalEntries) setJournalEntries(() => data.journalEntries);

        toast.success('Data imported successfully!');
      } catch (error) {
        toast.error('Failed to import data. Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = async () => {
    const confirmFirst = window.confirm('🚨 CRITICAL WARNING: This will PERMANENTLY DELETE all your data from the cloud. This includes your tasks, finances, habits, and prayers. You cannot get this back. Are you absolutely sure?');

    if (confirmFirst) {
      const confirmSecond = window.prompt('Type "DELETE" to confirm permanent account wipe:');

      if (confirmSecond === 'DELETE') {
        const loadingToast = toast.loading('Wiping your data from Sabr OS...');

        try {
          const tables = [
            'tasks', 'finance_transactions', 'habits', 'habit_completions',
            'prayer_records', 'goals', 'projects', 'notes', 'ideas',
            'resources', 'books', 'journal_entries', 'zikr_entries',
            'fasting_records', 'subscriptions', 'debts', 'financial_goals', 'budgets',
            'quran_progress', 'quran_goals', 'duas', 'watchlist_items'
          ];

          // We run deletes one by one to avoid errors if a specific table doesn't exist yet
          for (const table of tables) {
            try {
              await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
            } catch (e) {
              console.warn(`Table ${table} skip/error:`, e);
            }
          }

          toast.dismiss(loadingToast);
          toast.success('Your data has been completely wiped. Starting fresh.');

          localStorage.clear();
          window.location.href = '/dashboard';
        } catch (error) {
          toast.dismiss(loadingToast);
          toast.error('Partial wipe completed. Some data may remain.');
          console.error(error);
        }
      } else {
        toast.info('Action cancelled. Your data is safe.');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in app-3d-root">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your SABR OS preferences</p>
      </div>

      {/* Data Management */}
      <div className="bento-card space-y-4">
        <h3 className="font-medium text-lg">Data Management</h3>
        <p className="text-sm text-muted-foreground">
          Your data is securely stored in your Supabase cloud database and synced across your devices.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>

          <Button variant="outline" asChild>
            <label className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Import Data
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </Button>

          <Button variant="destructive" onClick={handleClearAllData}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Data
          </Button>
        </div>
      </div>

      {/* About */}
      <div className="bento-card">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Info className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-lg mb-1">About SABR OS</h3>
            <p className="text-sm text-muted-foreground mb-3">
              A personal life operating system designed to help Muslims balance Deen and Dunya.
            </p>
            <p className="text-xs text-muted-foreground">
              Built with love for the Ummah. All data is securely persisted in your personal cloud database.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bento-card">
        <h3 className="font-medium text-lg mb-4">Your Data</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Tasks', count: tasks.length },
            { label: 'Prayer Records', count: prayerRecords.length },
            { label: 'Transactions', count: transactions.length },
            { label: 'Habits', count: habits.length },
            { label: 'Journal Entries', count: journalEntries.length },
          ].map(stat => (
            <div key={stat.label} className="text-center p-3 rounded-lg bg-secondary/50">
              <p className="text-2xl font-bold text-primary">{stat.count}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
