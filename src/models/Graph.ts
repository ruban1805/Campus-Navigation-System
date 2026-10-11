/**
 * CampusGraph: Weighted Undirected/Directed Graph Data Structure
 *
 * Models the college campus as:
 * - Vertices (Nodes): Campus locations (buildings, gates, parks, facilities)
 * - Edges: Connecting pathways, roads, and corridors with weights (distance in meters)
 *
 * Implements an Adjacency List for O(V + E) space efficiency and fast neighbor traversal.
 */

import { CampusEdge, LocationNode } from '../types/campus';

export class CampusGraph {
  // Map of Node ID -> LocationNode
  private nodes: Map<string, LocationNode> = new Map();

  // Adjacency List: Node ID -> Array of incident CampusEdges
  private adjacencyList: Map<string, CampusEdge[]> = new Map();

  constructor(initialNodes?: LocationNode[], initialEdges?: CampusEdge[]) {
    if (initialNodes) {
      for (const node of initialNodes) {
        this.addNode(node);
      }
    }
    if (initialEdges) {
      for (const edge of initialEdges) {
        this.addEdge(edge);
      }
    }
  }

  /**
   * Adds a vertex to the graph
   */
  public addNode(node: LocationNode): void {
    this.nodes.set(node.id, node);
    if (!this.adjacencyList.has(node.id)) {
      this.adjacencyList.set(node.id, []);
    }
  }

  /**
   * Updates an existing node
   */
  public updateNode(node: LocationNode): void {
    if (this.nodes.has(node.id)) {
      this.nodes.set(node.id, node);
    }
  }

  /**
   * Removes a vertex and all its incident edges
   */
  public removeNode(nodeId: string): void {
    this.nodes.delete(nodeId);
    this.adjacencyList.delete(nodeId);

    // Remove incident edges from all other nodes' adjacency lists
    for (const [id, edges] of this.adjacencyList.entries()) {
      this.adjacencyList.set(
        id,
        edges.filter(edge => edge.fromId !== nodeId && edge.toId !== nodeId)
      );
    }
  }

  /**
   * Adds an edge connecting two nodes. Since campus paths are typically bidirectional,
   * we add the edge to both adjacency lists unless specified otherwise.
   */
  public addEdge(edge: CampusEdge, bidirectional: boolean = true): void {
    if (!this.nodes.has(edge.fromId) || !this.nodes.has(edge.toId)) {
      throw new Error(`Cannot add edge: Both nodes ${edge.fromId} and ${edge.toId} must exist.`);
    }

    // Add forward edge
    const fromList = this.adjacencyList.get(edge.fromId) || [];
    // Replace if already exists with same id or endpoints
    const existingIndex = fromList.findIndex(
      e => e.id === edge.id || (e.fromId === edge.fromId && e.toId === edge.toId)
    );
    if (existingIndex >= 0) {
      fromList[existingIndex] = edge;
    } else {
      fromList.push(edge);
    }
    this.adjacencyList.set(edge.fromId, fromList);

    // If bidirectional, add reverse edge representation
    if (bidirectional) {
      const toList = this.adjacencyList.get(edge.toId) || [];
      const reverseEdge: CampusEdge = {
        id: `${edge.id}_rev`,
        fromId: edge.toId,
        toId: edge.fromId,
        distance: edge.distance,
        pathType: edge.pathType,
        isAccessible: edge.isAccessible,
        isBlocked: edge.isBlocked,
      };

      const existingRevIndex = toList.findIndex(
        e => e.id === reverseEdge.id || (e.fromId === edge.toId && e.toId === edge.fromId)
      );
      if (existingRevIndex >= 0) {
        toList[existingRevIndex] = reverseEdge;
      } else {
        toList.push(reverseEdge);
      }
      this.adjacencyList.set(edge.toId, toList);
    }
  }

  /**
   * Removes an edge between two locations
   */
  public removeEdge(fromId: string, toId: string): void {
    const fromList = this.adjacencyList.get(fromId) || [];
    this.adjacencyList.set(
      fromId,
      fromList.filter(e => e.toId !== toId)
    );

    const toList = this.adjacencyList.get(toId) || [];
    this.adjacencyList.set(
      toId,
      toList.filter(e => e.toId !== fromId)
    );
  }

  /**
   * Updates distance/weight of an edge
   */
  public updateEdgeDistance(fromId: string, toId: string, newDistance: number): void {
    const fromList = this.adjacencyList.get(fromId) || [];
    for (const e of fromList) {
      if (e.toId === toId) {
        e.distance = newDistance;
      }
    }

    const toList = this.adjacencyList.get(toId) || [];
    for (const e of toList) {
      if (e.toId === fromId) {
        e.distance = newDistance;
      }
    }
  }

  /**
   * Toggles blocked status on an edge (e.g. for maintenance / simulation of rerouting)
   */
  public toggleEdgeBlocked(fromId: string, toId: string, blocked?: boolean): void {
    const fromList = this.adjacencyList.get(fromId) || [];
    for (const e of fromList) {
      if (e.toId === toId) {
        e.isBlocked = blocked !== undefined ? blocked : !e.isBlocked;
      }
    }

    const toList = this.adjacencyList.get(toId) || [];
    for (const e of toList) {
      if (e.toId === fromId) {
        e.isBlocked = blocked !== undefined ? blocked : !e.isBlocked;
      }
    }
  }

  /**
   * Returns list of outgoing edges from a node
   */
  public getNeighbors(nodeId: string): CampusEdge[] {
    return this.adjacencyList.get(nodeId) || [];
  }

  public getNode(nodeId: string): LocationNode | undefined {
    return this.nodes.get(nodeId);
  }

  public getAllNodes(): LocationNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Returns unique list of all undirected edges for map rendering
   */
  public getAllEdges(): CampusEdge[] {
    const uniqueMap = new Map<string, CampusEdge>();

    for (const edges of this.adjacencyList.values()) {
      for (const edge of edges) {
        // Normalize pair key so (A, B) and (B, A) share the same key
        const [a, b] = [edge.fromId, edge.toId].sort();
        const pairKey = `${a}---${b}`;
        if (!uniqueMap.has(pairKey)) {
          uniqueMap.set(pairKey, edge);
        }
      }
    }

    return Array.from(uniqueMap.values());
  }

  public getNodeCount(): number {
    return this.nodes.size;
  }

  public getEdgeCount(): number {
    return this.getAllEdges().length;
  }

  /**
   * Returns the node's degree (number of connecting paths)
   */
  public getNodeDegree(nodeId: string): number {
    return (this.adjacencyList.get(nodeId) || []).length;
  }

  /**
   * Generates Adjacency Matrix representation for educational visualization
   */
  public getAdjacencyMatrix(): {
    labels: { id: string; name: string; code: string }[];
    matrix: (number | null)[][];
  } {
    const nodes = this.getAllNodes();
    const idToIndex = new Map<string, number>();

    nodes.forEach((n, idx) => {
      idToIndex.set(n.id, idx);
    });

    const size = nodes.length;
    const matrix: (number | null)[][] = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => null)
    );

    for (let i = 0; i < size; i++) {
      matrix[i][i] = 0; // Distance to self is 0
    }

    for (const [fromId, edges] of this.adjacencyList.entries()) {
      const fromIdx = idToIndex.get(fromId);
      if (fromIdx === undefined) continue;

      for (const edge of edges) {
        const toIdx = idToIndex.get(edge.toId);
        if (toIdx !== undefined && !edge.isBlocked) {
          matrix[fromIdx][toIdx] = edge.distance;
        }
      }
    }

    return {
      labels: nodes.map(n => ({ id: n.id, name: n.name, code: n.code })),
      matrix,
    };
  }
}
