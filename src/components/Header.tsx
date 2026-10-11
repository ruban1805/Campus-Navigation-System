/**
 * Header Component: Follows Universal Frontend Design Constitution
 * Strict 3-Zone Top Bar Contract:
 * [Zone 1: Single Brand wordmark] - [Zone 2: 4-5 single-line nav links] - [Zone 3: 1 primary action]
 */

import React from 'react';
import { Compass, Sparkles } from 'lucide-react';

export type ActiveTab = 'map' | 'facilities' | 'datastructures' | 'javacode' | 'vscode';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single-element brand wordmark */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
            <Compass className="h-5 w-5" />
          </div>
          <span className="text-base font-bold tracking-tight text-white sm:text-lg">
            KSREI Campus Navigator
          </span>
        </div>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => onTabChange('map')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'map'
                ? 'text-indigo-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Campus Map & Route
          </button>
          <button
            onClick={() => onTabChange('facilities')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'facilities'
                ? 'text-indigo-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Facility Directory
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenAddModal}
            className="rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-indigo-500"
          >
            Manage Locations
          </button>
        </div>
      </div>

      {/* Mobile nav strip */}
      <div className="flex md:hidden overflow-x-auto border-t border-slate-800/80 px-4 py-2 gap-4 text-xs font-medium scrollbar-none">
        <button
          onClick={() => onTabChange('map')}
          className={`whitespace-nowrap shrink-0 ${activeTab === 'map' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
        >
          Campus Map
        </button>
        <button
          onClick={() => onTabChange('facilities')}
          className={`whitespace-nowrap shrink-0 ${activeTab === 'facilities' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
        >
          Facilities
        </button>
      </div>
    </header>
  );
};
