/**
 * LocationHashTable: Custom Hash Table with Separate Chaining
 *
 * Implements an associative array mapping location keys (names, codes, IDs)
 * to Location objects. Uses separate chaining for collision resolution.
 * Demonstrates:
 * - Hash function (polynomial rolling hash with prime modulo)
 * - Separate chaining with collision buckets
 * - Fast O(1) average lookup for campus facilities
 * - Prefix matching and category indexing for autocomplete
 */

import { LocationNode } from '../types/campus';

export interface HashEntry<K, V> {
  key: K;
  value: V;
}

export interface BucketStats {
  bucketIndex: number;
  entries: HashEntry<string, LocationNode>[];
  count: number;
}

export class LocationHashTable {
  private capacity: number;
  private size: number = 0;
  private buckets: HashEntry<string, LocationNode>[][];

  constructor(capacity: number = 31) {
    this.capacity = capacity;
    this.buckets = Array.from({ length: this.capacity }, () => []);
  }

  /**
   * Computes hash code using polynomial rolling hash
   * hash = (s[0]*31^(n-1) + s[1]*31^(n-2) + ... + s[n-1]) % capacity
   */
  public hash(key: string): number {
    let hashValue = 0;
    const prime = 31;
    const normalizedKey = key.trim().toLowerCase();

    for (let i = 0; i < normalizedKey.length; i++) {
      hashValue = (hashValue * prime + normalizedKey.charCodeAt(i)) % this.capacity;
    }

    return Math.abs(hashValue);
  }

  /**
   * Inserts or updates a location record by key
   */
  public put(key: string, value: LocationNode): void {
    const index = this.hash(key);
    const bucket = this.buckets[index];
    const normalizedKey = key.trim().toLowerCase();

    // Check if key already exists in bucket
    for (const entry of bucket) {
      if (entry.key.toLowerCase() === normalizedKey) {
        entry.value = value;
        return;
      }
    }

    // Insert new entry into bucket
    bucket.push({ key, value });
    this.size++;

    // Rehash if load factor exceeds 0.75
    if (this.size / this.capacity > 0.75) {
      this.rehash(this.capacity * 2 + 1);
    }
  }

  /**
   * Retrieves a location by key
   */
  public get(key: string): LocationNode | null {
    const index = this.hash(key);
    const bucket = this.buckets[index];
    const normalizedKey = key.trim().toLowerCase();

    for (const entry of bucket) {
      if (entry.key.toLowerCase() === normalizedKey) {
        return entry.value;
      }
    }

    return null;
  }

  /**
   * Checks if key exists
   */
  public has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Removes an entry by key
   */
  public remove(key: string): boolean {
    const index = this.hash(key);
    const bucket = this.buckets[index];
    const normalizedKey = key.trim().toLowerCase();

    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].key.toLowerCase() === normalizedKey) {
        bucket.splice(i, 1);
        this.size--;
        return true;
      }
    }

    return false;
  }

  /**
   * Autocomplete search: finds locations where name, code, category, or amenities match query
   */
  public search(query: string, maxResults: number = 8): LocationNode[] {
    if (!query || query.trim() === '') {
      return this.getAllLocations().slice(0, maxResults);
    }

    const q = query.trim().toLowerCase();
    const seenIds = new Set<string>();
    const matches: { location: LocationNode; score: number }[] = [];

    for (const bucket of this.buckets) {
      for (const entry of bucket) {
        const loc = entry.value;
        if (seenIds.has(loc.id)) continue;

        const nameLower = loc.name.toLowerCase();
        const codeLower = loc.code.toLowerCase();
        const catLower = loc.category.toLowerCase().replace('_', ' ');
        const descLower = loc.description.toLowerCase();

        let score = 0;
        if (nameLower.startsWith(q)) {
          score = 100;
        } else if (codeLower.startsWith(q)) {
          score = 90;
        } else if (nameLower.includes(q)) {
          score = 70;
        } else if (codeLower.includes(q)) {
          score = 60;
        } else if (catLower.includes(q)) {
          score = 50;
        } else if (loc.amenities.some(a => a.toLowerCase().includes(q))) {
          score = 40;
        } else if (descLower.includes(q)) {
          score = 20;
        }

        if (score > 0) {
          seenIds.add(loc.id);
          matches.push({ location: loc, score });
        }
      }
    }

    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(m => m.location);
  }

  public getAllLocations(): LocationNode[] {
    const seen = new Set<string>();
    const result: LocationNode[] = [];

    for (const bucket of this.buckets) {
      for (const entry of bucket) {
        if (!seen.has(entry.value.id)) {
          seen.add(entry.value.id);
          result.push(entry.value);
        }
      }
    }

    return result;
  }

  /**
   * Inspect bucket distribution for educational visualizer
   */
  public getInspectionData(): BucketStats[] {
    return this.buckets.map((entries, bucketIndex) => ({
      bucketIndex,
      entries: [...entries],
      count: entries.length,
    }));
  }

  public getLoadFactor(): number {
    return Number((this.size / this.capacity).toFixed(3));
  }

  public getCollisionCount(): number {
    let collisions = 0;
    for (const bucket of this.buckets) {
      if (bucket.length > 1) {
        collisions += bucket.length - 1;
      }
    }
    return collisions;
  }

  public getCapacity(): number {
    return this.capacity;
  }

  public getSize(): number {
    return this.size;
  }

  private rehash(newCapacity: number): void {
    const oldBuckets = this.buckets;
    this.capacity = newCapacity;
    this.buckets = Array.from({ length: this.capacity }, () => []);
    this.size = 0;

    for (const bucket of oldBuckets) {
      for (const entry of bucket) {
        this.put(entry.key, entry.value);
      }
    }
  }

  public clear(): void {
    this.buckets = Array.from({ length: this.capacity }, () => []);
    this.size = 0;
  }
}
