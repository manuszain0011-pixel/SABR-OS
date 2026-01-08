import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { Check, Globe, Loader2, MapPin, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CityResult {
  name: string;
  country: string;
  state?: string;
  latitude?: number;
  longitude?: number;
}

interface CitySearchWidgetProps {
  onSelect: (city: string, country: string, latitude?: number, longitude?: number) => void;
  currentCity: string;
  currentCountry: string;
  className?: string;
}

export const CitySearchWidget = forwardRef<HTMLDivElement, CitySearchWidgetProps>(
  ({ onSelect, currentCity, currentCountry, className }, forwardedRef) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<CityResult[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const searchTimeoutRef = useRef<number | null>(null);

    const setRootRef = (node: HTMLDivElement | null) => {
      dropdownRef.current = node;
      if (!forwardedRef) return;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else forwardedRef.current = node;
    };

    const searchCities = async (query: string) => {
      if (query.trim().length < 2) {
        setSearchResults([]);
        setHasSearched(false);
        return;
      }

      setIsSearching(true);
      setHasSearched(true);

      try {
        // NOTE: Nominatim has usage limits; we debounce requests and keep the payload small.
        // jsonv2 gives a more stable shape; we rely on address.* for city/town/village names.
        const url = `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(query)}` +
          `&format=jsonv2` +
          `&addressdetails=1` +
          `&limit=12`;

        const response = await fetch(url, {
          headers: {
            'Accept-Language': 'en',
          },
        });

        if (!response.ok) throw new Error('Search failed');

        const data = await response.json();

        const results: CityResult[] = (Array.isArray(data) ? data : [])
          .map((item: any) => {
            const address = item.address || {};
            const cityName =
              address.city ||
              address.town ||
              address.village ||
              address.hamlet ||
              address.municipality ||
              address.county ||
              item.name ||
              item.display_name;

            const country = address.country || '';
            const state = address.state || address.region || '';

            const lat = typeof item.lat === 'string' ? Number(item.lat) : undefined;
            const lon = typeof item.lon === 'string' ? Number(item.lon) : undefined;

            return {
              name: String(cityName || '').split(',')[0].trim(),
              country,
              state,
              latitude: Number.isFinite(lat) ? lat : undefined,
              longitude: Number.isFinite(lon) ? lon : undefined,
            };
          })
          .filter((r: CityResult) => r.name && r.country)
          .filter((r: CityResult, index: number, self: CityResult[]) =>
            index === self.findIndex((x) => x.name === r.name && x.country === r.country)
          );

        setSearchResults(results);
      } catch (error) {
        console.error('City search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounced search
    useEffect(() => {
      if (searchTimeoutRef.current) {
        window.clearTimeout(searchTimeoutRef.current);
      }

      if (searchQuery.trim().length >= 2) {
        searchTimeoutRef.current = window.setTimeout(() => {
          searchCities(searchQuery);
        }, 400);
      } else {
        setSearchResults([]);
        setHasSearched(false);
      }

      return () => {
        if (searchTimeoutRef.current) {
          window.clearTimeout(searchTimeoutRef.current);
        }
      };
    }, [searchQuery]);

    // Close dropdown on outside click
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setShowDropdown(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (city: CityResult) => {
      onSelect(city.name, city.country, city.latitude, city.longitude);
      setSearchQuery('');
      setShowDropdown(false);
      setSearchResults([]);
      setHasSearched(false);
    };

    const handleCustom = () => {
      onSelect(searchQuery.trim(), currentCountry || 'Custom', undefined, undefined);
      setSearchQuery('');
      setShowDropdown(false);
      setSearchResults([]);
      setHasSearched(false);
    };

    const selectedMatches = (city: CityResult) =>
      currentCity.toLowerCase() === city.name.toLowerCase() &&
      currentCountry.toLowerCase() === city.country.toLowerCase();

    return (
      <div className={cn('relative', className)} ref={setRootRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-foreground/50" />
          <Input
            placeholder="Search any city, town, or village..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            className="pl-10 bg-white/20 border-white/30 text-primary-foreground placeholder:text-primary-foreground/50"
            aria-label="Search city worldwide"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-foreground/50 animate-spin" />
          )}
        </div>

        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto">
            <div className="p-2">
              {!hasSearched && searchQuery.trim().length < 2 && (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Globe className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Type any city, town, or village name</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    We'll use coordinates for accurate prayer times
                  </p>
                </div>
              )}

              {isSearching && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 text-primary animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Searching...</span>
                </div>
              )}

              {!isSearching && searchResults.length > 0 && (
                <>
                  <p className="text-xs text-muted-foreground px-2 pb-2">
                    Found {searchResults.length} location{searchResults.length !== 1 ? 's' : ''}
                  </p>

                  {searchResults.map((city, index) => (
                    <button
                      key={`${city.name}-${city.country}-${index}`}
                      onClick={() => handleSelect(city)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors text-left',
                        'hover:bg-secondary text-foreground',
                        selectedMatches(city) && 'bg-primary/10'
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <span className="font-medium">{city.name}</span>
                          <p className="text-xs text-muted-foreground truncate">
                            {city.state ? `${city.state}, ` : ''}{city.country}
                          </p>
                        </div>
                      </div>
                      {selectedMatches(city) && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
                    </button>
                  ))}
                </>
              )}

              {!isSearching && hasSearched && searchResults.length === 0 && searchQuery.trim().length >= 2 && (
                <div className="py-6 text-center">
                  <p className="text-sm text-muted-foreground">No locations found</p>
                  <button
                    onClick={handleCustom}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <MapPin className="h-4 w-4" />
                    Use "{searchQuery.trim()}" anyway
                  </button>
                </div>
              )}

              {!isSearching && searchResults.length > 0 && searchQuery.trim().length >= 2 && (
                <div className="border-t border-border mt-2 pt-2">
                  <button
                    onClick={handleCustom}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-secondary text-muted-foreground"
                  >
                    <MapPin className="h-4 w-4" />
                    <span>Use "{searchQuery.trim()}" as custom location</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

CitySearchWidget.displayName = 'CitySearchWidget';
