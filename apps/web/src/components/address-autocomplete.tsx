'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    road?: string;
    house_number?: string;
    suburb?: string;
    municipality?: string;
  };
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: AddressSuggestion) => void;
  placeholder?: string;
  label?: string;
}

export function AddressAutocomplete({ value, onChange, onSelect, placeholder, label }: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (value.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value + ', Portugal')}&limit=5&addressdetails=1&countrycodes=pt,ao`
        );
        const data = await res.json();
        setSuggestions(data || []);
        setIsOpen(data && data.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      {label && <label className="block text-sm text-foreground-muted mb-1">{label}</label>}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-accent/20"
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-olive-200 border-t-olive-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-xl border border-border shadow-elevated max-h-64 overflow-y-auto">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                onSelect(s);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-cream-100 transition-colors border-b border-border last:border-b-0"
            >
              <p className="text-sm text-foreground font-medium truncate">{s.display_name}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
