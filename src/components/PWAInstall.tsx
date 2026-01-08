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
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            if (isIOS) {
                toast.info("To install on iOS: Tap the 'Share' icon (square with arrow) and select 'Add to Home Screen'.");
            } else {
                toast.info("Browser prompt not ready yet. You can also install manually: Tap the 3 dots (⋮) in your browser menu and select 'Install app' or 'Add to Home screen'.");
            }
            return;
        }

        try {
            installPrompt.prompt();
            const { outcome } = await installPrompt.userChoice;
            if (outcome === 'accepted') {
                setInstallPrompt(null);
                toast.success("Thank you for installing SABR OS!");
            }
        } catch (err) {
            console.error('Install error:', err);
            toast.error("An error occurred during installation. Please try again or use the browser menu.");
        }
    };

    if (isStandalone) return null;

    // Detection for mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Always show on mobile to provide either the prompt or the "manual" guide
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
