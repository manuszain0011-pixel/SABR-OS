import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

export function PWAInstall() {
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
            setIsStandalone(true);
        }

        const handler = (e: any) => {
            e.preventDefault();
            console.log('beforeinstallprompt event fired');
            setInstallPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!installPrompt) {
            toast.info("To install on iOS: Tap 'Share' and then 'Add to Home Screen'. For Android, wait for the browser prompt.");
            return;
        }

        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;

        if (outcome === 'accepted') {
            setInstallPrompt(null);
            toast.success("Thank you for installing SABR OS!");
        }
    };

    if (isStandalone) return null;

    // Detection for mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // As per user request: Only show on mobile, never on desktop/laptop
    if (!isMobile) return null;

    return (
        <Button
            onClick={handleInstall}
            variant="outline"
            className="gap-2 border-primary/30 hover:bg-primary/5 flex"
        >
            <Download className="w-4 h-4" />
            <span className="hidden xs:inline">Install App</span>
            <span className="xs:hidden">Install</span>
        </Button>
    );
}
