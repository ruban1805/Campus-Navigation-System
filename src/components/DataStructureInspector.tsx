/**
 * DataStructureInspector Component
 * An interactive educational lab demonstrating:
 * 1. Dijkstra Step-by-Step Execution Tracer
 * 2. Graph Adjacency List & Matrix
 * 3. Hash Table Buckets & Polynomial Hash Function
 * 4. Priority Queue (Binary Min-Heap)
 * 5. Data Structure Roles & Time Complexity Guide
 */

import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Binary,
  GitBranch,
  Hash,
  Layers,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Table,
} from 'lucide-react';
import { CampusGraph } from '../models/Graph';
import { LocationHashTable } from '../models/HashTable';
import { AlgorithmTraceStep, LocationNode, ShortestPathResult } from '../types/campus';

interface DataStructureInspectorProps {
  graph: CampusGraph;
  hashTable: LocationHashTable;
  routeResult: ShortestPathResult | null;
  nodes: LocationNode[];
  onSelectNode: (nodeId: string) => void;
}

export const DataStructureInspector: React.FC<DataStructureInspectorProps> = ({
  graph,
  hashTable,
  routeResult,
  nodes,
  onSelectNode,
}) => {
  const [activeTab, setActiveTab] = useState<'dijkstra' | 'graph' | 'hashtable' | 'minheap' | 'theory'>('dijkstra');

  // Dijkstra Step-by-step playback state
  const trace = routeResult?.trace || [];
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Hash Table Key Tester state
  const [testKey, setTestKey] = useState('LIB-200');
  const [matrixView, setMatrixView] = useState(false);

  // Reset step index when a new route is calculated
  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [routeResult]);

  // Automated playback timer
  useEffect(() => {
    if (!isPlaying || trace.length === 0) return;

    const interval = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev >= trace.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isPlaying, trace.length]);

  const currentTraceStep: AlgorithmTraceStep | undefined = trace[currentStepIndex];

  // Adjacency Matrix Data
  const adjacencyMatrixData = React.useMemo(() => {
    return graph.getAdjacencyMatrix();
  }, [graph]);

  // Hash Table stats
  const hashInspection = hashTable.getInspectionData();
  const testHashVal = hashTable.hash(testKey);
  const testFound = hashTable.get(testKey);

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-slate-800 bg-slate-900/95 p-4 sm:p-6 shadow-2xl backdrop-blur-md">
      {/* Tab Navigation Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('dijkstra')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'dijkstra'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Binary className="h-3.5 w-3.5" />
            <span>Dijkstra Execution Tracer</span>
          </button>
          <button
            onClick={() => setActiveTab('graph')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'graph'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitBranch className="h-3.5 w-3.5" />
            <span>Graph (Adjacency List)</span>
          </button>
          <button
            onClick={() => setActiveTab('hashtable')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'hashtable'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Hash className="h-3.5 w-3.5" />
            <span>Hash Table (O(1) Search)</span>
          </button>
          <button
            onClick={() => setActiveTab('minheap')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'minheap'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Priority Queue (Min-Heap)</span>
          </button>
          <button
            onClick={() => setActiveTab('theory')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'theory'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Theory & Complexities</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          Big-O: O((V + E) log V)
        </div>
      </div>

      {/* TAB 1: DIJKSTRA STEP-BY-STEP TRACER */}
      {activeTab === 'dijkstra' && (
        <div className="flex flex-col gap-4">
          {trace.length === 0 ? (
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-8 text-center text-slate-400 text-xs">
              Calculate a route on the Campus Map to inspect the step-by-step Dijkstra execution trace.
            </div>
          ) : (
            <>
              {/* Stepper Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentStepIndex(0)}
                    disabled={currentStepIndex === 0}
                    className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-30"
                    title="First Step"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentStepIndex === 0}
                    className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-30"
                    title="Previous Step"
                  >
                    <SkipBack className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex items-center gap-1.5 rounded bg-indigo-600 px-3 py-1 text-xs font-bold text-white hover:bg-indigo-500"
                  >
                    {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    <span>{isPlaying ? 'Pause' : 'Play Trace'}</span>
                  </button>
                  <button
                    onClick={() => setCurrentStepIndex(prev => Math.min(trace.length - 1, prev + 1))}
                    disabled={currentStepIndex >= trace.length - 1}
                    className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-30"
                    title="Next Step"
                  >
                    <SkipForward className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="font-semibold text-white">
                    Step {currentStepIndex + 1} of {trace.length}
                  </span>
                  <div className="h-2 w-32 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 transition-all"
                      style={{ width: `${((currentStepIndex + 1) / trace.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Current Step Explanation Box */}
              {currentTraceStep && (
                <div className="rounded-lg border border-indigo-900/60 bg-indigo-950/20 p-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-indigo-900/60 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-indigo-300">
                      {currentTraceStep.action.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-semibold text-white">
                      Current Node: {currentTraceStep.currentNodeName} (dist: {currentTraceStep.currentDistance}m)
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-indigo-200/90 leading-relaxed font-sans">
                    {currentTraceStep.description}
                  </p>
                  {currentTraceStep.neighborNodeName && (
                    <div className="mt-2 flex items-center gap-2 text-[11px] font-mono text-indigo-300">
                      <span>Edge ({currentTraceStep.edgeWeight}m)</span>
                      <ArrowRight className="h-3 w-3" />
                      <span>
                        Target: {currentTraceStep.neighborNodeName} | New Dist: {currentTraceStep.calculatedDistance}m
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Tentative Distance Table dist[v] */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Tentative Distances Table: dist[v]</span>
                  <span className="text-slate-500">
                    Visited Set |S| = {currentTraceStep?.visitedSnapshot.length || 0}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {nodes.map(n => {
                    const dist = currentTraceStep?.distancesSnapshot[n.id] ?? Infinity;
                    const isVisited = currentTraceStep?.visitedSnapshot.includes(n.id);
                    const isCurrent = currentTraceStep?.currentNodeId === n.id;
                    const isNeighbor = currentTraceStep?.neighborNodeId === n.id;

                    return (
                      <div
                        key={n.id}
                        className={`rounded-lg border p-2.5 transition-colors ${
                          isCurrent
                            ? 'border-indigo-500 bg-indigo-950/60'
                            : isNeighbor
                            ? 'border-sky-500 bg-sky-950/40'
                            : isVisited
                            ? 'border-slate-800 bg-slate-950/40 opacity-70'
                            : 'border-slate-800/80 bg-slate-950'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-medium text-slate-300 truncate">{n.code}</span>
                          {isVisited && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                        </div>
                        <div className="mt-1 text-xs font-mono font-bold text-white">
                          {dist === Infinity ? '∞' : `${dist}m`}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">{n.name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Priority Queue (Min-Heap) Current State */}
              <div className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                <span className="text-xs font-semibold text-slate-300">
                  Min-Heap Priority Queue Contents ({currentTraceStep?.heapSnapshot.length || 0} Elements)
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentTraceStep?.heapSnapshot && currentTraceStep.heapSnapshot.length > 0 ? (
                    currentTraceStep.heapSnapshot.map((item, idx) => {
                      const node = graph.getNode(item.nodeId);
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-xs"
                        >
                          <span className="font-mono text-indigo-400 font-bold">#{idx}</span>
                          <span className="text-slate-200">{node?.code || item.nodeId}</span>
                          <span className="font-mono text-emerald-400 font-semibold">({item.distance}m)</span>
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-xs text-slate-500">Heap is currently empty.</span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: GRAPH (ADJACENCY LIST & MATRIX) */}
      {activeTab === 'graph' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Graph G = (V, E): |V| = {graph.getNodeCount()} locations, |E| = {graph.getEdgeCount()} pathways.
            </span>
            <button
              onClick={() => setMatrixView(!matrixView)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 hover:text-white"
            >
              <Table className="h-3.5 w-3.5" />
              <span>{matrixView ? 'Show Adjacency List' : 'Show Adjacency Matrix'}</span>
            </button>
          </div>

          {!matrixView ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {nodes.map(node => {
                const neighbors = graph.getNeighbors(node.id);
                return (
                  <div
                    key={node.id}
                    className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-950 p-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-400">{node.code}</span>
                        <span className="text-xs font-semibold text-white">{node.name}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        deg(v) = {neighbors.length}
                      </span>
                    </div>

                    {/* Neighbor Edges */}
                    <div className="flex flex-col gap-1">
                      {neighbors.map(edge => {
                        const targetNode = graph.getNode(edge.toId);
                        return (
                          <div
                            key={edge.id}
                            className="flex items-center justify-between rounded bg-slate-900/80 px-2 py-1 text-xs"
                          >
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <ArrowRight className="h-3 w-3 text-slate-500" />
                              <span>{targetNode?.name || edge.toId}</span>
                            </div>
                            <div className="flex items-center gap-2 font-mono text-[11px]">
                              <span className="text-emerald-400">{edge.distance}m</span>
                              <span className="text-slate-500">({edge.pathType})</span>
                              {edge.isBlocked && <span className="text-rose-400 font-bold">BLOCKED</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 p-2">
              <table className="w-full text-center text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="p-2 text-left">Node</th>
                    {adjacencyMatrixData.labels.map(l => (
                      <th key={l.id} className="p-2">{l.code}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {adjacencyMatrixData.matrix.map((row, i) => (
                    <tr key={i} className="border-b border-slate-900 hover:bg-slate-900/50">
                      <td className="p-2 text-left font-bold text-indigo-400">
                        {adjacencyMatrixData.labels[i].code}
                      </td>
                      {row.map((val, j) => (
                        <td
                          key={j}
                          className={`p-2 ${
                            val === 0
                              ? 'text-slate-600'
                              : val !== null
                              ? 'text-emerald-400 font-bold bg-emerald-950/20'
                              : 'text-slate-700'
                          }`}
                        >
                          {val !== null ? `${val}` : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: HASH TABLE INSPECTOR */}
      {activeTab === 'hashtable' && (
        <div className="flex flex-col gap-4">
          {/* Key Tester Box */}
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
            <span className="text-xs font-semibold text-white">Interactive O(1) Key Hash Tester</span>
            <div className="mt-2 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={testKey}
                onChange={e => setTestKey(e.target.value)}
                placeholder="Enter building name or code (e.g. LIB-200)..."
                className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
              <div className="rounded bg-slate-900 p-2 border border-slate-800">
                <span className="text-slate-500">Polynomial Hash:</span>
                <div className="text-indigo-400 font-bold mt-0.5">Bucket Index #{testHashVal}</div>
              </div>
              <div className="rounded bg-slate-900 p-2 border border-slate-800">
                <span className="text-slate-500">Lookup Result:</span>
                <div className="text-emerald-400 font-bold mt-0.5">
                  {testFound ? testFound.name : 'Key Not Found'}
                </div>
              </div>
              <div className="rounded bg-slate-900 p-2 border border-slate-800">
                <span className="text-slate-500">Load Factor (N/M):</span>
                <div className="text-slate-300 font-bold mt-0.5">
                  {hashTable.getLoadFactor()} ({hashTable.getSize()}/{hashTable.getCapacity()})
                </div>
              </div>
            </div>
          </div>

          {/* Bucket Array Visualization */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Internal Bucket Array (Separate Chaining with Capacity = {hashTable.getCapacity()})</span>
              <span className="text-slate-500">Collisions: {hashTable.getCollisionCount()}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-1">
              {hashInspection.map(bucket => {
                const isTargetBucket = bucket.bucketIndex === testHashVal;
                return (
                  <div
                    key={bucket.bucketIndex}
                    className={`rounded-lg border p-2.5 transition-colors ${
                      isTargetBucket
                        ? 'border-indigo-500 bg-indigo-950/60'
                        : 'border-slate-800 bg-slate-950'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-slate-400">Bucket [{bucket.bucketIndex}]</span>
                      <span className="text-[10px] text-slate-500">{bucket.count} items</span>
                    </div>

                    <div className="mt-1 flex flex-col gap-1">
                      {bucket.entries.length === 0 ? (
                        <span className="text-[11px] text-slate-600 italic">Empty bucket</span>
                      ) : (
                        bucket.entries.map((entry, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded bg-slate-900 px-2 py-0.5 text-[11px]"
                          >
                            <span className="text-indigo-300 font-medium truncate max-w-[140px]">
                              {entry.key}
                            </span>
                            <span className="text-slate-400 text-[10px]">{entry.value.code}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PRIORITY QUEUE (MIN-HEAP) */}
      {activeTab === 'minheap' && (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs text-slate-300 leading-relaxed">
            <h4 className="font-bold text-white text-sm mb-1">Binary Min-Heap Mechanics</h4>
            <p>
              In Dijkstra&apos;s algorithm, a Binary Min-Heap maintains the collection of unvisited vertices ordered
              by their tentative distance from the source. The node with the minimum distance is always positioned at the root.
            </p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-500">Parent Index:</span>
                <div className="text-sky-400 font-bold">floor((i - 1) / 2)</div>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-500">Left Child:</span>
                <div className="text-emerald-400 font-bold">2 * i + 1</div>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-500">Right Child:</span>
                <div className="text-amber-400 font-bold">2 * i + 2</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
            <h5 className="font-semibold text-white text-xs mb-2">Complexity Comparison</h5>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="p-2">Implementation</th>
                    <th className="p-2">Extract-Min</th>
                    <th className="p-2">Insert / Decrease-Key</th>
                    <th className="p-2">Total Dijkstra Time</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-slate-900">
                    <td className="p-2 text-rose-400">Unordered Array</td>
                    <td className="p-2">O(V)</td>
                    <td className="p-2">O(1)</td>
                    <td className="p-2">O(V² + E)</td>
                  </tr>
                  <tr className="border-b border-slate-900 bg-emerald-950/20">
                    <td className="p-2 font-bold text-emerald-400">Binary Min-Heap (Our App)</td>
                    <td className="p-2 font-bold text-emerald-400">O(log V)</td>
                    <td className="p-2 font-bold text-emerald-400">O(log V)</td>
                    <td className="p-2 font-bold text-emerald-400">O((V + E) log V)</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-purple-400">Fibonacci Heap</td>
                    <td className="p-2">O(log V) amortized</td>
                    <td className="p-2">O(1) amortized</td>
                    <td className="p-2">O(E + V log V)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: THEORY & COMPLEXITIES */}
      {activeTab === 'theory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-950 p-4">
            <h4 className="text-sm font-bold text-indigo-400">1. Graph Data Structure</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Models the physical college campus. Vertices represents buildings, facilities, gates, and intersections.
              Edges represent paths, roads, and walkways with weights representing Euclidean or measured distance in meters.
            </p>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              Space Complexity: O(V + E) using Adjacency List.
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-950 p-4">
            <h4 className="text-sm font-bold text-emerald-400">2. Dijkstra&apos;s Algorithm</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Greedy shortest path algorithm that guarantees finding the optimal path between source and destination
              with non-negative edge weights. Dynamically relaxes edges:
              <code className="block bg-slate-900 p-1.5 rounded mt-1 font-mono text-emerald-300">
                if (dist[u] + w(u, v) &lt; dist[v]) &#123; dist[v] = dist[u] + w(u, v); &#125;
              </code>
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-950 p-4">
            <h4 className="text-sm font-bold text-sky-400">3. Hash Table</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Provides constant-time O(1) average lookup for building codes, names, and facilities.
              Uses a polynomial rolling hash function with separate chaining to gracefully resolve collisions.
            </p>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              Average Time: O(1) | Worst Time: O(N) | Space: O(N)
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-950 p-4">
            <h4 className="text-sm font-bold text-amber-400">4. Priority Queue (Min-Heap)</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Enables Dijkstra&apos;s algorithm to extract the next unvisited vertex with minimum tentative distance
              in O(log V) time rather than scanning all vertices in O(V) time.
            </p>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              Enqueue: O(log N) | Dequeue: O(log N) | Peek: O(1)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
