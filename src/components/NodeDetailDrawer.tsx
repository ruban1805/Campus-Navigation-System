/**
 * NodeDetailDrawer Component
 * Displays building details, amenities, opening hours, connectivity,
 * and quick route action buttons when a location is clicked on the campus map.
 */

import React from 'react';
import {
  X,
  MapPin,
  Flag,
  Clock,
  Layers,
  Building,
  Check,
  Compass,
  ExternalLink,
} from 'lucide-react';
import { LocationNode } from '../types/campus';
import { CATEGORY_INFO } from '../data/defaultCampusData';

interface NodeDetailDrawerProps {
  node: LocationNode | null;
  onClose: () => void;
  onSetAsStart: (id: string) => void;
  onSetAsDest: (id: string) => void;
  degree?: number;
}

export const NodeDetailDrawer: React.FC<NodeDetailDrawerProps> = ({
  node,
  onClose,
  onSetAsStart,
  onSetAsDest,
  degree = 0,
}) => {
  if (!node) return null;

  const catInfo = CATEGORY_INFO[node.category];
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${node.name}, KSR Kalvi Nagar, Tiruchengode, Tamil Nadu 637215`
  )}`;

  return (
    <div className="absolute right-4 top-14 z-30 w-84 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-700 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md animate-fade-in">
      <div className="flex items-start justify-between border-b border-slate-800 pb-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-semibold ${catInfo.color}`}>
              {catInfo.label}
            </span>
            <span className="text-slate-500">·</span>
            <span className="font-mono text-xs font-bold text-slate-300">
              {node.code}
            </span>
          </div>
          <h3 className="text-sm font-bold text-white mt-0.5">{node.name}</h3>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="py-3 space-y-2.5 text-xs text-slate-300">
        <p className="leading-relaxed text-slate-300/90">{node.description}</p>

        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
          <div className="rounded bg-slate-950 p-2 border border-slate-800">
            <span className="text-slate-500">Location:</span>
            <div className="text-slate-200 font-semibold">{node.buildingNumber}</div>
          </div>
          <div className="rounded bg-slate-950 p-2 border border-slate-800">
            <span className="text-slate-500">Floors:</span>
            <div className="text-slate-200 font-semibold">{node.floorCount}</div>
          </div>
          {node.capacity && (
            <div className="col-span-2 rounded bg-slate-950 p-2 border border-slate-800">
              <span className="text-slate-500">Capacity:</span>
              <div className="text-slate-200 font-semibold">{node.capacity}</div>
            </div>
          )}
        </div>

        {node.contactExt && (
          <div className="flex items-center gap-1.5 text-[11px] text-indigo-400 font-mono">
            <span>Intercom / Phone: {node.contactExt}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Clock className="h-3 w-3 text-slate-500 shrink-0" />
          <span>{node.openingHours}</span>
        </div>

        {/* Live Google Maps Link */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-lg bg-blue-950/60 border border-blue-800/60 px-2.5 py-1.5 text-[11px] font-semibold text-blue-300 hover:bg-blue-900/60 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-blue-400" />
            <span>Open in Google Maps</span>
          </span>
          <ExternalLink className="h-3 w-3 text-blue-400" />
        </a>

        {node.departments && node.departments.length > 0 && (
          <div className="rounded bg-slate-950 p-2 border border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Departments & Units:
            </span>
            <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-300">
              {node.departments.map((d, i) => (
                <React.Fragment key={i}>
                  <span>{d}</span>
                  {i < node.departments!.length - 1 && <span className="text-slate-600">·</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        <div>
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">
            Amenities:
          </span>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-300">
            {node.amenities.map((a, i) => (
              <React.Fragment key={i}>
                <span>{a}</span>
                {i < node.amenities.length - 1 && <span className="text-slate-600">·</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {node.floorDirectory && node.floorDirectory.length > 0 && (
          <details className="group/drawer text-[11px] border-t border-slate-800/80 pt-2">
            <summary className="cursor-pointer font-semibold text-indigo-400 hover:text-indigo-300 select-none flex items-center justify-between">
              <span>Floor-by-Floor Guide</span>
              <span className="text-slate-500 text-[10px] group-open/drawer:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-2 space-y-1.5 pl-2 border-l border-slate-800 max-h-36 overflow-y-auto">
              {node.floorDirectory.map((f, i) => (
                <div key={i} className="flex flex-col">
                  <span className="font-bold text-slate-200">{f.floor}:</span>
                  <span className="text-slate-400">{f.highlights}</span>
                </div>
              ))}
            </div>
          </details>
        )}

        <div className="text-[11px] text-slate-500">
          Campus Graph Connectivity: <span className="text-indigo-400 font-mono font-bold">{degree} direct paths</span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-800 pt-3 gap-2">
        <button
          onClick={() => {
            onSetAsStart(node.id);
            onClose();
          }}
          className="flex-1 rounded-lg bg-emerald-950 border border-emerald-800/60 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900 transition-colors text-center"
        >
          Set as Start
        </button>
        <button
          onClick={() => {
            onSetAsDest(node.id);
            onClose();
          }}
          className="flex-1 rounded-lg bg-rose-950 border border-rose-800/60 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-900 transition-colors text-center"
        >
          Set Destination
        </button>
      </div>
    </div>
  );
};
