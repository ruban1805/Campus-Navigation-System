/**
 * RouteSummary Component
 * Displays distance, walking time, estimated steps, calories, turn-by-turn navigation,
 * and voice guidance via browser speech synthesis.
 */

import React, { useState } from 'react';
import {
  Footprints,
  Clock,
  Flame,
  Volume2,
  VolumeX,
  AlertTriangle,
  ArrowUp,
  CornerUpLeft,
  CornerUpRight,
  MapPin,
  CheckCircle,
  Navigation,
} from 'lucide-react';
import { LocationNode, NavigationStep, ShortestPathResult, TurnDirection } from '../types/campus';

interface RouteSummaryProps {
  routeResult: ShortestPathResult | null;
  startNode?: LocationNode;
  destNode?: LocationNode;
  onClearRoute: () => void;
  onOpenDataStructures: () => void;
}

export const RouteSummary: React.FC<RouteSummaryProps> = ({
  routeResult,
  startNode,
  destNode,
  onClearRoute,
  onOpenDataStructures,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!routeResult) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center">
        <Navigation className="h-8 w-8 text-slate-600 mb-2" />
        <h3 className="text-sm font-semibold text-slate-300">No Active Route</h3>
        <p className="mt-1 max-w-xs text-xs text-slate-500">
          Select a starting point and destination, then click &ldquo;Find Shortest Route&rdquo; to calculate the optimal path using Dijkstra&rsquo;s algorithm.
        </p>
      </div>
    );
  }

  // Handle case when no path exists
  if (!routeResult.found) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-rose-900/40 bg-rose-950/20 p-5 text-rose-200">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
          <h4 className="text-sm font-bold text-rose-300">Route Unreachable</h4>
        </div>
        <p className="text-xs text-rose-200/90 leading-relaxed">
          {routeResult.errorMessage ||
            'No valid path exists between the selected points. Verify whether connected paths are blocked or accessible routes are required.'}
        </p>
        <div className="flex gap-2 pt-2">
          <button
            onClick={onClearRoute}
            className="rounded-lg bg-rose-900/40 px-3 py-1.5 text-xs font-semibold text-rose-200 hover:bg-rose-800/60 transition-colors"
          >
            Reset Route
          </button>
        </div>
      </div>
    );
  }

  // Voice narration of directions using Web Speech API
  const handleToggleVoice = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel(); // Clear any ongoing queue
    const fullText = `Campus navigation from ${startNode?.name} to ${destNode?.name}. Total distance is ${
      routeResult.totalDistanceMeters
    } meters, estimated walking time is ${routeResult.walkingTimeMinutes} minutes. ${routeResult.steps
      .map(s => s.instruction)
      .join(' ')}`;

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const getDirectionIcon = (direction: TurnDirection) => {
    switch (direction) {
      case 'start':
        return <MapPin className="h-4 w-4 text-emerald-400" />;
      case 'left':
      case 'sharp_left':
      case 'slight_left':
        return <CornerUpLeft className="h-4 w-4 text-sky-400" />;
      case 'right':
      case 'sharp_right':
      case 'slight_right':
        return <CornerUpRight className="h-4 w-4 text-sky-400" />;
      case 'destination':
        return <CheckCircle className="h-4 w-4 text-rose-400" />;
      default:
        return <ArrowUp className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-xl backdrop-blur-md">
      {/* Route Header & Metrics Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
            Dijkstra Shortest Path Result
          </span>
          <h3 className="text-sm sm:text-base font-bold text-white">
            {startNode?.name} → {destNode?.name}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Voice Guidance Button */}
          <button
            onClick={handleToggleVoice}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
              isSpeaking
                ? 'border-indigo-500 bg-indigo-600 text-white'
                : 'border-slate-700 bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Read directions out loud"
          >
            {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            <span>{isSpeaking ? 'Mute Voice' : 'Listen'}</span>
          </button>

          {/* Inspect Algorithm Button */}
          <button
            onClick={onOpenDataStructures}
            className="rounded-lg bg-indigo-950/80 border border-indigo-700/50 px-2.5 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-900/80 transition-colors"
          >
            Inspect Min-Heap & Trace
          </button>
        </div>
      </div>

      {/* Quantitative Metric Cards */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {/* Total Distance */}
        <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-2.5">
          <div className="text-[11px] text-slate-400">Total Distance</div>
          <div className="mt-1 text-base sm:text-lg font-bold text-white tabular-nums">
            {routeResult.totalDistanceMeters}m
          </div>
          <div className="text-[10px] text-slate-500">
            {(routeResult.totalDistanceMeters / 1000).toFixed(2)} km
          </div>
        </div>

        {/* Walking Time */}
        <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-2.5">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Clock className="h-3 w-3 text-sky-400" />
            <span>Walk Time</span>
          </div>
          <div className="mt-1 text-base sm:text-lg font-bold text-white tabular-nums">
            ~{routeResult.walkingTimeMinutes} min
          </div>
          <div className="text-[10px] text-slate-500">@ 4.5 km/h pace</div>
        </div>

        {/* Estimated Steps */}
        <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-2.5">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Footprints className="h-3 w-3 text-emerald-400" />
            <span>Steps</span>
          </div>
          <div className="mt-1 text-base sm:text-lg font-bold text-white tabular-nums">
            ~{routeResult.estimatedSteps}
          </div>
          <div className="text-[10px] text-slate-500">0.75m avg stride</div>
        </div>

        {/* Calories Burned */}
        <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-2.5">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Flame className="h-3 w-3 text-amber-400" />
            <span>Calories</span>
          </div>
          <div className="mt-1 text-base sm:text-lg font-bold text-white tabular-nums">
            ~{routeResult.caloriesBurned} kcal
          </div>
          <div className="text-[10px] text-slate-500">Light cardio</div>
        </div>
      </div>

      {/* Turn-by-Turn Navigation Instructions */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span>Step-by-Step Directions ({routeResult.steps.length} Steps)</span>
          <span className="text-slate-500 font-mono text-[11px]">
            {routeResult.pathNodeIds.length} Nodes Visited
          </span>
        </div>

        <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
          {routeResult.steps.map((step, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 rounded-lg border border-slate-800/60 bg-slate-950/50 p-2.5 transition-colors hover:bg-slate-900"
            >
              <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-md bg-slate-800 text-slate-300 shrink-0">
                {getDirectionIcon(step.direction)}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-xs font-medium text-slate-200 leading-snug">
                  {step.instruction}
                </span>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  {step.distanceMeters > 0 && <span>{step.distanceMeters}m</span>}
                  {step.landmark && <span>· {step.landmark}</span>}
                  <span className="capitalize text-slate-500">· {step.pathType.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
