import { useState } from 'react';
import { Check, X, MessageSquare, Users, Clock, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface EnhancedPrayerCardProps {
    prayerName: string;
    displayName: string;
    prayerTime?: string;
    status: string;
    isPrayed: boolean;
    onStatusChange: (status: string) => void;
    onSunnahChange?: (field: string, value: boolean) => void;
    onNotesChange?: (notes: string) => void;
    jamaahChecked?: boolean;
    sunnahBefore?: boolean;
    sunnahAfter?: boolean;
    notes?: string;
    spiPoints?: number;
    khushu?: number;
    onKhushuChange?: (level: number) => void;
}

const SUNNAH_CONFIG: Record<string, { before?: number; after?: number }> = {
    fajr: { before: 2 },
    dhuhr: { before: 4, after: 2 },
    maghrib: { after: 2 },
    isha: { after: 2 },
};

export function EnhancedPrayerCard({
    prayerName,
    displayName,
    prayerTime,
    status,
    isPrayed,
    onStatusChange,
    onSunnahChange,
    onNotesChange,
    jamaahChecked = false,
    sunnahBefore = false,
    sunnahAfter = false,
    notes = '',
    spiPoints = 0,
    khushu = 3,
    onKhushuChange,
}: EnhancedPrayerCardProps) {
    const [notesDialogOpen, setNotesDialogOpen] = useState(false);
    const [localNotes, setLocalNotes] = useState(notes);
    const sunnahConfig = SUNNAH_CONFIG[prayerName];

    const handleSaveNotes = () => {
        onNotesChange?.(localNotes);
        setNotesDialogOpen(false);
    };

    const totalSunnahPoints = () => {
        let points = 0;
        if (sunnahBefore && sunnahConfig?.before) points += 3;
        if (sunnahAfter && sunnahConfig?.after) points += 3;
        return points;
    };

    return (
        <div
            className={cn(
                'bento-card transition-all duration-300',
                isPrayed && 'border-primary/30 bg-green-light'
            )}
        >
            {/* Main Prayer Status */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-4">
                    <div
                        className={cn(
                            'p-3 rounded-xl transition-colors',
                            isPrayed ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                        )}
                    >
                        <Moon className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">{displayName}</h3>
                        <p className="text-sm text-muted-foreground">{prayerTime}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    <Button
                        variant={status === 'none' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onStatusChange('none')}
                        className={cn(
                            "px-2 min-w-[36px]",
                            status === 'none' ? 'bg-muted text-muted-foreground' : ''
                        )}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={status === 'on_time' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onStatusChange('on_time')}
                        className={cn(
                            "flex-1 md:flex-none py-1 h-9",
                            status === 'on_time' ? 'gradient-green border-0 text-white' : ''
                        )}
                    >
                        <Check className="h-4 w-4 mr-1" />
                        <span className="text-xs sm:text-sm">On-time</span>
                    </Button>
                    <Button
                        variant={status === 'jamaah' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onStatusChange('jamaah')}
                        className={cn(
                            "flex-1 md:flex-none py-1 h-9",
                            status === 'jamaah' ? 'gradient-gold text-foreground border-0' : ''
                        )}
                    >
                        <Users className="h-4 w-4 mr-1" />
                        <span className="text-xs sm:text-sm">Jama'ah</span>
                    </Button>
                    <Button
                        variant={status === 'late' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onStatusChange('late')}
                        className={cn(
                            "flex-1 md:flex-none py-1 h-9",
                            status === 'late' ? 'bg-orange-500 text-white border-0 hover:bg-orange-600' : ''
                        )}
                    >
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="text-xs sm:text-sm">Late</span>
                    </Button>
                    <Button
                        variant={status === 'missed' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onStatusChange('missed')}
                        className={cn(
                            "flex-1 md:flex-none py-1 h-9",
                            status === 'missed' ? 'bg-destructive text-destructive-foreground border-0' : ''
                        )}
                    >
                        <X className="h-4 w-4 mr-1" />
                        <span className="text-xs sm:text-sm">Missed</span>
                    </Button>
                </div>
            </div>

            {/* Sunnah Prayers & Notes */}
            {isPrayed && (
                <div className="space-y-3 pt-3 border-t border-border">
                    {/* Sunnah Prayers */}
                    {sunnahConfig && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Sunnah Prayers (+3 SPI each)</p>
                            <div className="flex flex-wrap gap-3">
                                {sunnahConfig.before && (
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`${prayerName}-sunnah-before`}
                                            checked={sunnahBefore}
                                            onCheckedChange={(checked) =>
                                                onSunnahChange?.(`${prayerName}_sunnah_before`, !!checked)
                                            }
                                        />
                                        <label
                                            htmlFor={`${prayerName}-sunnah-before`}
                                            className="text-sm cursor-pointer"
                                        >
                                            {sunnahConfig.before} Rak'ah Before
                                        </label>
                                    </div>
                                )}
                                {sunnahConfig.after && (
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`${prayerName}-sunnah-after`}
                                            checked={sunnahAfter}
                                            onCheckedChange={(checked) =>
                                                onSunnahChange?.(`${prayerName}_sunnah_after`, !!checked)
                                            }
                                        />
                                        <label
                                            htmlFor={`${prayerName}-sunnah-after`}
                                            className="text-sm cursor-pointer"
                                        >
                                            {sunnahConfig.after} Rak'ah After
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Khushu & Notes */}
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                            <span className="text-muted-foreground">Khushu Level</span>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => onKhushuChange?.(level)}
                                        className={cn(
                                            'h-6 w-6 rounded-full border transition-all',
                                            khushu >= level
                                                ? 'bg-primary border-primary'
                                                : 'bg-secondary border-border hover:border-primary/50'
                                        )}
                                    />
                                ))}
                            </div>
                        </div>

                        <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <MessageSquare className="h-4 w-4 mr-1" />
                                    {notes ? 'Edit Notes' : 'Add Notes'}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{displayName} - Prayer Quality Notes</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                    <Textarea
                                        placeholder="How was your khushu? Any distractions? Reflections?"
                                        value={localNotes}
                                        onChange={(e) => setLocalNotes(e.target.value)}
                                        rows={5}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setNotesDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleSaveNotes}>Save Notes</Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Total Points */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {notes && <Badge variant="outline" className="text-xs">Has Notes</Badge>}
                            {totalSunnahPoints() > 0 && (
                                <Badge variant="outline" className="text-xs bg-gold/10 text-gold border-gold/30">
                                    +{totalSunnahPoints()} Sunnah
                                </Badge>
                            )}
                        </div>
                        <Badge className="bg-primary/10 text-primary">
                            +{spiPoints + totalSunnahPoints()} SPI
                        </Badge>
                    </div>
                </div>
            )}
        </div>
    );
}
