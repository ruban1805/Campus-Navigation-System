/**
 * FacilityDirectory Component
 * Comprehensive catalog of all campus facilities categorized by type:
 * Classrooms, Laboratories, Libraries, Canteens, Admin, Parking, Entrances, etc.
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Flag,
  Navigation,
  Clock,
  Building2,
  Check,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { LocationCategory, LocationNode } from '../types/campus';
import { CATEGORY_INFO } from '../data/defaultCampusData';

interface FacilityDirectoryProps {
  nodes: LocationNode[];
  onSelectStart: (id: string) => void;
  onSelectDest: (id: string) => void;
  onViewOnMap: (id: string) => void;
}

export const FacilityDirectory: React.FC<FacilityDirectoryProps> = ({
  nodes,
  onSelectStart,
  onSelectDest,
  onViewOnMap,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: { key: string; label: string }[] = [
    { key: 'all', label: 'All KSREI Facilities' },
    { key: 'entrance', label: 'Campus Gates (8 Gates)' },
    { key: 'ksrce', label: 'KSRCE Blocks (A-F)' },
    { key: 'ksrct', label: 'KSRCT Tech Blocks' },
    { key: 'academic', label: 'Colleges & Academic Blocks' },
    { key: 'laboratory', label: 'Computing & Biotech Labs' },
    { key: 'library', label: 'Knowledge Centre & Libraries' },
    { key: 'administrative', label: 'Admin & COE Offices' },
    { key: 'canteen', label: 'Food Courts & Canteens' },
    { key: 'hostel', label: 'Student Hostels' },
    { key: 'health', label: 'Dental Hospital & Medical' },
    { key: 'sports', label: 'Sports Stadium & Arena' },
    { key: 'parking', label: 'Bus Stand & Parking Hub' },
  ];

  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      let matchesCat = false;
      if (selectedCategory === 'all') {
        matchesCat = true;
      } else if (selectedCategory === 'ksrce') {
        matchesCat = node.id.startsWith('loc_ksrce');
      } else if (selectedCategory === 'ksrct') {
        matchesCat = node.id.startsWith('loc_ksrct');
      } else {
        matchesCat = node.category === selectedCategory;
      }
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        node.name.toLowerCase().includes(q) ||
        node.code.toLowerCase().includes(q) ||
        node.description.toLowerCase().includes(q) ||
        node.buildingNumber.toLowerCase().includes(q) ||
        node.amenities.some(a => a.toLowerCase().includes(q));

      return matchesCat && matchesSearch;
    });
  }, [nodes, selectedCategory, searchQuery]);

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-slate-800 bg-slate-900/95 p-4 sm:p-6 shadow-2xl backdrop-blur-md">
      {/* Directory Header & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white">Campus Facility Directory</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Explore academic halls, research laboratories, study spaces, and dining facilities.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search facility name or amenity..."
            className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Facility Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredNodes.length > 0 ? (
          filteredNodes.map(node => {
            const catInfo = CATEGORY_INFO[node.category];
            return (
              <div
                key={node.id}
                className="flex flex-col justify-between rounded-xl border border-slate-800/80 bg-slate-950/70 p-4 transition-all hover:border-slate-700 hover:bg-slate-950 shadow-md"
              >
                <div>
                  {/* Card Header: Category & Code */}
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className={`font-semibold ${catInfo.color}`}>
                      {catInfo.label}
                    </span>
                    <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 font-mono text-[11px] text-slate-300">
                      {node.code}
                    </span>
                  </div>

                  {/* Building Title */}
                  <h3 className="text-sm font-bold text-white leading-snug">
                    {node.name}
                  </h3>

                  {/* Meta Specs */}
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    <span>{node.buildingNumber}</span>
                    <span>·</span>
                    <span>{node.floorCount} {node.floorCount === 1 ? 'Floor' : 'Floors'}</span>
                    {node.capacity && (
                      <>
                        <span>·</span>
                        <span className="text-slate-300 font-mono">{node.capacity}</span>
                      </>
                    )}
                    {node.contactExt && (
                      <>
                        <span>·</span>
                        <span className="text-indigo-400 font-mono">{node.contactExt}</span>
                      </>
                    )}
                  </div>

                  {/* Description */}
                  <p className="mt-2 text-xs text-slate-300/80 leading-relaxed">
                    {node.description}
                  </p>

                  {/* Departments / Key Divisions */}
                  {node.departments && node.departments.length > 0 && (
                    <div className="mt-2.5 rounded bg-slate-900/80 border border-slate-800/80 p-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Departments & Offices
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-300">
                        {node.departments.map((dept, idx) => (
                          <React.Fragment key={idx}>
                            <span>{dept}</span>
                            {idx < node.departments!.length - 1 && <span className="text-slate-600">·</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Operating Hours */}
                  <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Clock className="h-3 w-3 text-slate-500" />
                    <span>{node.openingHours}</span>
                  </div>

                  {/* Amenities Tags (Clean text with typographic separators) */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                    {node.amenities.map((amenity, idx) => (
                      <React.Fragment key={idx}>
                        <span>{amenity}</span>
                        {idx < node.amenities.length - 1 && <span className="text-slate-600">·</span>}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Floor-by-Floor Directory Accordion */}
                  {node.floorDirectory && node.floorDirectory.length > 0 && (
                    <details className="mt-3 group/floor text-[11px] border-t border-slate-800/70 pt-2">
                      <summary className="cursor-pointer font-semibold text-indigo-400 hover:text-indigo-300 select-none flex items-center justify-between">
                        <span>Floor-by-Floor Directory ({node.floorDirectory.length} levels)</span>
                        <span className="text-slate-500 text-[10px] group-open/floor:rotate-180 transition-transform">▼</span>
                      </summary>
                      <div className="mt-2 space-y-1.5 pl-2 border-l border-slate-800">
                        {node.floorDirectory.map((f, i) => (
                          <div key={i} className="flex flex-col">
                            <span className="font-bold text-slate-200">{f.floor}:</span>
                            <span className="text-slate-400">{f.highlights}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="mt-4 flex flex-wrap items-center justify-between border-t border-slate-800/80 pt-3 gap-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onViewOnMap(node.id)}
                      className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <span>Interactive Map</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${node.name}, KSR Kalvi Nagar, Tiruchengode, Tamil Nadu`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                      title="Open in Google Maps"
                    >
                      <span>Google Maps</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectStart(node.id)}
                      className="rounded bg-emerald-950 border border-emerald-800/60 px-2.5 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-900 transition-colors"
                    >
                      Start
                    </button>
                    <button
                      onClick={() => onSelectDest(node.id)}
                      className="rounded bg-rose-950 border border-rose-800/60 px-2.5 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-900 transition-colors"
                    >
                      Destination
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-xs text-slate-500">
            No campus facilities match the selected criteria.
          </div>
        )}
      </div>
    </div>
  );
};
