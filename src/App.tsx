/**
 * Smart Campus Navigation System
 * Main Application Component integrating Campus Graph, Hash Table,
 * Binary Min-Heap Priority Queue, Dijkstra's Algorithm, and interactive views.
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Header, ActiveTab } from './components/Header';
import { CampusMap } from './components/CampusMap';
import { NavigationControls } from './components/NavigationControls';
import { RouteSummary } from './components/RouteSummary';
import { DataStructureInspector } from './components/DataStructureInspector';
import { FacilityDirectory } from './components/FacilityDirectory';
import { JavaCodeViewer } from './components/JavaCodeViewer';
import { VSCodeGuide } from './components/VSCodeGuide';
import { LocationManagerModal } from './components/LocationManagerModal';
import { NodeDetailDrawer } from './components/NodeDetailDrawer';

import { CampusEdge, LocationNode, ShortestPathResult } from './types/campus';
import { CampusGraph } from './models/Graph';
import { LocationHashTable } from './models/HashTable';
import { DijkstraAlgorithm } from './models/Dijkstra';
import { CAMPUS_PRESETS } from './data/defaultCampusData';

export default function App() {
  const initialPreset = CAMPUS_PRESETS[0];

  // Core Campus State
  const [nodes, setNodes] = useState<LocationNode[]>(initialPreset.nodes);
  const [edges, setEdges] = useState<CampusEdge[]>(initialPreset.edges);

  // Active Navigation Points
  const [startNodeId, setStartNodeId] = useState<string>('loc_ksr_main_gate');
  const [destNodeId, setDestNodeId] = useState<string>('loc_ksrce');
  const [requireAccessible, setRequireAccessible] = useState<boolean>(false);

  // Navigation & View State
  const [activeTab, setActiveTab] = useState<ActiveTab>('map');
  const [routeResult, setRouteResult] = useState<ShortestPathResult | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState<boolean>(false);
  const [selectedDetailNode, setSelectedDetailNode] = useState<LocationNode | null>(null);

  // Initialize and maintain Graph and Hash Table instances
  const graph = useMemo(() => {
    return new CampusGraph(nodes, edges);
  }, [nodes, edges]);

  const hashTable = useMemo(() => {
    const table = new LocationHashTable(31);
    for (const node of nodes) {
      table.put(node.name, node);
      table.put(node.code, node);
      table.put(node.id, node);
    }
    return table;
  }, [nodes]);

  // Compute Shortest Path via Dijkstra's Algorithm
  const computeRoute = useCallback(() => {
    if (!startNodeId || !destNodeId) return;

    const result = DijkstraAlgorithm.findShortestPath(graph, startNodeId, destNodeId, {
      requireAccessible,
      ignoreBlocked: true,
    });

    setRouteResult(result);
  }, [graph, startNodeId, destNodeId, requireAccessible]);

  // Automatically calculate route initially or when endpoints change
  useEffect(() => {
    computeRoute();
  }, [computeRoute]);

  // Handlers for Origin & Destination selection
  const handleSelectStart = (id: string) => {
    setStartNodeId(id);
  };

  const handleSelectDest = (id: string) => {
    setDestNodeId(id);
  };

  const handleSwapPoints = () => {
    setStartNodeId(destNodeId);
    setDestNodeId(startNodeId);
  };

  const handleToggleAccessible = () => {
    setRequireAccessible(prev => !prev);
  };

  const handleResetRoute = () => {
    setStartNodeId(nodes[0]?.id || '');
    setDestNodeId(nodes[1]?.id || '');
    setRequireAccessible(false);
  };

  // Toggle Roadblock on an Edge
  const handleToggleEdgeBlocked = (fromId: string, toId: string) => {
    setEdges(prevEdges =>
      prevEdges.map(edge => {
        if (
          (edge.fromId === fromId && edge.toId === toId) ||
          (edge.fromId === toId && edge.toId === fromId)
        ) {
          return { ...edge, isBlocked: !edge.isBlocked };
        }
        return edge;
      })
    );
  };

  // Graph Mutation Handlers
  const handleAddNode = (
    newNode: LocationNode,
    connectToNodeId?: string,
    connectDistance?: number
  ) => {
    setNodes(prev => [...prev, newNode]);

    if (connectToNodeId && connectDistance) {
      const newEdge: CampusEdge = {
        id: `e_${Date.now()}`,
        fromId: newNode.id,
        toId: connectToNodeId,
        distance: connectDistance,
        pathType: 'walkway',
        isAccessible: true,
        isBlocked: false,
      };
      setEdges(prev => [...prev, newEdge]);
    }
  };

  const handleUpdateNode = (updatedNode: LocationNode) => {
    setNodes(prev => prev.map(n => (n.id === updatedNode.id ? updatedNode : n)));
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setEdges(prev => prev.filter(e => e.fromId !== nodeId && e.toId !== nodeId));

    if (startNodeId === nodeId) {
      const remaining = nodes.filter(n => n.id !== nodeId);
      if (remaining.length > 0) setStartNodeId(remaining[0].id);
    }
    if (destNodeId === nodeId) {
      const remaining = nodes.filter(n => n.id !== nodeId);
      if (remaining.length > 1) setDestNodeId(remaining[1].id);
    }
  };

  const handleAddEdge = (newEdge: CampusEdge) => {
    setEdges(prev => [...prev, newEdge]);
  };

  const handleUpdateEdgeDistance = (fromId: string, toId: string, newDist: number) => {
    setEdges(prev =>
      prev.map(e => {
        if (
          (e.fromId === fromId && e.toId === toId) ||
          (e.fromId === toId && e.toId === fromId)
        ) {
          return { ...e, distance: newDist };
        }
        return e;
      })
    );
  };

  const handleDeleteEdge = (fromId: string, toId: string) => {
    setEdges(prev =>
      prev.filter(
        e =>
          !(
            (e.fromId === fromId && e.toId === toId) ||
            (e.fromId === toId && e.toId === fromId)
          )
      )
    );
  };

  const handleResetToDefaults = () => {
    setNodes(initialPreset.nodes);
    setEdges(initialPreset.edges);
    setStartNodeId('loc_ksr_main_gate');
    setDestNodeId('loc_ksrce');
    setRequireAccessible(false);
  };

  const startNode = nodes.find(n => n.id === startNodeId);
  const destNode = nodes.find(n => n.id === destNodeId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600/30 selection:text-indigo-200">
      {/* 3-Zone Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddModal={() => setIsManageModalOpen(true)}
      />

      {/* Main Workspace Stage */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* VIEW 1: CAMPUS MAP & NAVIGATION ROUTE */}
        {activeTab === 'map' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left 7 Columns: Interactive SVG Campus Map */}
            <div className="lg:col-span-7 flex flex-col gap-4 relative">
              <CampusMap
                nodes={nodes}
                edges={edges}
                startNodeId={startNodeId}
                destNodeId={destNodeId}
                routeResult={routeResult}
                onSelectStart={handleSelectStart}
                onSelectDest={handleSelectDest}
                onToggleEdgeBlocked={handleToggleEdgeBlocked}
                onOpenNodeDetails={node => setSelectedDetailNode(node)}
              />

              {/* Node Details Popup Card */}
              {selectedDetailNode && (
                <NodeDetailDrawer
                  node={selectedDetailNode}
                  onClose={() => setSelectedDetailNode(null)}
                  onSetAsStart={handleSelectStart}
                  onSetAsDest={handleSelectDest}
                  degree={graph.getNodeDegree(selectedDetailNode.id)}
                />
              )}
            </div>

            {/* Right 5 Columns: Navigation Deck & Route Directions */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <NavigationControls
                nodes={nodes}
                hashTable={hashTable}
                startNodeId={startNodeId}
                destNodeId={destNodeId}
                requireAccessible={requireAccessible}
                onSelectStart={handleSelectStart}
                onSelectDest={handleSelectDest}
                onSwapPoints={handleSwapPoints}
                onToggleAccessible={handleToggleAccessible}
                onResetRoute={handleResetRoute}
                onCalculateRoute={computeRoute}
              />

              <RouteSummary
                routeResult={routeResult}
                startNode={startNode}
                destNode={destNode}
                onClearRoute={handleResetRoute}
                onOpenDataStructures={() => setActiveTab('datastructures')}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: FACILITY DIRECTORY */}
        {activeTab === 'facilities' && (
          <FacilityDirectory
            nodes={nodes}
            onSelectStart={id => {
              handleSelectStart(id);
              setActiveTab('map');
            }}
            onSelectDest={id => {
              handleSelectDest(id);
              setActiveTab('map');
            }}
            onViewOnMap={id => {
              const node = nodes.find(n => n.id === id);
              if (node) setSelectedDetailNode(node);
              setActiveTab('map');
            }}
          />
        )}

        {/* VIEW 3: DATA STRUCTURES & DIJKSTRA INSPECTOR */}
        {activeTab === 'datastructures' && (
          <DataStructureInspector
            graph={graph}
            hashTable={hashTable}
            routeResult={routeResult}
            nodes={nodes}
            onSelectNode={id => {
              handleSelectStart(id);
              setActiveTab('map');
            }}
          />
        )}

        {/* VIEW 4: JAVA CODEBASE BROWSER & SIMULATED RUNNER */}
        {activeTab === 'javacode' && <JavaCodeViewer />}

        {/* VIEW 5: VS CODE SETUP GUIDE */}
        {activeTab === 'vscode' && <VSCodeGuide />}
      </main>

      {/* Campus Location & Pathway Manager Modal */}
      <LocationManagerModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        nodes={nodes}
        edges={edges}
        onAddNode={handleAddNode}
        onUpdateNode={handleUpdateNode}
        onDeleteNode={handleDeleteNode}
        onAddEdge={handleAddEdge}
        onUpdateEdgeDistance={handleUpdateEdgeDistance}
        onDeleteEdge={handleDeleteEdge}
        onResetToDefaults={handleResetToDefaults}
      />

      {/* Clean Unboxed Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>KSREI Campus Navigation System · K.S. Rangasamy Educational Institutions, Kalvi Nagar</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Java 17+ Standard</span>
            <span>·</span>
            <span>O((V + E) log V) Dijkstra</span>
            <span>·</span>
            <span>O(1) Hash Table Search</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
