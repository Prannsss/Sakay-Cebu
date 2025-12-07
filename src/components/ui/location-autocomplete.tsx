'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import cebuLocationsData from '@/data/places.json';

interface CebuLocation {
  municipality: string;
  barangay: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function LocationAutocomplete({
  value,
  onChange,
  placeholder = 'Enter location...',
  disabled = false,
  className,
}: LocationAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>(undefined);

  // Format location as "Barangay, Municipality, Cebu"
  const formatLocation = (location: CebuLocation): string => {
    return `${location.barangay}, ${location.municipality}, Cebu`;
  };

  // Get all formatted locations
  const allLocations = cebuLocationsData.locations.map(formatLocation);

  // Fuzzy matching function - matches if all characters in pattern appear in order in the string
  const fuzzyMatch = (str: string, pattern: string): boolean => {
    const patternLower = pattern.toLowerCase();
    const strLower = str.toLowerCase();
    
    // Simple contains check (prioritize exact substring matches)
    if (strLower.includes(patternLower)) return true;
    
    // Fuzzy matching: check if pattern characters appear in order
    let patternIndex = 0;
    for (let i = 0; i < strLower.length && patternIndex < patternLower.length; i++) {
      if (strLower[i] === patternLower[patternIndex]) {
        patternIndex++;
      }
    }
    return patternIndex === patternLower.length;
  };

  // Scoring function for better ranking
  const scoreMatch = (str: string, pattern: string): number => {
    const strLower = str.toLowerCase();
    const patternLower = pattern.toLowerCase();
    
    // Exact match at start gets highest score
    if (strLower.startsWith(patternLower)) return 100;
    
    // Contains pattern gets medium score
    const index = strLower.indexOf(patternLower);
    if (index !== -1) return 50 - index; // Earlier matches score higher
    
    // Fuzzy match gets lower score
    return 10;
  };

  // Debounced search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (value.trim().length > 0) {
        // Filter and score matches
        const matches = allLocations
          .filter((location) => fuzzyMatch(location, value))
          .map((location) => ({
            location,
            score: scoreMatch(location, value),
          }))
          .sort((a, b) => b.score - a.score)
          .map((item) => item.location)
          .slice(0, 10); // Limit to 10 suggestions

        setSuggestions(matches);
        setIsOpen(matches.length > 0);
        setHighlightedIndex(-1);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (place: string) => {
    onChange(place);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelect(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={cn('pl-9', className)}
        />
      </div>
      
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-60 overflow-auto">
          <div className="py-1">
            {suggestions.map((place, index) => (
              <div
                key={place}
                onClick={() => handleSelect(place)}
                className={cn(
                  'flex items-center px-3 py-2 cursor-pointer hover:bg-accent transition-colors',
                  highlightedIndex === index && 'bg-accent'
                )}
              >
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">{place}</span>
                {value === place && (
                  <Check className="ml-auto h-4 w-4 text-primary flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
