import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export function useHijriDate() {
    const [hijriDate, setHijriDate] = useState<string>('');

    useEffect(() => {
        const fetchHijriDate = async () => {
            try {
                const today = new Date();
                const formattedDate = format(today, 'dd-MM-yyyy');

                // Using Aladhan API for accurate Hijri date based on location if possible, 
                // but simple date conversion is efficient for now
                const response = await fetch(`https://api.aladhan.com/v1/gToH/${formattedDate}`);
                const data = await response.json();

                if (data.code === 200) {
                    const { day, month, year } = data.data.hijri;
                    setHijriDate(`${day} ${month.en} ${year} AH`);
                }
            } catch (error) {
                console.error('Failed to fetch Hijri date:', error);
                // Fallback or leave empty
            }
        };

        fetchHijriDate();
    }, []);

    return hijriDate;
}
