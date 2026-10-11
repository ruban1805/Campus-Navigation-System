/**
 * DijkstraAlgorithm: Single-Source Shortest Path using Min-Heap Priority Queue
 *
 * Mathematical Formulation:
 * For a weighted graph G = (V, E) with non-negative edge weights w(u, v) >= 0:
 * - Initializes tentative distances: dist[source] = 0, dist[v] = Infinity for all v != source
 * - Maintains a Priority Queue Q containing (vertex, dist[vertex])
 * - Repeatedly extracts the unvisited vertex u with minimum dist[u]
 * - Relaxes each incident edge (u, v):
 *     if dist[v] > dist[u] + w(u, v):
 *         dist[v] = dist[u] + w(u, v)
 *         prev[v] = u
 *         Q.insert(v, dist[v])
 *
 * Time Complexity: O((V + E) log V) with Binary Min-Heap
 * Space Complexity: O(V + E)
 */

import { CampusGraph } from './Graph';
import { MinPriorityQueue } from './PriorityQueue';
import {
  AlgorithmTraceStep,
  CampusEdge,
  LocationNode,
  NavigationStep,
  ShortestPathResult,
  TurnDirection,
} from '../types/campus';

export interface DijkstraOptions {
  requireAccessible?: boolean;
  ignoreBlocked?: boolean; // If true, skips blocked edges
}

export class DijkstraAlgorithm {
  /**
   * Computes the shortest path from startNodeId to endNodeId
   */
  public static findShortestPath(
    graph: CampusGraph,
    startNodeId: string,
    endNodeId: string,
    options: DijkstraOptions = { requireAccessible: false, ignoreBlocked: true }
  ): ShortestPathResult {
    const startNode = graph.getNode(startNodeId);
    const endNode = graph.getNode(endNodeId);

    if (!startNode || !endNode) {
      return {
        found: false,
        pathNodeIds: [],
        totalDistanceMeters: 0,
        walkingTimeMinutes: 0,
        estimatedSteps: 0,
        caloriesBurned: 0,
        steps: [],
        trace: [],
        errorMessage: 'Invalid start or destination location selected.',
      };
    }

    if (startNodeId === endNodeId) {
      return {
        found: true,
        pathNodeIds: [startNodeId],
        totalDistanceMeters: 0,
        walkingTimeMinutes: 0,
        estimatedSteps: 0,
        caloriesBurned: 0,
        steps: [
          {
            stepNumber: 1,
            direction: 'destination',
            instruction: `You are already at ${startNode.name}.`,
            distanceMeters: 0,
            fromLocationName: startNode.name,
            toLocationName: startNode.name,
            pathType: 'walkway',
          },
        ],
        trace: [],
      };
    }

    const allNodes = graph.getAllNodes();
    const distances: Map<string, number> = new Map();
    const previous: Map<string, string | null> = new Map();
    const previousEdge: Map<string, CampusEdge | null> = new Map();
    const visited: Set<string> = new Set();
    const pq = new MinPriorityQueue<string>();
    const trace: AlgorithmTraceStep[] = [];

    // 1. Initialize distances to infinity and start node to 0
    for (const node of allNodes) {
      distances.set(node.id, Infinity);
      previous.set(node.id, null);
      previousEdge.set(node.id, null);
    }
    distances.set(startNodeId, 0);

    // 2. Enqueue start node into Min-Heap
    pq.enqueue(startNodeId, 0);

    let stepCounter = 1;

    // Helper to capture state snapshot for algorithmic visualization
    const captureSnapshot = (
      action: AlgorithmTraceStep['action'],
      currId: string,
      desc: string,
      extra: Partial<AlgorithmTraceStep> = {}
    ) => {
      const distSnapshot: Record<string, number> = {};
      distances.forEach((val, k) => {
        distSnapshot[k] = val;
      });

      const heapItems = pq.toArray().map(item => ({
        nodeId: item.element,
        distance: item.priority,
      }));

      const currNode = graph.getNode(currId);
      trace.push({
        stepIndex: stepCounter++,
        action,
        currentNodeId: currId,
        currentNodeName: currNode?.name || currId,
        currentDistance: distances.get(currId) ?? Infinity,
        distancesSnapshot: distSnapshot,
        visitedSnapshot: Array.from(visited),
        heapSnapshot: heapItems,
        description: desc,
        ...extra,
      });
    };

    // 3. Main Dijkstra Loop
    while (!pq.isEmpty()) {
      const minItem = pq.dequeue();
      if (!minItem) break;

      const currentId = minItem.element;
      const currentDist = minItem.priority;

      // If this distance is greater than known distance, skip (stale heap entry)
      if (currentDist > (distances.get(currentId) ?? Infinity)) {
        continue;
      }

      // If already settled, skip
      if (visited.has(currentId)) {
        continue;
      }

      visited.add(currentId);

      const currentNode = graph.getNode(currentId)!;
      captureSnapshot(
        'extract_min',
        currentId,
        `Extracted '${currentNode.name}' from Min-Heap with tentative distance ${currentDist}m.`
      );

      // Early exit optimization: If destination is extracted from Min-Heap, shortest path is found!
      if (currentId === endNodeId) {
        break;
      }

      // 4. Examine and relax all outgoing edges
      const neighbors = graph.getNeighbors(currentId);

      for (const edge of neighbors) {
        const neighborId = edge.toId;
        const neighborNode = graph.getNode(neighborId);
        if (!neighborNode) continue;

        // Check accessibility constraint if requested
        if (options.requireAccessible && !edge.isAccessible) {
          continue;
        }

        // Check blocked edge (e.g. campus construction)
        if (options.ignoreBlocked && edge.isBlocked) {
          continue;
        }

        // If neighbor is already visited, shortest distance to it is already finalized
        if (visited.has(neighborId)) {
          captureSnapshot(
            'skip_visited',
            currentId,
            `Skipping visited neighbor '${neighborNode.name}' - its optimal path is already finalized.`,
            {
              neighborNodeId: neighborId,
              neighborNodeName: neighborNode.name,
              edgeWeight: edge.distance,
            }
          );
          continue;
        }

        const newDist = currentDist + edge.distance;
        const currentNeighborDist = distances.get(neighborId) ?? Infinity;

        captureSnapshot(
          'examine_neighbor',
          currentId,
          `Evaluating edge to '${neighborNode.name}' (${edge.distance}m): current best = ${
            currentNeighborDist === Infinity ? '∞' : currentNeighborDist + 'm'
          }, potential new distance = ${newDist}m.`,
          {
            neighborNodeId: neighborId,
            neighborNodeName: neighborNode.name,
            edgeWeight: edge.distance,
            calculatedDistance: newDist,
            previousDistance: currentNeighborDist,
          }
        );

        // Relaxation step: if a shorter path is found
        if (newDist < currentNeighborDist) {
          distances.set(neighborId, newDist);
          previous.set(neighborId, currentId);
          previousEdge.set(neighborId, edge);

          // Add updated tentative distance to Priority Queue
          pq.enqueue(neighborId, newDist);

          captureSnapshot(
            'relax_edge',
            currentId,
            `✓ Relaxed edge! Updated distance to '${neighborNode.name}' from ${
              currentNeighborDist === Infinity ? '∞' : currentNeighborDist + 'm'
            } to ${newDist}m and enqueued into Min-Heap.`,
            {
              neighborNodeId: neighborId,
              neighborNodeName: neighborNode.name,
              edgeWeight: edge.distance,
              calculatedDistance: newDist,
              previousDistance: currentNeighborDist,
              didRelax: true,
            }
          );
        }
      }
    }

    // 5. Reconstruct shortest path from destination back to start
    const destDistance = distances.get(endNodeId);
    if (!destDistance || destDistance === Infinity) {
      return {
        found: false,
        pathNodeIds: [],
        totalDistanceMeters: 0,
        walkingTimeMinutes: 0,
        estimatedSteps: 0,
        caloriesBurned: 0,
        steps: [],
        trace,
        errorMessage: options.requireAccessible
          ? `No wheelchair-accessible route found between ${startNode.name} and ${endNode.name}. Try toggling off accessibility mode or clearing roadblocks.`
          : `No connected pathway found between ${startNode.name} and ${endNode.name}. Some routes may be blocked or disconnected.`,
      };
    }

    const pathNodeIds: string[] = [];
    let curr: string | null = endNodeId;
    while (curr !== null) {
      pathNodeIds.unshift(curr);
      curr = previous.get(curr) || null;
    }

    // 6. Generate turn-by-turn navigation steps with directional cues
    const navigationSteps = this.generateNavigationSteps(graph, pathNodeIds, previousEdge);

    const totalDistance = destDistance;
    // Average walking speed: 4.8 km/h = 80 m/min -> 1.33 m/s
    const walkingTimeMinutes = Math.max(1, Math.round(totalDistance / 75));
    // Average stride: ~0.75m per step -> 1.33 steps per meter
    const estimatedSteps = Math.round(totalDistance * 1.33);
    // Average calorie burn: ~0.045 kcal per meter walked
    const caloriesBurned = Math.round(totalDistance * 0.045);

    captureSnapshot(
      'finish',
      endNodeId,
      `Shortest route to '${endNode.name}' successfully computed! Total distance: ${totalDistance}m across ${pathNodeIds.length} nodes.`
    );

    return {
      found: true,
      pathNodeIds,
      totalDistanceMeters: totalDistance,
      walkingTimeMinutes,
      estimatedSteps,
      caloriesBurned,
      steps: navigationSteps,
      trace,
    };
  }

  /**
   * Generates intuitive turn-by-turn directions by calculating the vector angles
   * between successive path segments on the campus map coordinates.
   */
  private static generateNavigationSteps(
    graph: CampusGraph,
    pathIds: string[],
    previousEdges: Map<string, CampusEdge | null>
  ): NavigationStep[] {
    const steps: NavigationStep[] = [];
    if (pathIds.length <= 1) return steps;

    for (let i = 0; i < pathIds.length - 1; i++) {
      const fromNode = graph.getNode(pathIds[i])!;
      const toNode = graph.getNode(pathIds[i + 1])!;
      const edge = previousEdges.get(toNode.id) || {
        distance: Math.round(
          Math.hypot(toNode.x - fromNode.x, toNode.y - fromNode.y) * 1.2
        ),
        pathType: 'walkway',
      };

      let direction: TurnDirection = 'straight';

      if (i === 0) {
        direction = 'start';
      } else {
        // Calculate turn angle from previous node (i-1) to current node (i) to next node (i+1)
        const prevNode = graph.getNode(pathIds[i - 1])!;
        const v1x = fromNode.x - prevNode.x;
        const v1y = fromNode.y - prevNode.y;
        const v2x = toNode.x - fromNode.x;
        const v2y = toNode.y - fromNode.y;

        // Angle in radians between vector 1 and vector 2
        const angle1 = Math.atan2(v1y, v1x);
        const angle2 = Math.atan2(v2y, v2x);
        let diff = angle2 - angle1;

        // Normalize to -PI .. +PI
        while (diff > Math.PI) diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;

        const degrees = (diff * 180) / Math.PI;

        if (degrees > 45 && degrees <= 125) {
          direction = 'right';
        } else if (degrees > 125) {
          direction = 'sharp_right';
        } else if (degrees > 15 && degrees <= 45) {
          direction = 'slight_right';
        } else if (degrees < -45 && degrees >= -125) {
          direction = 'left';
        } else if (degrees < -125) {
          direction = 'sharp_left';
        } else if (degrees < -15 && degrees >= -45) {
          direction = 'slight_left';
        } else {
          direction = 'straight';
        }
      }

      let instruction = '';
      const pathTypeDesc =
        edge.pathType === 'indoor_corridor'
          ? 'indoor corridor'
          : edge.pathType === 'garden_path'
          ? 'garden path'
          : edge.pathType === 'road'
          ? 'main campus road'
          : 'paved walkway';

      if (direction === 'start') {
        instruction = `Depart from ${fromNode.name} along the ${pathTypeDesc} toward ${toNode.name}.`;
      } else if (direction === 'straight') {
        instruction = `Continue straight along the ${pathTypeDesc} past ${fromNode.name} for ${edge.distance}m.`;
      } else if (direction === 'left') {
        instruction = `Turn left at ${fromNode.name} and proceed along the ${pathTypeDesc} toward ${toNode.name}.`;
      } else if (direction === 'slight_left') {
        instruction = `Bear slightly left near ${fromNode.name} toward ${toNode.name}.`;
      } else if (direction === 'sharp_left') {
        instruction = `Make a sharp left near ${fromNode.name} onto the ${pathTypeDesc}.`;
      } else if (direction === 'right') {
        instruction = `Turn right at ${fromNode.name} and proceed along the ${pathTypeDesc} toward ${toNode.name}.`;
      } else if (direction === 'slight_right') {
        instruction = `Bear slightly right near ${fromNode.name} toward ${toNode.name}.`;
      } else if (direction === 'sharp_right') {
        instruction = `Make a sharp right near ${fromNode.name} onto the ${pathTypeDesc}.`;
      }

      steps.push({
        stepNumber: i + 1,
        direction,
        instruction,
        distanceMeters: edge.distance,
        fromLocationName: fromNode.name,
        toLocationName: toNode.name,
        landmark: fromNode.buildingNumber ? `Bldg ${fromNode.buildingNumber}` : undefined,
        pathType: (edge.pathType as any) || 'walkway',
      });
    }

    // Final arrival step
    const destNode = graph.getNode(pathIds[pathIds.length - 1])!;
    steps.push({
      stepNumber: steps.length + 1,
      direction: 'destination',
      instruction: `Arrive at your destination: ${destNode.name} (${destNode.buildingNumber || destNode.code}).`,
      distanceMeters: 0,
      fromLocationName: destNode.name,
      toLocationName: destNode.name,
      pathType: 'walkway',
    });

    return steps;
  }
}
