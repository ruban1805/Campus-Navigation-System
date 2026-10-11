/**
 * NavigationControls Component
 * Provides Search with Autocomplete (using LocationHashTable),
 * Source/Destination selection, swap button, accessibility toggles, and quick presets.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ArrowRightLeft,
  MapPin,
  Flag,
  Accessibility,
  Construction,
  Sparkles,
  RotateCcw,
  Navigation,
  Compass,
} from 'lucide-react';
import { LocationNode } from '../types/campus';
import { LocationHashTable } from '../models/HashTable';
import { CATEGORY_INFO } from '../data/defaultCampusData';

interface NavigationControlsProps {
  nodes: LocationNode[];
  hashTable: LocationHashTable;
  startNodeId: string;
  destNodeId: string;
  requireAccessible: boolean;
  onSelectStart: (id: string) => void;
  onSelectDest: (id: string) => void;
  onSwapPoints: () => void;
  onToggleAccessible: () => void;
  onResetRoute: () => void;
  onCalculateRoute: () => void;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  nodes,
  hashTable,
  startNodeId,
  destNodeId,
  requireAccessible,
  onSelectStart,
  onSelectDest,
  onSwapPoints,
  onToggleAccessible,
  onResetRoute,
  onCalculateRoute,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationNode[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Perform Hash Table search whenever searchQuery changes
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const results = hashTable.search(searchQuery, 6);
      setSearchResults(results);
      setIsSearchOpen(true);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  }, [searchQuery, hashTable]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchResultClick = (node: LocationNode, target: 'start' | 'dest') => {
    if (target === 'start') {
      onSelectStart(node.id);
    } else {
      onSelectDest(node.id);
    }
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const quickPresets = [
    { label: 'Gate 1 (Main Arch) → KSRCE', start: 'loc_ksr_main_gate', dest: 'loc_ksrce' },
    { label: 'Gate 1 (Main Arch) → KSRCT', start: 'loc_ksr_main_gate', dest: 'loc_ksrct_it' },
    { label: 'Gate 2 (Medical) → Dental OPD', start: 'loc_ksr_gate_2', dest: 'loc_ksr_dental' },
    { label: 'Gate 3 (Bus Depot) → Central Mess', start: 'loc_ksr_gate_3', dest: 'loc_ksr_mess' },
    { label: 'Gate 6 (South Gate) → Girls Hostel', start: 'loc_ksr_gate_6', dest: 'loc_ksr_girls_hostel' },
    { label: 'Gate 8 (Sports Gate) → KSR Playground', start: 'loc_ksr_gate_8', dest: 'loc_ksr_playground' },
  ];

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-xl backdrop-blur-md">
      {/* Search Bar with Autocomplete (powered by Hash Table) */}
      <div ref={searchRef} className="relative">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchQuery.trim().length > 0) setIsSearchOpen(true);
            }}
            placeholder="Search campus buildings, labs, code (e.g. LIB-200, Canteen)..."
            className="w-full rounded-lg border border-slate-700 bg-slate-950/90 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Autocomplete Dropdown List */}
        {isSearchOpen && searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-lg border border-slate-700 bg-slate-950 shadow-2xl">
            <div className="border-b border-slate-800 px-3 py-1.5 text-[11px] font-semibold text-slate-400">
              Found via Hash Table Chaining Search ({searchResults.length})
            </div>
            {searchResults.map(loc => {
              const catInfo = CATEGORY_INFO[loc.category];
              return (
                <div
                  key={loc.id}
                  className="flex items-center justify-between border-b border-slate-800/60 p-2.5 hover:bg-slate-900 transition-colors"
                >
                  <div className="flex flex-col pr-2">
                    <span className="text-xs font-semibold text-white">{loc.name}</span>
                    <span className="text-[11px] text-slate-400">
                      {loc.code} · {catInfo.label} · {loc.buildingNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleSearchResultClick(loc, 'start')}
                      className="rounded bg-emerald-950 px-2 py-1 text-[10px] font-medium text-emerald-300 border border-emerald-800/50 hover:bg-emerald-900"
                    >
                      Set Start
                    </button>
                    <button
                      onClick={() => handleSearchResultClick(loc, 'dest')}
                      className="rounded bg-rose-950 px-2 py-1 text-[10px] font-medium text-rose-300 border border-rose-800/50 hover:bg-rose-900"
                    >
                      Set Dest
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Origin & Destination Selectors */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 relative">
        {/* Starting Location Picker */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <MapPin className="h-3.5 w-3.5" />
            <span>Starting Point (Source)</span>
          </label>
          <select
            value={startNodeId}
            onChange={e => onSelectStart(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs sm:text-sm text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {nodes.map(n => (
              <option key={n.id} value={n.id}>
                {n.name} ({n.code})
              </option>
            ))}
          </select>
        </div>

        {/* Destination Location Picker */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
            <Flag className="h-3.5 w-3.5" />
            <span>Destination (Target)</span>
          </label>
          <select
            value={destNodeId}
            onChange={e => onSelectDest(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs sm:text-sm text-slate-100 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          >
            {nodes.map(n => (
              <option key={n.id} value={n.id}>
                {n.name} ({n.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Row: Swap, Accessibility Toggle, Calculate */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          {/* Swap Button */}
          <button
            onClick={onSwapPoints}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            title="Swap Origin and Destination"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            <span>Swap</span>
          </button>

          {/* Wheelchair Accessibility Toggle */}
          <button
            onClick={onToggleAccessible}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              requireAccessible
                ? 'border-indigo-500/60 bg-indigo-950/70 text-indigo-300'
                : 'border-slate-700 bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Accessibility className="h-3.5 w-3.5" />
            <span>Accessible Only</span>
          </button>

          {/* Reset Route */}
          <button
            onClick={onResetRoute}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            title="Reset Route Selection"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Calculate Shortest Route CTA */}
        <button
          onClick={onCalculateRoute}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition-colors"
        >
          <Navigation className="h-3.5 w-3.5" />
          <span>Find Shortest Route</span>
        </button>
      </div>

      {/* Quick Route Presets */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
        <span className="text-[11px] font-medium text-slate-500 shrink-0">Sample Routes:</span>
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {quickPresets.map((preset, i) => (
            <button
              key={i}
              onClick={() => {
                onSelectStart(preset.start);
                onSelectDest(preset.dest);
              }}
              className="rounded-md bg-slate-800/80 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-slate-700 hover:text-white transition-colors whitespace-nowrap"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
