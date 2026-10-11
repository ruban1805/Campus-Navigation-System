/**
 * MinPriorityQueue: A Binary Min-Heap Implementation
 *
 * Implements a priority queue where elements with the smallest priority value (e.g. shortest distance)
 * are dequeued first. Used extensively by Dijkstra's algorithm to greedily explore
 * the unvisited vertex with the minimum tentative distance.
 *
 * Time Complexity:
 * - Insert / Enqueue: O(log N)
 * - Extract-Min / Dequeue: O(log N)
 * - Peek: O(1)
 * Space Complexity: O(N)
 */

export interface HeapItem<T> {
  element: T;
  priority: number;
}

export class MinPriorityQueue<T> {
  private heap: HeapItem<T>[] = [];

  constructor(initialItems?: HeapItem<T>[]) {
    if (initialItems && initialItems.length > 0) {
      for (const item of initialItems) {
        this.enqueue(item.element, item.priority);
      }
    }
  }

  /**
   * Returns index of parent node in zero-indexed array
   */
  private getParentIndex(i: number): number {
    return Math.floor((i - 1) / 2);
  }

  /**
   * Returns index of left child
   */
  private getLeftChildIndex(i: number): number {
    return 2 * i + 1;
  }

  /**
   * Returns index of right child
   */
  private getRightChildIndex(i: number): number {
    return 2 * i + 2;
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }

  /**
   * Inserts an element with its priority into the binary min-heap
   */
  public enqueue(element: T, priority: number): void {
    const newItem: HeapItem<T> = { element, priority };
    this.heap.push(newItem);
    this.heapifyUp(this.heap.length - 1);
  }

  /**
   * Moves newly inserted element up the tree until heap property is restored
   */
  private heapifyUp(index: number): void {
    let currentIndex = index;
    while (currentIndex > 0) {
      const parentIndex = this.getParentIndex(currentIndex);
      if (this.heap[currentIndex].priority < this.heap[parentIndex].priority) {
        this.swap(currentIndex, parentIndex);
        currentIndex = parentIndex;
      } else {
        break;
      }
    }
  }

  /**
   * Removes and returns the element with minimum priority (root of heap)
   */
  public dequeue(): HeapItem<T> | null {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop() || null;

    const minItem = this.heap[0];
    // Move last element to root and sift down
    this.heap[0] = this.heap.pop()!;
    this.heapifyDown(0);
    return minItem;
  }

  /**
   * Restores min-heap property downwards from the given index
   */
  private heapifyDown(index: number): void {
    let smallest = index;
    const left = this.getLeftChildIndex(index);
    const right = this.getRightChildIndex(index);
    const length = this.heap.length;

    if (left < length && this.heap[left].priority < this.heap[smallest].priority) {
      smallest = left;
    }

    if (right < length && this.heap[right].priority < this.heap[smallest].priority) {
      smallest = right;
    }

    if (smallest !== index) {
      this.swap(index, smallest);
      this.heapifyDown(smallest);
    }
  }

  public peek(): HeapItem<T> | null {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  public size(): number {
    return this.heap.length;
  }

  /**
   * Returns a copy of the underlying array for visualization and inspection
   */
  public toArray(): HeapItem<T>[] {
    return [...this.heap];
  }

  public clear(): void {
    this.heap = [];
  }
}
