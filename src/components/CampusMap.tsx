/**
 * CampusMap Component: High-Fidelity Google Maps Verified Campus View
 * Authentic replica of the Google Maps layout for KSREI (K.S. Rangasamy Educational Institutions),
 * Tiruchengode, featuring SH-86 Highway, KSR Institute Rd, Street No. 8, KSR Playground,
 * all 8 Verified Perimeter Gates, KSRCE Blocks A-F, KSRCT Tech Blocks, and Live Google Maps Satellite Mode.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Play,
  Pause,
  RotateCcw,
  Navigation,
  Layers,
  Search,
  Sliders,
  Sun,
  Moon,
  MapPin,
  Flag,
  Coffee,
  Pill,
  CreditCard,
  Bus,
  DoorOpen,
  ExternalLink,
  Globe,
  Compass,
  GraduationCap,
  Building2,
  Eye,
  SplitSquareVertical,
  Check,
} from 'lucide-react';
import { CampusEdge, LocationNode, ShortestPathResult } from '../types/campus';

interface CampusMapProps {
  nodes: LocationNode[];
  edges: CampusEdge[];
  startNodeId: string;
  destNodeId: string;
  routeResult: ShortestPathResult | null;
  onSelectStart: (id: string) => void;
  onSelectDest: (id: string) => void;
  onToggleEdgeBlocked: (fromId: string, toId: string) => void;
  onOpenNodeDetails: (node: LocationNode) => void;
}

export type MapViewMode = 'blueprint' | 'satellite' | 'split';
export type CategoryFilterTab =
  | 'all'
  | 'gates'
  | 'ksrce'
  | 'ksrct'
  | 'academic'
  | 'hostels'
  | 'sports'
  | 'health';

export const CampusMap: React.FC<CampusMapProps> = ({
  nodes,
  edges,
  startNodeId,
  destNodeId,
  routeResult,
  onSelectStart,
  onSelectDest,
  onToggleEdgeBlocked,
  onOpenNodeDetails,
}) => {
  // Map View Mode (Blueprint Vector, Live Google Maps Satellite, or Split Dual View)
  const [mapViewMode, setMapViewMode] = useState<MapViewMode>('blueprint');
  const [satelliteType, setSatelliteType] = useState<'k' | 'm'>('k'); // 'k' = Satellite, 'm' = Roadmap
  const [activeGmapLocation, setActiveGmapLocation] = useState<string>(
    'K.S.+Rangasamy+College+of+Technology,+KSR+Kalvi+Nagar,+Tiruchengode'
  );

  // Map Viewport Transformations
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showEdgeDistances, setShowEdgeDistances] = useState(false);
  const [mapTheme, setMapTheme] = useState<'gmaps_light' | 'gmaps_dark'>('gmaps_light');
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [panelSearch, setPanelSearch] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<CategoryFilterTab>('all');

  // Walking Animation State
  const [isWalking, setIsWalking] = useState(false);
  const [walkProgress, setWalkProgress] = useState(0);
  const [walkSpeed, setWalkSpeed] = useState(1);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Map of nodes for quick access
  const nodeMap = useMemo(() => {
    const map = new Map<string, LocationNode>();
    nodes.forEach(n => map.set(n.id, n));
    return map;
  }, [nodes]);

  // Create an ordered list of coordinates for the active path
  const pathCoordinates = useMemo(() => {
    if (!routeResult || !routeResult.found || routeResult.pathNodeIds.length < 2) {
      return [];
    }
    return routeResult.pathNodeIds
      .map(id => nodeMap.get(id))
      .filter((n): n is LocationNode => Boolean(n))
      .map(n => ({ x: n.x, y: n.y, name: n.name, id: n.id }));
  }, [routeResult, nodeMap]);

  // Cumulative distance calculations for smooth walking animation
  const pathSegments = useMemo(() => {
    if (pathCoordinates.length < 2) return [];
    let cumulative = 0;
    const segments: { from: { x: number; y: number }; to: { x: number; y: number }; length: number; cumStart: number; cumEnd: number }[] = [];

    for (let i = 0; i < pathCoordinates.length - 1; i++) {
      const p1 = pathCoordinates[i];
      const p2 = pathCoordinates[i + 1];
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      segments.push({
        from: p1,
        to: p2,
        length: dist,
        cumStart: cumulative,
        cumEnd: cumulative + dist,
      });
      cumulative += dist;
    }
    return segments;
  }, [pathCoordinates]);

  const totalPathPixelLength = useMemo(() => {
    return pathSegments.reduce((sum, s) => sum + s.length, 0);
  }, [pathSegments]);

  // Current walker coordinates
  const walkerPos = useMemo(() => {
    if (pathSegments.length === 0 || totalPathPixelLength === 0) return null;
    const currentTargetDist = walkProgress * totalPathPixelLength;

    const segment = pathSegments.find(
      s => currentTargetDist >= s.cumStart && currentTargetDist <= s.cumEnd
    ) || pathSegments[pathSegments.length - 1];

    if (!segment || segment.length === 0) return segment ? segment.to : null;

    const segmentRatio = (currentTargetDist - segment.cumStart) / segment.length;
    return {
      x: segment.from.x + (segment.to.x - segment.from.x) * segmentRatio,
      y: segment.from.y + (segment.to.y - segment.from.y) * segmentRatio,
    };
  }, [pathSegments, totalPathPixelLength, walkProgress]);

  // Walking animation loop
  useEffect(() => {
    if (!isWalking) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      lastTimeRef.current = null;
      return;
    }

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      const step = (deltaTime / 10) * walkSpeed;
      setWalkProgress(prev => {
        const next = prev + step;
        if (next >= 1) {
          setIsWalking(false);
          return 1;
        }
        return next;
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isWalking, walkSpeed]);

  const handleStartWalk = () => {
    if (walkProgress >= 1) setWalkProgress(0);
    setIsWalking(true);
  };

  const handlePauseWalk = () => {
    setIsWalking(false);
  };

  const handleResetWalk = () => {
    setIsWalking(false);
    setWalkProgress(0);
  };

  // Zoom & Pan Handlers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.6));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Filtered nodes for the side selection panel
  const panelFilteredNodes = useMemo(() => {
    return nodes.filter(n => {
      const matchSearch =
        n.name.toLowerCase().includes(panelSearch.toLowerCase()) ||
        n.code.toLowerCase().includes(panelSearch.toLowerCase()) ||
        n.buildingNumber.toLowerCase().includes(panelSearch.toLowerCase());

      if (!matchSearch) return false;

      if (selectedCategoryTab === 'all') return true;
      if (selectedCategoryTab === 'gates') return n.category === 'entrance';
      if (selectedCategoryTab === 'ksrce') return n.id.startsWith('loc_ksrce');
      if (selectedCategoryTab === 'ksrct') return n.id.startsWith('loc_ksrct');
      if (selectedCategoryTab === 'academic')
        return n.category === 'academic' || n.category === 'laboratory' || n.category === 'library';
      if (selectedCategoryTab === 'hostels')
        return n.category === 'hostel' || n.category === 'canteen';
      if (selectedCategoryTab === 'sports')
        return n.category === 'sports' || n.category === 'student_center';
      if (selectedCategoryTab === 'health') return n.category === 'health';
      return true;
    });
  }, [nodes, panelSearch, selectedCategoryTab]);

  const isLight = mapTheme === 'gmaps_light';

  // Key Google Maps POIs for quick switching in satellite mode
  const GOOGLE_MAP_QUICK_POIS = [
    { label: 'Campus Overview', query: 'K.S.+Rangasamy+College+of+Technology,+KSR+Kalvi+Nagar,+Tiruchengode' },
    { label: 'KSRCT Main & Cyber Dome', query: 'K.S.+Rangasamy+College+of+Technology,+Tiruchengode' },
    { label: 'KSRCE Engineering Blocks', query: 'K.S.R.+College+of+Engineering,+Tiruchengode' },
    { label: 'KSRCAS Arts & Science', query: 'K.S.+Rangasamy+College+of+Arts+and+Science,+Tiruchengode' },
    { label: 'Dental Hospital & Casualty', query: 'KSR+Institute+of+Dental+Science+and+Research,+Tiruchengode' },
    { label: 'KSRIET Engineering', query: 'KSR+Institute+for+Engineering+and+Technology,+Tiruchengode' },
    { label: 'College of Pharmacy', query: 'KSR+College+of+Pharmacy,+Tiruchengode' },
    { label: 'Gate 1 (Main Arch Highway)', query: 'KSR+Kalvi+Nagar+Main+Gate,+Tiruchengode' },
  ];

  return (
    <div className="relative w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shadow-xl overflow-hidden flex flex-col">
      {/* ========================================================
          1. TOP APP BAR: Mode Switcher (Blueprint / Satellite / Split)
         ======================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 z-30 backdrop-blur-md">
        {/* Left: Branding & Verification Badge */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-sm">
            GPS
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                KSREI Campus Map
              </span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Check className="h-3 w-3" /> Ground-Truth Verified
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              KSR Kalvi Nagar, Tiruchengode · Lat 11.3572° N, Lng 77.9255° E · SH-86
            </p>
          </div>
        </div>

        {/* Center: 3 Map View Mode Switchers */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setMapViewMode('blueprint')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mapViewMode === 'blueprint'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Interactive schematic blueprint with Dijkstra route calculating and walker"
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Blueprint Route</span>
          </button>

          <button
            onClick={() => setMapViewMode('satellite')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mapViewMode === 'satellite'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Live Google Maps Satellite view of KSR Kalvi Nagar"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Google Maps Satellite</span>
          </button>

          <button
            onClick={() => setMapViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mapViewMode === 'split'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Side-by-side comparison of Blueprint and Live Google Maps"
          >
            <SplitSquareVertical className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Split Dual View</span>
          </button>
        </div>

        {/* Right Actions: External Google Maps Live Link & Theme Toggle */}
        <div className="flex items-center gap-2">
          <a
            href="https://www.google.com/maps/search/?api=1&query=K.S.+Rangasamy+Educational+Institutions+KSR+Kalvi+Nagar+Tiruchengode"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
            title="Open KSR Campus directly in Google Maps application"
          >
            <ExternalLink className="h-3.5 w-3.5 text-blue-500" />
            <span className="hidden sm:inline">Open in Google Maps</span>
          </a>

          {mapViewMode === 'blueprint' && (
            <button
              onClick={() => setMapTheme(prev => (prev === 'gmaps_light' ? 'gmaps_dark' : 'gmaps_light'))}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Toggle Google Maps Light / Dark styling"
            >
              {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-400" />}
            </button>
          )}
        </div>
      </div>

      {/* ========================================================
          2. MAIN STAGE: RENDER MODES (Blueprint, Satellite, or Split)
         ======================================================== */}
      <div
        ref={containerRef}
        className={`relative w-full ${
          mapViewMode === 'split' ? 'h-[750px] grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800' : 'h-[620px]'
        } overflow-hidden select-none`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* ===================================================================
            VIEWPORT A: INTERACTIVE BLUEPRINT ROUTE MAP (VECTOR SVG ENGINE)
           =================================================================== */}
        {(mapViewMode === 'blueprint' || mapViewMode === 'split') && (
          <div className="relative w-full h-full overflow-hidden bg-[#e5e3df] dark:bg-[#1a1d21]">
            {/* SVG Canvas */}
            <svg
              viewBox="0 0 1060 650"
              className="w-full h-full transition-transform duration-75 ease-out"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
              }}
            >
              <defs>
                {/* Google Maps Route Pulse Filter */}
                <filter id="routeGlowGmaps" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <pattern id="diagonalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="10" stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.3" />
                </pattern>
              </defs>

              {/* 1. Base Ground (Google Maps Landscape Tone) */}
              <rect x="0" y="0" width="1060" height="650" fill={isLight ? '#f2efe9' : '#1e2227'} />

              {/* 2. State Highway 86 (SH-86 Erode - Tiruchengode) at top y = 45 */}
              <g id="highway-sh86">
                <rect x="20" y="22" width="1020" height="46" fill={isLight ? '#fff176' : '#332e18'} opacity="0.3" rx="4" />
                <path d="M 20 45 L 1040 45" stroke={isLight ? '#fbc02d' : '#8c781e'} strokeWidth="22" strokeLinecap="round" />
                <path d="M 20 45 L 1040 45" stroke="#ffffff" strokeWidth="2" strokeDasharray="16 12" opacity="0.9" />
                <text x="530" y="20" textAnchor="middle" fill={isLight ? '#795548' : '#e0e0e0'} fontSize="9.5" fontWeight="700" letterSpacing="0.8">
                  STATE HIGHWAY 86 (SH-86) · ◄ ERODE (WEST) ────────── TIRUCHENGODE (EAST) ►
                </text>
              </g>

              {/* 3. Internal Campus Road Network (Asphalt White / Dark Gray) */}
              <g id="campus-internal-roads">
                {/* KSR Institute Road (North-South Main Spine: x = 440) */}
                <path d="M 380 45 L 440 135 L 440 220 L 360 295 L 360 440 L 440 520" stroke={isLight ? '#ffffff' : '#2d333b'} strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 380 45 L 440 135 L 440 220 L 360 295 L 360 440 L 440 520" stroke={isLight ? '#e0e0e0' : '#444c56'} strokeWidth="1.2" strokeDasharray="10 6" fill="none" />

                {/* Street No. 8 (East Spine: x = 710 down through KSRCT & Colleges) */}
                <path d="M 720 135 L 720 235 L 710 345 L 710 425 L 730 505" stroke={isLight ? '#ffffff' : '#2d333b'} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 720 135 L 720 235 L 710 345 L 710 425 L 730 505" stroke={isLight ? '#e0e0e0' : '#444c56'} strokeWidth="1.2" strokeDasharray="8 6" fill="none" />

                {/* West Ring & Stadium Road (x = 100 to Playground and Hostels) */}
                <path d="M 90 45 L 100 110 L 100 350 L 90 570" stroke={isLight ? '#ffffff' : '#2d333b'} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />

                {/* South Ring Road (y = 570 across to Gate 6 and Girls Hostel) */}
                <path d="M 90 570 L 200 570 L 320 570 L 440 520 L 640 530 L 750 570 L 860 570" stroke={isLight ? '#ffffff' : '#2d333b'} strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />

                {/* Thokkavadi Village Bypass Road (East Perimeter: x = 940) */}
                <path d="M 880 45 L 840 140 L 840 245 L 940 345 L 910 425 L 850 505 L 860 570" stroke={isLight ? '#ffffff' : '#2d333b'} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />

                {/* Road Street Labels */}
                <text x="445" y="180" fill={isLight ? '#8d949e' : '#768390'} fontSize="8" fontWeight="600">
                  KSR Institute Road
                </text>
                <text x="715" y="285" fill={isLight ? '#8d949e' : '#768390'} fontSize="8" fontWeight="600">
                  Street No. 8
                </text>
                <text x="945" y="380" fill={isLight ? '#8d949e' : '#768390'} fontSize="8" fontWeight="600">
                  Thokkavadi Road
                </text>
                <text x="105" y="240" fill={isLight ? '#8d949e' : '#768390'} fontSize="8" fontWeight="600">
                  Stadium West Road
                </text>
              </g>

              {/* 4. KSR Playground (400m Athletic Track Oval & Stadium Turf) */}
              <g id="ksr-playground-stadium" transform="translate(190, 350)">
                <rect x="-60" y="-60" width="120" height="120" rx="30" fill={isLight ? '#c8e6c9' : '#1e382b'} stroke={isLight ? '#81c784' : '#2e7d32'} strokeWidth="2.5" />
                <ellipse cx="0" cy="0" rx="48" ry="44" fill={isLight ? '#a5d6a7' : '#274b37'} stroke={isLight ? '#ffffff' : '#81c784'} strokeWidth="2" strokeDasharray="4 3" />
                <rect x="-24" y="-30" width="48" height="60" fill="none" stroke={isLight ? '#ffffff' : '#81c784'} strokeWidth="1.2" />
                <circle cx="0" cy="0" r="10" fill="none" stroke={isLight ? '#ffffff' : '#81c784'} strokeWidth="1.2" />
                <text x="0" y="3" textAnchor="middle" fill={isLight ? '#1b5e20' : '#a5d6a7'} fontSize="8" fontWeight="700">
                  KSR SPORTS ARENA
                </text>
                <text x="0" y="14" textAnchor="middle" fill={isLight ? '#2e7d32' : '#81c784'} fontSize="6.5">
                  400m Track · Cricket · Football
                </text>
              </g>

              {/* 5. Interconnecting Pathway Edges */}
              <g id="pathway-edges">
                {edges.map(edge => {
                  const fromNode = nodeMap.get(edge.fromId);
                  const toNode = nodeMap.get(edge.toId);
                  if (!fromNode || !toNode) return null;

                  const isBlocked = edge.isBlocked;

                  return (
                    <g key={edge.id}>
                      <line
                        x1={fromNode.x}
                        y1={fromNode.y}
                        x2={toNode.x}
                        y2={toNode.y}
                        stroke={isBlocked ? '#ef4444' : isLight ? '#cbd5e1' : '#334155'}
                        strokeWidth={isBlocked ? 3.5 : 2}
                        strokeDasharray={isBlocked ? '6 4' : edge.pathType === 'walkway' ? '4 3' : undefined}
                        className="cursor-pointer transition-colors hover:stroke-blue-500"
                        onClick={() => onToggleEdgeBlocked(edge.fromId, edge.toId)}
                      />

                      {/* Optional distance numbers */}
                      {showEdgeDistances && (
                        <text
                          x={(fromNode.x + toNode.x) / 2}
                          y={(fromNode.y + toNode.y) / 2 - 3}
                          textAnchor="middle"
                          fill={isLight ? '#64748b' : '#94a3b8'}
                          fontSize="7"
                          fontWeight="600"
                          className="pointer-events-none select-none"
                        >
                          {edge.distance}m
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* 6. Active Dijkstra Shortest Route (Electric Google Maps Blue) */}
              {routeResult && routeResult.found && pathCoordinates.length >= 2 && (
                <g id="active-shortest-route">
                  <polyline
                    points={pathCoordinates.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke="#1a73e8"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#routeGlowGmaps)"
                    opacity="0.85"
                  />
                  <polyline
                    points={pathCoordinates.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke="#4285f4"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {pathCoordinates.map((coord, idx) => (
                    <circle
                      key={idx}
                      cx={coord.x}
                      cy={coord.y}
                      r="4"
                      fill="#ffffff"
                      stroke="#1a73e8"
                      strokeWidth="2.5"
                    />
                  ))}
                </g>
              )}

              {/* 7. ALL 44 CAMPUS BUILDINGS & LANDMARK POIS */}
              <g id="campus-nodes">
                {nodes.map(node => {
                  const isStart = node.id === startNodeId;
                  const isDest = node.id === destNodeId;
                  const isSelected = node.id === selectedNodeId;
                  const isInPath = routeResult?.found && routeResult.pathNodeIds.includes(node.id);

                  if (node.id === 'loc_ksr_playground') return null; // Rendered as dedicated oval above

                  const w = node.width || 90;
                  const h = node.height || 50;

                  // Distinct category coloring
                  let footprintFill = isLight ? '#f1f3f4' : '#2b3138';
                  let footprintStroke = isLight ? '#dadce0' : '#3c4043';

                  if (node.category === 'entrance') {
                    footprintFill = isLight ? '#fef3c7' : '#3d2e14';
                    footprintStroke = isLight ? '#f59e0b' : '#b45309';
                  } else if (node.category === 'health') {
                    footprintFill = isLight ? '#fce8e6' : '#3c2626';
                    footprintStroke = isLight ? '#fad2cf' : '#7f1d1d';
                  } else if (node.category === 'hostel') {
                    footprintFill = isLight ? '#fff7ed' : '#3b2618';
                    footprintStroke = isLight ? '#fed7aa' : '#9a3412';
                  } else if (node.category === 'canteen') {
                    footprintFill = isLight ? '#ffe4e6' : '#3c1822';
                    footprintStroke = isLight ? '#fecdd3' : '#9f1239';
                  } else if (node.id.startsWith('loc_ksrce')) {
                    footprintFill = isLight ? '#e0f2fe' : '#172e42';
                    footprintStroke = isLight ? '#7dd3fc' : '#0369a1';
                  } else if (node.id.startsWith('loc_ksrct')) {
                    footprintFill = isLight ? '#ede9fe' : '#2b2144';
                    footprintStroke = isLight ? '#c4b5fd' : '#6d28d9';
                  }

                  if (isStart) {
                    footprintFill = isLight ? '#e6f4ea' : '#1e382b';
                    footprintStroke = '#34a853';
                  } else if (isDest) {
                    footprintFill = isLight ? '#fce8e6' : '#492323';
                    footprintStroke = '#ea4335';
                  }

                  const isGate = node.category === 'entrance';

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      className="cursor-pointer group"
                      onClick={() => {
                        setSelectedNodeId(node.id);
                        onOpenNodeDetails(node);
                      }}
                    >
                      {/* Building Footprint Box */}
                      <rect
                        x={-w / 2}
                        y={-h / 2}
                        width={w}
                        height={h}
                        rx={isGate ? 8 : 4}
                        fill={footprintFill}
                        stroke={isSelected ? '#1a73e8' : isInPath ? '#4285f4' : footprintStroke}
                        strokeWidth={isSelected || isInPath ? 2.5 : isGate ? 2 : 1.2}
                        className="transition-all hover:brightness-95"
                      />

                      {/* Gate Pillar Notch Marker for Entrances */}
                      {isGate && (
                        <g>
                          <rect x={-w / 2} y={-h / 2} width="5" height={h} fill="#d97706" rx="2" />
                          <rect x={w / 2 - 5} y={-h / 2} width="5" height={h} fill="#d97706" rx="2" />
                        </g>
                      )}

                      {/* Main Node Name Text */}
                      <text
                        textAnchor="middle"
                        y={isGate ? -3 : -4}
                        fill={isGate ? '#b45309' : isLight ? '#3c4043' : '#e8eaed'}
                        fontSize={isGate ? '8' : '8'}
                        fontWeight="700"
                        className="pointer-events-none select-none font-sans"
                      >
                        {node.name.length > 20 ? node.name.slice(0, 18) + '…' : node.name}
                      </text>

                      {/* Secondary Code Subtitle */}
                      <text
                        textAnchor="middle"
                        y={isGate ? 9 : 8}
                        fill={isLight ? '#70757a' : '#9aa0a6'}
                        fontSize="6.8"
                        fontWeight="600"
                        className="pointer-events-none select-none"
                      >
                        {node.code}
                      </text>

                      {/* Category Badge Icon */}
                      <circle
                        cx={-w / 2 + 9}
                        cy={-h / 2 + 9}
                        r="5"
                        fill={
                          isGate
                            ? '#d97706'
                            : node.category === 'health'
                            ? '#ea4335'
                            : node.category === 'hostel'
                            ? '#ea580c'
                            : node.category === 'canteen'
                            ? '#e11d48'
                            : node.id.startsWith('loc_ksrce')
                            ? '#0284c7'
                            : node.id.startsWith('loc_ksrct')
                            ? '#7c3aed'
                            : '#2563eb'
                        }
                      />

                      {/* Start Flag Marker */}
                      {isStart && (
                        <g transform={`translate(0, ${-h / 2 - 14})`}>
                          <rect x="-24" y="-7" width="48" height="15" rx="7.5" fill="#34a853" stroke="#ffffff" strokeWidth="1" />
                          <text textAnchor="middle" y="3.5" fill="#ffffff" fontSize="8" fontWeight="700">
                            ● START
                          </text>
                        </g>
                      )}

                      {/* Destination Flag Marker */}
                      {isDest && (
                        <g transform={`translate(0, ${-h / 2 - 14})`}>
                          <rect x="-26" y="-7" width="52" height="15" rx="7.5" fill="#ea4335" stroke="#ffffff" strokeWidth="1" />
                          <text textAnchor="middle" y="3.5" fill="#ffffff" fontSize="8" fontWeight="700">
                            🏁 DEST
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* 8. Animated Pedestrian Walker Avatar */}
              {walkerPos && (
                <g transform={`translate(${walkerPos.x}, ${walkerPos.y})`}>
                  <circle r="14" fill="#4285f4" opacity="0.3" className="animate-ping" />
                  <circle r="8" fill="#1a73e8" stroke="#ffffff" strokeWidth="2.5" />
                  <circle r="3.5" fill="#ffffff" />
                </g>
              )}
            </svg>

            {/* Top Filter Category Strip (Google Maps Chips) */}
            <div className="absolute top-4 left-4 z-20 hidden md:flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 shadow-lg border border-slate-200 dark:border-slate-800 backdrop-blur-md text-xs">
              <button
                onClick={() => setSelectedCategoryTab('all')}
                className={`rounded-full px-3 py-1 font-medium transition-colors ${
                  selectedCategoryTab === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                All ({nodes.length})
              </button>
              <button
                onClick={() => setSelectedCategoryTab('gates')}
                className={`flex items-center gap-1 rounded-full px-3 py-1 font-medium transition-colors ${
                  selectedCategoryTab === 'gates'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <DoorOpen className="h-3.5 w-3.5 text-amber-400" />
                <span>Gates (8)</span>
              </button>
              <button
                onClick={() => setSelectedCategoryTab('ksrce')}
                className={`rounded-full px-3 py-1 font-medium transition-colors ${
                  selectedCategoryTab === 'ksrce'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                KSRCE (A-F)
              </button>
              <button
                onClick={() => setSelectedCategoryTab('ksrct')}
                className={`rounded-full px-3 py-1 font-medium transition-colors ${
                  selectedCategoryTab === 'ksrct'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                KSRCT Tech
              </button>
              <button
                onClick={() => setSelectedCategoryTab('hostels')}
                className={`rounded-full px-3 py-1 font-medium transition-colors ${
                  selectedCategoryTab === 'hostels'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Hostels & Mess
              </button>
              <button
                onClick={() => setSelectedCategoryTab('sports')}
                className={`rounded-full px-3 py-1 font-medium transition-colors ${
                  selectedCategoryTab === 'sports'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Sports Arena
              </button>
              <button
                onClick={() => setSelectedCategoryTab('health')}
                className={`flex items-center gap-1 rounded-full px-3 py-1 font-medium transition-colors ${
                  selectedCategoryTab === 'health'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Pill className="h-3.5 w-3.5 text-red-500" />
                <span>Dental & Health</span>
              </button>
            </div>

            {/* Bottom Floating Walking Animation Controls */}
            {routeResult && routeResult.found && (
              <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 p-2 shadow-xl border border-slate-200 dark:border-slate-800 backdrop-blur-md">
                <div className="flex items-center gap-1 px-1">
                  {!isWalking ? (
                    <button
                      onClick={handleStartWalk}
                      className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-blue-700 transition-colors"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>{walkProgress > 0 && walkProgress < 1 ? 'Resume Walk' : 'Walk Route'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handlePauseWalk}
                      className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-amber-700 transition-colors"
                    >
                      <Pause className="h-3.5 w-3.5 fill-current" />
                      <span>Pause</span>
                    </button>
                  )}

                  <button
                    onClick={handleResetWalk}
                    className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg transition-colors"
                    title="Reset walking position"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

                <div className="flex items-center gap-1">
                  {[1, 2, 4].map(spd => (
                    <button
                      key={spd}
                      onClick={() => setWalkSpeed(spd)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        walkSpeed === spd
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Right Zoom / Reset Controls */}
            <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 p-1 shadow-lg border border-slate-200 dark:border-slate-800 backdrop-blur-md">
              <button
                onClick={handleZoomIn}
                className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                onClick={handleResetView}
                className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Reset map pan and zoom"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowEdgeDistances(prev => !prev)}
                className={`p-2 rounded-lg transition-colors ${
                  showEdgeDistances
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Toggle distance labels on pathways"
              >
                <Sliders className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
            VIEWPORT B: LIVE GOOGLE MAPS SATELLITE / TERRAIN INTEGRATION
           =================================================================== */}
        {(mapViewMode === 'satellite' || mapViewMode === 'split') && (
          <div className="relative w-full h-full flex flex-col bg-slate-900 overflow-hidden">
            {/* Satellite Top Quick POI Selector Strip */}
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-950/95 border-b border-slate-800 overflow-x-auto text-xs z-20">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-400 whitespace-nowrap shrink-0 pr-2 border-r border-slate-800">
                <Globe className="h-3.5 w-3.5" />
                <span>Jump to Block:</span>
              </div>

              {GOOGLE_MAP_QUICK_POIS.map((poi, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveGmapLocation(poi.query)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    activeGmapLocation === poi.query
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {poi.label}
                </button>
              ))}

              <div className="ml-auto flex items-center gap-1 shrink-0 pl-2">
                <button
                  onClick={() => setSatelliteType(prev => (prev === 'k' ? 'm' : 'k'))}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 font-medium border border-slate-700 transition-colors"
                >
                  {satelliteType === 'k' ? '🗺️ Roadmap View' : '🛰️ Satellite View'}
                </button>
              </div>
            </div>

            {/* Embedded Interactive Google Map Iframe */}
            <div className="relative flex-1 w-full h-full">
              <iframe
                title="Google Maps KSR Kalvi Nagar Live View"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://maps.google.com/maps?q=${activeGmapLocation}&t=${satelliteType}&z=17&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full filter contrast-105"
              />

              {/* Float Badge Over Google Map */}
              <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2.5 rounded-xl bg-slate-950/90 backdrop-blur-md px-3 py-2 text-xs text-white border border-slate-800 shadow-2xl">
                <div className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <span className="font-semibold block text-slate-200">
                    K.S. Rangasamy Educational Institutions (KSREI)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Live Google Maps Aerial Layer · Kalvi Nagar, Tiruchengode 637215
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
