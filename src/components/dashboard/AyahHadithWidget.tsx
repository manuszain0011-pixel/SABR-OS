import { useState, useEffect } from 'react';
import { Quote, RefreshCw, Bookmark, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDailyInspiration } from '@/hooks/useSupabaseData';

const FALLBACK_STATEMENTS = [
    {
        text: "So verily, with every difficulty, there is relief. Verily, with every difficulty, there is relief.",
        source: "Quran 94:5-6",
        type: "Ayah",
        tags: ["Hope", "Patience"],
        arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا"
    },
    {
        text: "The best among you are those who have the best manners and character.",
        source: "Sahih Bukhari",
        type: "Hadith",
        tags: ["Character", "Etiquette"],
        arabic: null
    },
    {
        text: "And He found you lost and guided [you].",
        source: "Quran 93:7",
        type: "Ayah",
        tags: ["Guidance", "Mercy"],
        arabic: "وَوَجَدَكَ ضَالًّا فَهَدَىٰ"
    }
];

export function AyahHadithWidget() {
    const { data: dbItems = [], isLoading } = useDailyInspiration();
    const [index, setIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    // Merge database items with fallback items
    const allItems = dbItems.length > 0
        ? dbItems.map(item => ({
            text: item.translation,
            arabic: item.arabic_text,
            source: item.reference,
            type: item.content_type,
            tags: item.category ? [item.category] : []
        }))
        : FALLBACK_STATEMENTS;

    useEffect(() => {
        if (allItems.length > 0) {
            const day = new Date().getDate();
            setIndex(day % allItems.length);
        }
    }, [allItems.length]);

    const handleRefresh = () => {
        setIsVisible(false);
        setTimeout(() => {
            setIndex((prev) => (prev + 1) % allItems.length);
            setIsVisible(true);
        }, 300);
    };

    if (isLoading && dbItems.length === 0) {
        return (
            <div className="bento-card h-full min-h-[220px] flex items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-primary/30" />
            </div>
        );
    }

    const item = allItems[index] || FALLBACK_STATEMENTS[0];

    return (
        <div className="bento-card group relative overflow-hidden h-full flex flex-col justify-center min-h-[220px]">
            {/* Decorative background element */}
            <div className="absolute -right-8 -top-8 text-primary/5 rotate-12 transition-transform duration-700 group-hover:rotate-45">
                <Quote size={160} />
            </div>

            <div className={cn(
                "relative transition-all duration-500",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {item.type} of the day
                    </span>
                    <div className="flex gap-1 ml-auto">
                        {item.tags?.map(tag => (
                            <span key={tag} className="text-[9px] font-medium text-muted-foreground/60 italic">#{tag}</span>
                        ))}
                    </div>
                </div>

                {item.arabic && (
                    <p className="text-right text-lg font-arabic text-primary/80 mb-2 leading-loose" dir="rtl">
                        {item.arabic}
                    </p>
                )}

                <p className="text-xl sm:text-2xl font-bold tracking-tight mb-6 leading-tight italic decoration-primary/20 underline-offset-8 decoration-wavy">
                    "{item.text}"
                </p>

                <div className="flex items-center justify-between mt-auto">
                    <p className="text-sm font-semibold text-primary">{item.source}</p>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleRefresh}>
                            <RefreshCw className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <Bookmark className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
