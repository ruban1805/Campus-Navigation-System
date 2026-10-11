/**
 * Smart Campus Navigation System - Data Types and Interfaces
 */

export type LocationCategory =
  | 'entrance'
  | 'administrative'
  | 'academic'
  | 'laboratory'
  | 'library'
  | 'canteen'
  | 'student_center'
  | 'sports'
  | 'hostel'
  | 'parking'
  | 'health';

export interface FloorGuide {
  floor: string;
  highlights: string;
}

export interface LocationNode {
  id: string;
  name: string;
  code: string;
  category: LocationCategory;
  x: number; // Campus map coordinate X (0 - 1000)
  y: number; // Campus map coordinate Y (0 - 700)
  width?: number; // Visual footprint width
  height?: number; // Visual footprint height
  colorGroup?: 'academic' | 'residence' | 'parking' | 'admin' | 'sports';
  customBadgeColor?: string;
  floorCount: number;
  buildingNumber: string;
  description: string;
  amenities: string[];
  openingHours: string;
  departments?: string[];
  capacity?: string;
  contactExt?: string;
  floorDirectory?: FloorGuide[];
}

export type PathType = 'walkway' | 'road' | 'indoor_corridor' | 'garden_path';

export interface CampusEdge {
  id: string;
  fromId: string;
  toId: string;
  distance: number; // in meters
  pathType: PathType;
  isAccessible: boolean; // Wheelchair accessible
  isBlocked?: boolean; // Road work / maintenance obstacle
}

export type TurnDirection =
  | 'start'
  | 'straight'
  | 'slight_left'
  | 'left'
  | 'sharp_left'
  | 'slight_right'
  | 'right'
  | 'sharp_right'
  | 'destination';

export interface NavigationStep {
  stepNumber: number;
  direction: TurnDirection;
  instruction: string;
  distanceMeters: number;
  fromLocationName: string;
  toLocationName: string;
  landmark?: string;
  pathType: PathType;
}

export interface AlgorithmTraceStep {
  stepIndex: number;
  action: 'extract_min' | 'examine_neighbor' | 'relax_edge' | 'skip_visited' | 'finish';
  currentNodeId: string;
  currentNodeName: string;
  currentDistance: number;
  neighborNodeId?: string;
  neighborNodeName?: string;
  edgeWeight?: number;
  calculatedDistance?: number;
  previousDistance?: number;
  didRelax?: boolean;
  distancesSnapshot: Record<string, number>;
  visitedSnapshot: string[];
  heapSnapshot: { nodeId: string; distance: number }[];
  description: string;
}

export interface ShortestPathResult {
  found: boolean;
  pathNodeIds: string[];
  totalDistanceMeters: number;
  walkingTimeMinutes: number;
  estimatedSteps: number;
  caloriesBurned: number;
  steps: NavigationStep[];
  trace: AlgorithmTraceStep[];
  errorMessage?: string;
}

export interface CampusPreset {
  id: string;
  name: string;
  tagline: string;
  nodes: LocationNode[];
  edges: CampusEdge[];
}
