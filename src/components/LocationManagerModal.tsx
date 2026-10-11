/**
 * LocationManagerModal Component
 * Allows adding, editing, and deleting campus locations,
 * connecting new pathways, modifying edge distances, and resetting campus data.
 */

import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  Network,
  MapPin,
  Building,
  Check,
  AlertCircle,
} from 'lucide-react';
import { CampusEdge, LocationCategory, LocationNode, PathType } from '../types/campus';
import { CATEGORY_INFO } from '../data/defaultCampusData';

interface LocationManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: LocationNode[];
  edges: CampusEdge[];
  onAddNode: (node: LocationNode, connectToNodeId?: string, distance?: number) => void;
  onUpdateNode: (node: LocationNode) => void;
  onDeleteNode: (nodeId: string) => void;
  onAddEdge: (edge: CampusEdge) => void;
  onUpdateEdgeDistance: (fromId: string, toId: string, newDist: number) => void;
  onDeleteEdge: (fromId: string, toId: string) => void;
  onResetToDefaults: () => void;
}

export const LocationManagerModal: React.FC<LocationManagerModalProps> = ({
  isOpen,
  onClose,
  nodes,
  edges,
  onAddNode,
  onUpdateNode,
  onDeleteNode,
  onAddEdge,
  onUpdateEdgeDistance,
  onDeleteEdge,
  onResetToDefaults,
}) => {
  const [activeTab, setActiveTab] = useState<'nodes' | 'edges' | 'add'>('nodes');
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  // Form state for adding a new location
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newCategory, setNewCategory] = useState<LocationCategory>('academic');
  const [newX, setNewX] = useState(500);
  const [newY, setNewY] = useState(350);
  const [newBuildingNo, setNewBuildingNo] = useState('Block New');
  const [newFloors, setNewFloors] = useState(3);
  const [newDesc, setNewDesc] = useState('');
  const [newAmenities, setNewAmenities] = useState('WiFi, Restroom');
  const [newConnectTarget, setNewConnectTarget] = useState<string>('');
  const [newConnectDist, setNewConnectDist] = useState<number>(200);

  // Form state for adding an edge
  const [edgeFrom, setEdgeFrom] = useState(nodes[0]?.id || '');
  const [edgeTo, setEdgeTo] = useState(nodes[1]?.id || '');
  const [edgeDist, setEdgeDist] = useState(180);
  const [edgeType, setEdgeType] = useState<PathType>('walkway');
  const [edgeAccessible, setEdgeAccessible] = useState(true);

  // Feedback banner
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  if (!isOpen) return null;

  const showFeedback = (text: string, isError = false) => {
    setStatusMsg({ text, isError });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleCreateNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) {
      showFeedback('Please provide a valid location name and code.', true);
      return;
    }

    const newNodeId = `loc_${Date.now()}`;
    const created: LocationNode = {
      id: newNodeId,
      name: newName.trim(),
      code: newCode.trim().toUpperCase(),
      category: newCategory,
      x: Math.round(Number(newX)),
      y: Math.round(Number(newY)),
      buildingNumber: newBuildingNo.trim() || 'Block N',
      floorCount: Number(newFloors) || 1,
      description: newDesc.trim() || `Campus facility for ${newName.trim()}`,
      amenities: newAmenities
        .split(',')
        .map(a => a.trim())
        .filter(Boolean),
      openingHours: '08:00 AM - 08:00 PM',
    };

    onAddNode(
      created,
      newConnectTarget || undefined,
      newConnectTarget ? Number(newConnectDist) : undefined
    );

    showFeedback(`Successfully added "${created.name}" to campus graph!`);
    // Reset form
    setNewName('');
    setNewCode('');
    setNewDesc('');
    setActiveTab('nodes');
  };

  const handleCreateEdge = (e: React.FormEvent) => {
    e.preventDefault();
    if (edgeFrom === edgeTo) {
      showFeedback('Cannot connect a location to itself.', true);
      return;
    }

    const newEdge: CampusEdge = {
      id: `e_${Date.now()}`,
      fromId: edgeFrom,
      toId: edgeTo,
      distance: Number(edgeDist),
      pathType: edgeType,
      isAccessible: edgeAccessible,
      isBlocked: false,
    };

    onAddEdge(newEdge);
    showFeedback(`Pathway connected with distance ${edgeDist}m!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative flex flex-col w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Campus Graph & Location Manager</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status notification toast */}
        {statusMsg && (
          <div
            className={`px-6 py-2 text-xs font-semibold flex items-center gap-2 ${
              statusMsg.isError
                ? 'bg-rose-950/80 text-rose-300 border-b border-rose-800'
                : 'bg-emerald-950/80 text-emerald-300 border-b border-emerald-800'
            }`}
          >
            {statusMsg.isError ? <AlertCircle className="h-4 w-4" /> : <Check className="h-4 w-4" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Modal Sub-Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-2.5 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('nodes')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === 'nodes'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              All Locations ({nodes.length})
            </button>
            <button
              onClick={() => setActiveTab('edges')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === 'edges'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Connecting Pathways ({edges.length})
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === 'add'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add New Location</span>
            </button>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Reset all nodes, edges, and distances back to sample campus default?')) {
                onResetToDefaults();
                showFeedback('Campus map reset to default sample data.');
              }
            }}
            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {/* TAB: VIEW & EDIT NODES */}
          {activeTab === 'nodes' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 mb-2">
                Manage campus nodes. Deleting a node will automatically remove all connecting paths.
              </div>
              {nodes.map(node => (
                <div
                  key={node.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3.5"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-400">{node.code}</span>
                      <span className="text-xs font-bold text-white">{node.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      {node.category} · {node.buildingNumber} · ({node.x}, {node.y})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        const newName = window.prompt('Update Location Name:', node.name);
                        if (newName && newName.trim()) {
                          onUpdateNode({ ...node, name: newName.trim() });
                          showFeedback(`Updated ${node.code} name.`);
                        }
                      }}
                      className="rounded bg-slate-800 p-1.5 text-slate-300 hover:text-white hover:bg-slate-700"
                      title="Edit Name"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (nodes.length <= 2) {
                          showFeedback('Cannot delete: Campus must have at least 2 locations.', true);
                          return;
                        }
                        if (window.confirm(`Delete "${node.name}" (${node.code}) and its connecting paths?`)) {
                          onDeleteNode(node.id);
                          showFeedback(`Removed ${node.name}.`);
                        }
                      }}
                      className="rounded bg-rose-950/80 p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-900 border border-rose-800/50"
                      title="Delete Location"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: MANAGE PATHWAYS & EDGES */}
          {activeTab === 'edges' && (
            <div className="space-y-4">
              {/* Form to connect two existing nodes */}
              <form
                onSubmit={handleCreateEdge}
                className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3"
              >
                <div className="text-xs font-bold text-white">Connect Two Locations with New Pathway</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">From Node</label>
                    <select
                      value={edgeFrom}
                      onChange={e => setEdgeFrom(e.target.value)}
                      className="w-full rounded border border-slate-700 bg-slate-900 p-1.5 text-xs text-white"
                    >
                      {nodes.map(n => (
                        <option key={n.id} value={n.id}>
                          {n.name} ({n.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">To Node</label>
                    <select
                      value={edgeTo}
                      onChange={e => setEdgeTo(e.target.value)}
                      className="w-full rounded border border-slate-700 bg-slate-900 p-1.5 text-xs text-white"
                    >
                      {nodes.map(n => (
                        <option key={n.id} value={n.id}>
                          {n.name} ({n.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Distance (meters)</label>
                    <input
                      type="number"
                      min={10}
                      max={2000}
                      value={edgeDist}
                      onChange={e => setEdgeDist(Number(e.target.value))}
                      className="w-full rounded border border-slate-700 bg-slate-900 p-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-4 text-xs text-slate-300">
                    <label className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={edgeAccessible}
                        onChange={e => setEdgeAccessible(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-900"
                      />
                      <span>Wheelchair Accessible</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="rounded bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500"
                  >
                    Add Pathway Edge
                  </button>
                </div>
              </form>

              {/* List of existing edges with distance edit */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300">Existing Graph Edges</div>
                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {edges.map(edge => {
                    const u = nodes.find(n => n.id === edge.fromId);
                    const v = nodes.find(n => n.id === edge.toId);
                    if (!u || !v) return null;

                    return (
                      <div
                        key={edge.id}
                        className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">
                            {u.code} ↔ {v.code}
                          </span>
                          <span className="text-slate-500 font-mono">({edge.pathType})</span>
                          {edge.isBlocked && <span className="text-rose-400 font-bold">BLOCKED</span>}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const val = window.prompt(
                                `Update distance between ${u.name} and ${v.name} (meters):`,
                                String(edge.distance)
                              );
                              if (val && !isNaN(Number(val)) && Number(val) > 0) {
                                onUpdateEdgeDistance(edge.fromId, edge.toId, Number(val));
                                showFeedback(`Distance updated to ${val}m.`);
                              }
                            }}
                            className="rounded bg-slate-900 border border-slate-700 px-2 py-1 font-mono text-emerald-400 hover:bg-slate-800"
                          >
                            {edge.distance}m (Edit)
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`Delete path between ${u.name} and ${v.name}?`)) {
                                onDeleteEdge(edge.fromId, edge.toId);
                                showFeedback('Pathway deleted.');
                              }
                            }}
                            className="p-1 text-slate-500 hover:text-rose-400"
                            title="Remove Edge"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: ADD NEW LOCATION */}
          {activeTab === 'add' && (
            <form onSubmit={handleCreateNode} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Location Name *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g. Center for Quantum Computing"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Building Code *</label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={e => setNewCode(e.target.value)}
                    placeholder="e.g. QC-750"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as LocationCategory)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white"
                  >
                    {Object.keys(CATEGORY_INFO).map(cat => (
                      <option key={cat} value={cat}>
                        {CATEGORY_INFO[cat as LocationCategory].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Building / Block</label>
                  <input
                    type="text"
                    value={newBuildingNo}
                    onChange={e => setNewBuildingNo(e.target.value)}
                    placeholder="e.g. Block Q"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Floors</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={newFloors}
                    onChange={e => setNewFloors(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white"
                  />
                </div>
              </div>

              {/* Map Coordinates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    Map X Position ({newX} px)
                  </label>
                  <input
                    type="range"
                    min={80}
                    max={920}
                    value={newX}
                    onChange={e => setNewX(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    Map Y Position ({newY} px)
                  </label>
                  <input
                    type="range"
                    min={80}
                    max={650}
                    value={newY}
                    onChange={e => setNewY(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Facility brief and functions..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Amenities (comma-separated)
                </label>
                <input
                  type="text"
                  value={newAmenities}
                  onChange={e => setNewAmenities(e.target.value)}
                  placeholder="e.g. Fiber WiFi, Restroom, Elevator, Water Dispenser"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white"
                />
              </div>

              {/* Immediate Pathway Connection */}
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-2">
                <span className="font-semibold text-white block">
                  Connect Immediately to Existing Campus Node:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={newConnectTarget}
                    onChange={e => setNewConnectTarget(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-900 p-1.5 text-white"
                  >
                    <option value="">-- No Initial Pathway --</option>
                    {nodes.map(n => (
                      <option key={n.id} value={n.id}>
                        {n.name} ({n.code})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min={20}
                    max={1000}
                    value={newConnectDist}
                    onChange={e => setNewConnectDist(Number(e.target.value))}
                    placeholder="Distance (meters)"
                    className="w-full rounded border border-slate-700 bg-slate-900 p-1.5 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-indigo-500 transition-colors"
                >
                  Create Campus Location
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
