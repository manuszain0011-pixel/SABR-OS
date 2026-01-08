import React from 'react';
import { cn } from '@/lib/utils';

interface LiquidProgressCircleProps {
    value: number;
    size?: number;
    strokeWidth?: number;
    className?: string;
    color?: string;
}

export function LiquidProgressCircle({
    value,
    size = 60,
    strokeWidth = 6,
    className,
    color = "hsl(var(--primary))"
}: LiquidProgressCircleProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
            {/* Background Circle */}
            <svg className="absolute transform -rotate-90" width={size} height={size}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-muted/20"
                />
                {/* Progress Circle with Liquid Animation */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                    style={{
                        filter: `drop-shadow(0 0 6px ${color}44)`
                    }}
                />
            </svg>

            {/* Optional Inner Liquid Wave Effect (SVG mask) */}
            <div
                className="absolute rounded-full overflow-hidden"
                style={{
                    width: size - strokeWidth * 2 - 4,
                    height: size - strokeWidth * 2 - 4,
                    background: "hsl(var(--secondary) / 0.3)"
                }}
            >
                <div
                    className="absolute bottom-0 left-0 w-[200%] h-full transition-transform duration-1000 ease-in-out bg-current opacity-20 animate-wave"
                    style={{
                        color,
                        transform: `translateY(${100 - value}%) translateX(-25%)`,
                        borderRadius: '40%'
                    }}
                />
            </div>

            <span className="relative text-xs font-bold">{value}%</span>
        </div>
    );
}
