import { useState } from 'react';
import { Plus, Check, Trash2, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface QadaPrayer {
    id: string;
    prayer_name: string;
    original_date: string;
    completed_date?: string;
    is_completed: boolean;
    notes?: string;
}

interface QadaPrayerTrackerProps {
    qadaPrayers: QadaPrayer[];
    onAddQada: (prayer: Omit<QadaPrayer, 'id' | 'is_completed'>) => Promise<void>;
    onCompleteQada: (id: string) => Promise<void>;
    onDeleteQada: (id: string) => Promise<void>;
}

const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export function QadaPrayerTracker({
    qadaPrayers,
    onAddQada,
    onCompleteQada,
    onDeleteQada,
}: QadaPrayerTrackerProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({
        prayer_name: 'Fajr',
        original_date: format(new Date(), 'yyyy-MM-dd'),
        notes: '',
    });

    const handleAdd = async () => {
        await onAddQada({
            prayer_name: form.prayer_name,
            original_date: form.original_date,
            notes: form.notes,
        });
        setForm({
            prayer_name: 'Fajr',
            original_date: format(new Date(), 'yyyy-MM-dd'),
            notes: '',
        });
        setDialogOpen(false);
    };

    const pendingPrayers = qadaPrayers.filter((p) => !p.is_completed);
    const completedPrayers = qadaPrayers.filter((p) => p.is_completed);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Late Prayers Tracker
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Make up late/missed prayers (+3 SPI each)
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Late Prayer
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Late Prayer</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div>
                                <label className="text-sm font-medium">Prayer</label>
                                <Select
                                    value={form.prayer_name}
                                    onValueChange={(v) => setForm((prev) => ({ ...prev, prayer_name: v }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PRAYER_NAMES.map((name) => (
                                            <SelectItem key={name} value={name}>
                                                {name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Original Date (when late)</label>
                                <Input
                                    type="date"
                                    value={form.original_date}
                                    onChange={(e) => setForm((prev) => ({ ...prev, original_date: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Notes (optional)</label>
                                <Textarea
                                    placeholder="Why was it late? Reminder for yourself..."
                                    value={form.notes}
                                    onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                                    rows={3}
                                />
                            </div>
                            <Button onClick={handleAdd} className="w-full">
                                Add to Late List
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bento-card text-center">
                    <p className="text-3xl font-bold text-destructive">{pendingPrayers.length}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div className="bento-card text-center">
                    <p className="text-3xl font-bold text-primary">{completedPrayers.length}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                </div>
            </div>

            {/* Pending Prayers */}
            {pendingPrayers.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Prayers to Make Up</h4>
                    {pendingPrayers.map((prayer) => (
                        <div
                            key={prayer.id}
                            className="bento-card flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="font-medium">{prayer.prayer_name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Missed on {format(parseISO(prayer.original_date), 'MMM d, yyyy')}
                                    </p>
                                    {prayer.notes && (
                                        <p className="text-xs text-muted-foreground italic mt-1">
                                            "{prayer.notes}"
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    onClick={() => onCompleteQada(prayer.id)}
                                    className="gradient-green border-0"
                                >
                                    <Check className="h-4 w-4 mr-1" />
                                    Done
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onDeleteQada(prayer.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Completed Prayers */}
            {completedPrayers.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Recently Completed</h4>
                    {completedPrayers.slice(0, 5).map((prayer) => (
                        <div
                            key={prayer.id}
                            className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30"
                        >
                            <div className="flex items-center gap-3">
                                <Check className="h-4 w-4 text-primary" />
                                <div>
                                    <p className="text-sm font-medium">{prayer.prayer_name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Missed: {format(parseISO(prayer.original_date), 'MMM d')} • Made up:{' '}
                                        {prayer.completed_date
                                            ? format(parseISO(prayer.completed_date), 'MMM d')
                                            : 'Today'}
                                    </p>
                                </div>
                            </div>
                            <Badge className="bg-primary/10 text-primary">+3 SPI</Badge>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {qadaPrayers.length === 0 && (
                <div className="bento-card text-center py-8">
                    <Check className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <p className="font-medium">Alhamdulillah! No late prayers</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        May Allah keep you consistent
                    </p>
                </div>
            )}
        </div>
    );
}
