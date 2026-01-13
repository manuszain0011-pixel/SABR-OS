import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'auto' | 'light' | 'dark' | 'gold' | 'original';
}

const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
};

export function Logo({ className, size = 'md', variant = 'auto' }: LogoProps) {
    const { theme } = useTheme();

    // Determine which logo to use based on variant and theme
    const getLogoSrc = () => {
        if (variant === 'original') return '/logo-final.png';
        if (variant === 'light') return '/logo-navy.png';
        if (variant === 'dark') return '/logo-white.png';
        if (variant === 'gold') return '/logo-gold.png';

        // Auto mode: switch based on theme
        // For light mode, use navy or black logo
        // For dark mode, use white or gold logo
        if (theme === 'dark') {
            return '/logo-white.png';
        } else {
            return '/logo-final.png'; // Use original gold logo for light mode
        }
    };

    return (
        <img
            src={getLogoSrc()}
            alt="SABR OS Logo"
            className={cn(sizeClasses[size], 'object-contain', className)}
        />
    );
}
