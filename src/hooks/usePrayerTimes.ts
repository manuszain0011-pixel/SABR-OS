import { useState, useEffect } from 'react';
import { PrayerTime } from '@/types';
import { format, parse, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { Coordinates, CalculationMethod, PrayerTimes, SunnahTimes } from 'adhan';

interface CustomPrayerTimes {
  fajr?: string;
  dhuhr?: string;
  asr?: string;
  maghrib?: string;
  isha?: string;
}

export function usePrayerTimes(
  city: string = 'London',
  country: string = 'United Kingdom',
  latitude?: number,
  longitude?: number,
  asrMethod: 0 | 1 = 1, // Hanafi by default
  calculationMethod: string = 'MuslimWorldLeague',
  customTimes: Record<string, string | undefined> = {}
) {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; timeRemaining: string } | null>(null);

  useEffect(() => {
    const calculateTimes = () => {
      try {
        setLoading(true);
        setError(null);

        const lat = (typeof latitude === 'number' && latitude >= -90 && latitude <= 90) ? latitude : 51.5074;
        const lon = (typeof longitude === 'number' && longitude >= -180 && longitude <= 180) ? longitude : -0.1278;

        const coords = new Coordinates(lat, lon);
        const date = new Date();

        // Map string method to adhan CalculationMethod
        let params;
        switch (calculationMethod) {
          case 'Karachi': params = CalculationMethod.Karachi(); break;
          case 'Makkah': params = CalculationMethod.UmmAlQura(); break;
          case 'Dubai': params = CalculationMethod.Dubai(); break;
          case 'MoonsightingCommittee': params = CalculationMethod.MoonsightingCommittee(); break;
          case 'NorthAmerica': params = CalculationMethod.NorthAmerica(); break;
          case 'Egypt': params = CalculationMethod.Egyptian(); break;
          case 'Kuwait': params = CalculationMethod.Kuwait(); break;
          case 'Qatar': params = CalculationMethod.Qatar(); break;
          case 'Singapore': params = CalculationMethod.Singapore(); break;
          default: params = CalculationMethod.MuslimWorldLeague();
        }

        // Adjust Madhab for Asr
        if (asrMethod === 1) {
          params.madhab = 'hanafi';
        }

        const adhanTimes = new PrayerTimes(coords, date, params);
        const formatTime = (date: Date) => format(date, 'HH:mm');

        const prayers: PrayerTime[] = [
          { name: 'fajr', time: customTimes.fajr || formatTime(adhanTimes.fajr), displayName: 'Fajr', isCustom: !!customTimes.fajr },
          { name: 'dhuhr', time: customTimes.dhuhr || formatTime(adhanTimes.dhuhr), displayName: 'Dhuhr', isCustom: !!customTimes.dhuhr },
          { name: 'asr', time: customTimes.asr || formatTime(adhanTimes.asr), displayName: 'Asr', isCustom: !!customTimes.asr },
          { name: 'maghrib', time: customTimes.maghrib || formatTime(adhanTimes.maghrib), displayName: 'Maghrib', isCustom: !!customTimes.maghrib },
          { name: 'isha', time: customTimes.isha || formatTime(adhanTimes.isha), displayName: 'Isha', isCustom: !!customTimes.isha },
        ];

        setPrayerTimes(prayers);
      } catch (err: any) {
        console.error('Local prayer calculation error:', err);
        setError('Error calculating times locally.');
      } finally {
        setLoading(false);
      }
    };

    calculateTimes();
  }, [city, latitude, longitude, asrMethod, calculationMethod, JSON.stringify(customTimes)]);

  useEffect(() => {
    if (prayerTimes.length === 0) return;

    const updateNextPrayer = () => {
      const now = new Date();
      const currentTime = format(now, 'HH:mm');

      for (const prayer of prayerTimes) {
        const prayerTime = prayer.time.replace(' (BST)', '').replace(' (GMT)', '');
        if (prayerTime > currentTime) {
          const prayerDate = parse(prayerTime, 'HH:mm', now);
          const diffMinutes = differenceInMinutes(prayerDate, now);
          const diffSeconds = differenceInSeconds(prayerDate, now) % 60;

          const hours = Math.floor(diffMinutes / 60);
          const minutes = diffMinutes % 60;

          let timeRemaining = '';
          if (hours > 0) {
            timeRemaining = `${hours}h ${minutes}m`;
          } else if (minutes > 0) {
            timeRemaining = `${minutes}m ${diffSeconds}s`;
          } else {
            timeRemaining = `${diffSeconds}s`;
          }

          setNextPrayer({ name: prayer.displayName, timeRemaining });
          return;
        }
      }

      setNextPrayer({ name: 'Fajr', timeRemaining: 'Tomorrow' });
    };

    updateNextPrayer();
    const interval = setInterval(updateNextPrayer, 1000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

  return { prayerTimes, loading, error, nextPrayer };
}
