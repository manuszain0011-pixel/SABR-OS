import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, List } from '@/components/ui';
import { QadaPrayerItem } from '@/components/ibadat/QadaPrayerItem';
import { Button } from '@/components/ui/button';
import { PrayerEntry, PrayerName } from '@/types';
import { cn } from '@/lib/utils';

type Props = {
    /** Today’s prayer record keyed by prayer name */
    prayerData: Record<PrayerName, PrayerEntry>;
    /** Update handler – same signature you already use in Ibadat */
    onUpdate: (prayerName: PrayerName, updates: Partial<PrayerEntry>) => void;
    /** Qada‑prayer data and CRUD helpers */
    qadaPrayers: any[];
    createQadaPrayer: (p: any) => Promise<void>;
    updateQadaPrayer: (p: any) => Promise<void>;
    deleteQadaPrayer: (id: string) => Promise<void>;
};

export const PrayerEnhancements = ({
    prayerData,
    onUpdate,
    qadaPrayers,
    createQadaPrayer,
    updateQadaPrayer,
    deleteQadaPrayer,
}: Props) => {
    /** Toggle a boolean column (e.g. fajr_jamaah) */
    const toggleFlag = (name: PrayerName, field: keyof PrayerEntry) => {
        const cur = prayerData[name][field] as boolean | undefined;
        onUpdate(name, { [field]: !cur } as Partial<PrayerEntry>);
    };

    return (
        <section className="space-y-6 pt-6">
            {/* Jamaah toggle – example for Fajr */}
            <div className="flex items-center gap-4">
                <Checkbox
                    checked={!!prayerData.fajr?.fajr_jamaah}
                    label="Prayed Fajr in Jamaah (+10 SPI)"
                    onCheckedChange={() => toggleFlag('fajr', 'fajr_jamaah')}
                />
            </div>

            {/* Sunnah prayers check‑boxes */}
            <div className="grid grid-cols-2 gap-3">
                <Checkbox
                    checked={!!prayerData.fajr?.fajr_sunnah_before}
                    label="2 Rakah Sunnah Before Fajr"
                    onCheckedChange={() => toggleFlag('fajr', 'fajr_sunnah_before')}
                />
                <Checkbox
                    checked={!!prayerData.dhuhr?.dhuhr_sunnah_before}
                    label="4 Rakah Sunnah Before Dhuhr"
                    onCheckedChange={() => toggleFlag('dhuhr', 'dhuhr_sunnah_before')}
                />
                <Checkbox
                    checked={!!prayerData.dhuhr?.dhuhr_sunnah_after}
                    label="2 Rakah Sunnah After Dhuhr"
                    onCheckedChange={() => toggleFlag('dhuhr', 'dhuhr_sunnah_after')}
                />
                {/* Add more check‑boxes for other prayers as needed */}
            </div>

            {/* Prayer quality notes */}
            <Textarea
                placeholder="How was your khushu? Any distractions?"
                value={prayerData.fajr?.fajr_notes ?? ''}
                onChange={e => onUpdate('fajr', { fajr_notes: e.target.value })}
            />

            {/* Qada‑prayer tracker */}
            <Card title="Missed Prayers to Make Up">
                <List>
                    {qadaPrayers.map(p => (
                        <QadaPrayerItem
                            key={p.id}
                            prayer={p.prayer_name}
                            date={p.original_date}
                            onComplete={() =>
                                updateQadaPrayer({ id: p.id, is_completed: true, completed_date: new Date().toISOString() })
                            }
                            onDelete={() => deleteQadaPrayer(p.id)}
                        />
                    ))}
                </List>
                <Button className="mt-3 w-full" onClick={() => createQadaPrayer({ user_id: '', prayer_name: 'Fajr', original_date: new Date().toISOString().split('T')[0] })}>
                    + Add Qada Prayer
                </Button>
            </Card>
        </section>
    );
};
