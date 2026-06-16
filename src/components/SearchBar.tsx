'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import { detectSearchLocation, getSearchSuggestions } from '@/lib/search';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { agents, setSearchLocation, setSearchQuery } = useAppStore();

  useEffect(() => {
    const nextSuggestions = getSearchSuggestions(query, agents);
    setSuggestions(nextSuggestions);
    setShowSuggestions(nextSuggestions.length > 0);
  }, [agents, query]);

  const handleSearch = (location: string) => {
    setQuery(location);
    setShowSuggestions(false);
    setSearchQuery(location);
    setSearchLocation(detectSearchLocation(location, agents));
  };

  return (
    <div className="relative max-w-5xl">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearchQuery(e.target.value);
            setSearchLocation(detectSearchLocation(e.target.value, agents));
          }}
          onFocus={() => query.length > 2 && setShowSuggestions(true)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleSearch(query);
            }
          }}
          placeholder="Search ZIP, city, neighborhood, specialty, language, brokerage, license, or agent"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-12 text-base focus:border-transparent focus:ring-2 focus:ring-primary-500"
        />
        <svg
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((location, index) => (
            <button
              key={index}
              onClick={() => handleSearch(location)}
              className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left hover:bg-gray-50 last:border-b-0"
            >
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-sm">{location}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
