/**
 * Production-ready, beginner-friendly Java Implementation of Smart Campus Navigation System
 * Includes full source code for all modules and comprehensive VS Code setup instructions.
 */

export interface JavaFile {
  filename: string;
  description: string;
  dataStructureRole: string;
  code: string;
}

export const JAVA_SOURCE_FILES: JavaFile[] = [
  {
    filename: 'Location.java',
    description: 'Vertex / Node class representing a campus building or facility',
    dataStructureRole: 'Graph Vertex (Node)',
    code: `/**
 * Location.java
 * Represents a Vertex (Node) in the Campus Graph.
 * Stores building metadata, coordinates, and facility attributes.
 */
import java.util.ArrayList;
import java.util.List;

public class Location {
    private String id;
    private String name;
    private String code;
    private String category;
    private double x;
    private double y;
    private String buildingNumber;
    private String description;
    private List<String> amenities;

    public Location(String id, String name, String code, String category, 
                    double x, double y, String buildingNumber, String description) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.category = category;
        this.x = x;
        this.y = y;
        this.buildingNumber = buildingNumber;
        this.description = description;
        this.amenities = new ArrayList<>();
    }

    public void addAmenity(String amenity) {
        this.amenities.add(amenity);
    }

    // Getters and Setters
    public String getId() { return id; }
    public String getName() { return name; }
    public String getCode() { return code; }
    public String getCategory() { return category; }
    public double getX() { return x; }
    public double getY() { return y; }
    public String getBuildingNumber() { return buildingNumber; }
    public String getDescription() { return description; }
    public List<String> getAmenities() { return amenities; }

    @Override
    public String toString() {
        return String.format("[%s] %s (%s, Bldg %s)", code, name, category, buildingNumber);
    }
}
`,
  },
  {
    filename: 'Edge.java',
    description: 'Weighted edge representing a connecting path between two locations',
    dataStructureRole: 'Graph Weighted Edge',
    code: `/**
 * Edge.java
 * Represents a connecting pathway between two campus locations.
 * The weight is the distance in meters.
 */
public class Edge {
    private String fromId;
    private String toId;
    private int distance; // Weight in meters
    private String pathType; // walkway, road, corridor, garden
    private boolean isAccessible; // Wheelchair accessible
    private boolean isBlocked; // Temporary obstacle or maintenance

    public Edge(String fromId, String toId, int distance, String pathType, boolean isAccessible) {
        this.fromId = fromId;
        this.toId = toId;
        this.distance = distance;
        this.pathType = pathType;
        this.isAccessible = isAccessible;
        this.isBlocked = false;
    }

    public String getFromId() { return fromId; }
    public String getToId() { return toId; }
    public int getDistance() { return distance; }
    public String getPathType() { return pathType; }
    public boolean isAccessible() { return isAccessible; }
    public boolean isBlocked() { return isBlocked; }

    public void setDistance(int distance) { this.distance = distance; }
    public void setBlocked(boolean blocked) { this.isBlocked = blocked; }

    @Override
    public String toString() {
        return String.format("%s -> %s (%dm, %s)", fromId, toId, distance, pathType);
    }
}
`,
  },
  {
    filename: 'MinPriorityQueue.java',
    description: 'Custom Binary Min-Heap Priority Queue for Dijkstra\'s Algorithm',
    dataStructureRole: 'Priority Queue (Binary Min-Heap) - O(log N) extract-min & insert',
    code: `/**
 * MinPriorityQueue.java
 * Custom implementation of a Binary Min-Heap Priority Queue.
 * Enables Dijkstra's Algorithm to greedily pick the unvisited node with the smallest tentative distance in O(log V).
 */
import java.util.ArrayList;
import java.util.NoSuchElementException;

public class MinPriorityQueue<T> {
    public static class HeapNode<T> {
        public T element;
        public int priority; // Smaller value = higher priority (shorter distance)

        public HeapNode(T element, int priority) {
            this.element = element;
            this.priority = priority;
        }
    }

    private ArrayList<HeapNode<T>> heap;

    public MinPriorityQueue() {
        this.heap = new ArrayList<>();
    }

    private int parent(int i) { return (i - 1) / 2; }
    private int leftChild(int i) { return 2 * i + 1; }
    private int rightChild(int i) { return 2 * i + 2; }

    private void swap(int i, int j) {
        HeapNode<T> temp = heap.get(i);
        heap.set(i, heap.get(j));
        heap.set(j, temp);
    }

    /**
     * Inserts an element with priority into the min-heap.
     * Time Complexity: O(log N)
     */
    public void enqueue(T element, int priority) {
        HeapNode<T> node = new HeapNode<>(element, priority);
        heap.add(node);
        heapifyUp(heap.size() - 1);
    }

    private void heapifyUp(int index) {
        int current = index;
        while (current > 0 && heap.get(current).priority < heap.get(parent(current)).priority) {
            swap(current, parent(current));
            current = parent(current);
        }
    }

    /**
     * Extracts and removes the element with the minimum priority (root).
     * Time Complexity: O(log N)
     */
    public HeapNode<T> dequeue() {
        if (heap.isEmpty()) {
            throw new NoSuchElementException("Priority Queue is empty");
        }
        HeapNode<T> minNode = heap.get(0);
        HeapNode<T> lastNode = heap.remove(heap.size() - 1);

        if (!heap.isEmpty()) {
            heap.set(0, lastNode);
            heapifyDown(0);
        }
        return minNode;
    }

    private void heapifyDown(int index) {
        int smallest = index;
        int left = leftChild(index);
        int right = rightChild(index);
        int size = heap.size();

        if (left < size && heap.get(left).priority < heap.get(smallest).priority) {
            smallest = left;
        }
        if (right < size && heap.get(right).priority < heap.get(smallest).priority) {
            smallest = right;
        }

        if (smallest != index) {
            swap(index, smallest);
            heapifyDown(smallest);
        }
    }

    public boolean isEmpty() {
        return heap.isEmpty();
    }

    public int size() {
        return heap.size();
    }
}
`,
  },
  {
    filename: 'LocationHashTable.java',
    description: 'Custom Hash Table with Separate Chaining for O(1) building name lookup and search',
    dataStructureRole: 'Hash Table (Separate Chaining) - O(1) avg lookup',
    code: `/**
 * LocationHashTable.java
 * Custom Hash Table implementing Separate Chaining with LinkedList buckets.
 * Provides O(1) average-time search for campus buildings by name or code.
 */
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

public class LocationHashTable {
    public static class Entry {
        public String key;
        public Location value;

        public Entry(String key, Location value) {
            this.key = key;
            this.value = value;
        }
    }

    private int capacity;
    private int size;
    private LinkedList<Entry>[] buckets;

    @SuppressWarnings("unchecked")
    public LocationHashTable(int initialCapacity) {
        this.capacity = initialCapacity;
        this.size = 0;
        this.buckets = new LinkedList[capacity];
        for (int i = 0; i < capacity; i++) {
            this.buckets[i] = new LinkedList<>();
        }
    }

    /**
     * Polynomial rolling hash function.
     */
    private int hash(String key) {
        int hashVal = 0;
        int prime = 31;
        String normalized = key.trim().toLowerCase();
        for (int i = 0; i < normalized.length(); i++) {
            hashVal = (hashVal * prime + normalized.charAt(i)) % capacity;
        }
        return Math.abs(hashVal);
    }

    /**
     * Inserts or updates an entry in the hash table.
     */
    public void put(String key, Location value) {
        int bucketIndex = hash(key);
        LinkedList<Entry> bucket = buckets[bucketIndex];

        for (Entry entry : bucket) {
            if (entry.key.equalsIgnoreCase(key)) {
                entry.value = value; // Update existing
                return;
            }
        }

        bucket.add(new Entry(key, value));
        size++;

        // Rehash if load factor exceeds 0.75
        if ((double) size / capacity > 0.75) {
            rehash();
        }
    }

    /**
     * Retrieves a Location by key in O(1) average time.
     */
    public Location get(String key) {
        int bucketIndex = hash(key);
        LinkedList<Entry> bucket = buckets[bucketIndex];

        for (Entry entry : bucket) {
            if (entry.key.equalsIgnoreCase(key)) {
                return entry.value;
            }
        }
        return null;
    }

    /**
     * Autocomplete / keyword search across building names and codes.
     */
    public List<Location> search(String query) {
        List<Location> results = new ArrayList<>();
        String q = query.trim().toLowerCase();

        for (LinkedList<Entry> bucket : buckets) {
            for (Entry entry : bucket) {
                Location loc = entry.value;
                if (loc.getName().toLowerCase().contains(q) || 
                    loc.getCode().toLowerCase().contains(q) ||
                    loc.getCategory().toLowerCase().contains(q)) {
                    if (!results.contains(loc)) {
                        results.add(loc);
                    }
                }
            }
        }
        return results;
    }

    @SuppressWarnings("unchecked")
    private void rehash() {
        int newCapacity = capacity * 2 + 1;
        LinkedList<Entry>[] oldBuckets = buckets;

        this.capacity = newCapacity;
        this.buckets = new LinkedList[newCapacity];
        this.size = 0;
        for (int i = 0; i < newCapacity; i++) {
            this.buckets[i] = new LinkedList<>();
        }

        for (LinkedList<Entry> bucket : oldBuckets) {
            for (Entry entry : bucket) {
                put(entry.key, entry.value);
            }
        }
    }

    public int getSize() { return size; }
    public int getCapacity() { return capacity; }
}
`,
  },
  {
    filename: 'Graph.java',
    description: 'Graph data structure using Adjacency List for campus locations and edges',
    dataStructureRole: 'Graph (Adjacency List) - O(V + E) space efficiency',
    code: `/**
 * Graph.java
 * Graph data structure representing campus locations as vertices
 * and walkable paths as weighted edges using an Adjacency List.
 */
import java.util.*;

public class Graph {
    private Map<String, Location> nodes;
    private Map<String, List<Edge>> adjacencyList;

    public Graph() {
        this.nodes = new HashMap<>();
        this.adjacencyList = new HashMap<>();
    }

    public void addNode(Location location) {
        nodes.put(location.getId(), location);
        adjacencyList.putIfAbsent(location.getId(), new ArrayList<>());
    }

    public void removeNode(String nodeId) {
        nodes.remove(nodeId);
        adjacencyList.remove(nodeId);
        // Remove incident edges from all other nodes
        for (List<Edge> edges : adjacencyList.values()) {
            edges.removeIf(e -> e.getToId().equals(nodeId));
        }
    }

    public void addEdge(Edge edge, boolean bidirectional) {
        if (!nodes.containsKey(edge.getFromId()) || !nodes.containsKey(edge.getToId())) {
            throw new IllegalArgumentException("Both endpoints must exist in graph.");
        }
        adjacencyList.get(edge.getFromId()).add(edge);

        if (bidirectional) {
            Edge reverseEdge = new Edge(
                edge.getToId(), edge.getFromId(), edge.getDistance(), 
                edge.getPathType(), edge.isAccessible()
            );
            adjacencyList.get(edge.getToId()).add(reverseEdge);
        }
    }

    public Location getNode(String id) {
        return nodes.get(id);
    }

    public List<Edge> getNeighbors(String nodeId) {
        return adjacencyList.getOrDefault(nodeId, Collections.emptyList());
    }

    public Collection<Location> getAllNodes() {
        return nodes.values();
    }

    public int getNodeCount() {
        return nodes.size();
    }
}
`,
  },
  {
    filename: 'DijkstraShortestPath.java',
    description: 'Shortest path computation using Dijkstra\'s Algorithm and Min-Heap',
    dataStructureRole: 'Algorithm: Dijkstra with MinPriorityQueue - O((V + E) log V)',
    code: `/**
 * DijkstraShortestPath.java
 * Calculates the shortest path between any two campus locations using Dijkstra's Algorithm.
 */
import java.util.*;

public class DijkstraShortestPath {

    public static class PathResult {
        public boolean found;
        public List<Location> path;
        public int totalDistance;
        public int walkingTimeMinutes;
        public List<String> directions;

        public PathResult(boolean found, List<Location> path, int totalDistance, List<String> directions) {
            this.found = found;
            this.path = path;
            this.totalDistance = totalDistance;
            this.walkingTimeMinutes = (int) Math.ceil(totalDistance / 75.0); // ~75 meters/minute walking speed
            this.directions = directions;
        }
    }

    public static PathResult findShortestPath(Graph graph, String startId, String destId, boolean wheelchairOnly) {
        Location startNode = graph.getNode(startId);
        Location destNode = graph.getNode(destId);

        if (startNode == null || destNode == null) {
            return new PathResult(false, Collections.emptyList(), 0, 
                Collections.singletonList("Error: Start or destination location does not exist."));
        }

        if (startId.equals(destId)) {
            return new PathResult(true, Collections.singletonList(startNode), 0, 
                Collections.singletonList("You are already at your destination: " + startNode.getName()));
        }

        Map<String, Integer> distances = new HashMap<>();
        Map<String, String> previous = new HashMap<>();
        Map<String, Edge> edgeUsed = new HashMap<>();
        Set<String> visited = new Set<>() {};
        Set<String> visitedSet = new HashSet<>();

        MinPriorityQueue<String> pq = new MinPriorityQueue<>();

        // Initialize tentative distances to infinity
        for (Location loc : graph.getAllNodes()) {
            distances.put(loc.getId(), Integer.MAX_VALUE);
            previous.put(loc.getId(), null);
        }

        distances.put(startId, 0);
        pq.enqueue(startId, 0);

        while (!pq.isEmpty()) {
            MinPriorityQueue.HeapNode<String> current = pq.dequeue();
            String currId = current.element;
            int currDist = current.priority;

            if (currDist > distances.get(currId)) continue;
            if (visitedSet.contains(currId)) continue;
            visitedSet.add(currId);

            // Early exit once target is settled
            if (currId.equals(destId)) break;

            for (Edge edge : graph.getNeighbors(currId)) {
                String neighborId = edge.getToId();

                if (wheelchairOnly && !edge.isAccessible()) continue;
                if (edge.isBlocked()) continue;
                if (visitedSet.contains(neighborId)) continue;

                int newDist = currDist + edge.getDistance();
                if (newDist < distances.get(neighborId)) {
                    distances.put(neighborId, newDist);
                    previous.put(neighborId, currId);
                    edgeUsed.put(neighborId, edge);
                    pq.enqueue(neighborId, newDist);
                }
            }
        }

        if (distances.get(destId) == Integer.MAX_VALUE) {
            return new PathResult(false, Collections.emptyList(), 0, 
                Collections.singletonList("No available path found between " + startNode.getName() + " and " + destNode.getName()));
        }

        // Reconstruct path
        LinkedList<Location> path = new LinkedList<>();
        String stepId = destId;
        while (stepId != null) {
            path.addFirst(graph.getNode(stepId));
            stepId = previous.get(stepId);
        }

        // Generate turn-by-turn directions
        List<String> directions = new ArrayList<>();
        for (int i = 0; i < path.size() - 1; i++) {
            Location from = path.get(i);
            Location to = path.get(i + 1);
            Edge edge = edgeUsed.get(to.getId());
            int dist = edge != null ? edge.getDistance() : 0;
            directions.add(String.format("Step %d: Walk %dm from %s to %s via %s", 
                i + 1, dist, from.getName(), to.getName(), edge != null ? edge.getPathType() : "walkway"));
        }
        directions.add(String.format("Arrive at %s.", destNode.getName()));

        return new PathResult(true, path, distances.get(destId), directions);
    }
}
`,
  },
  {
    filename: 'CampusNavigationSystem.java',
    description: 'Main Driver Program with Interactive CLI and Demonstration Suite',
    dataStructureRole: 'Main Application Controller & Interactive CLI',
    code: `/**
 * CampusNavigationSystem.java
 * Main driver program for the Smart Campus Navigation System.
 * Demonstrates Graph construction, Hash Table indexing, and Dijkstra's algorithm.
 */
import java.util.List;
import java.util.Scanner;

public class CampusNavigationSystem {
    private Graph graph;
    private LocationHashTable searchIndex;

    public CampusNavigationSystem() {
        this.graph = new Graph();
        this.searchIndex = new LocationHashTable(31);
        loadSampleCampusData();
    }

    private void loadSampleCampusData() {
        // 1. Create Location Nodes
        Location gate = new Location("gate", "Main Entrance (North Gate)", "GATE-01", "entrance", 180, 80, "G-1", "Main campus gate");
        Location admin = new Location("admin", "Admin & Admissions Block", "ADM-100", "administrative", 320, 180, "Block A", "Chancellor and registrar office");
        Location library = new Location("library", "Central University Library", "LIB-200", "library", 520, 150, "Block L", "Multi-floor research library");
        Location csLab = new Location("cslab", "Alan Turing CS & AI Labs", "CS-400", "laboratory", 520, 310, "Block C", "Robotics and computing labs");
        Location eng = new Location("eng", "Engineering Lecture Hall", "ENG-300", "academic", 310, 340, "Block E", "Lecture auditoriums and classrooms");
        Location sci = new Location("sci", "Raman Science Complex", "SCI-500", "laboratory", 740, 220, "Block S", "Chemistry and physics labs");
        Location canteen = new Location("canteen", "Central Food Court & Canteen", "CAN-01", "canteen", 210, 490, "Plaza 1", "Multi-cuisine dining facility");
        Location sac = new Location("sac", "Student Activity Center", "SAC-600", "student_center", 430, 470, "Block U", "Clubs and student council");
        Location aud = new Location("aud", "University Auditorium", "AUD-700", "academic", 690, 410, "Block AUD", "1500-seat performance hall");
        Location sports = new Location("sports", "Sports Arena & Gymnasium", "SPT-900", "sports", 840, 530, "Arena", "Indoor courts and gym");

        Location[] allLocations = { gate, admin, library, csLab, eng, sci, canteen, sac, aud, sports };

        for (Location loc : allLocations) {
            graph.addNode(loc);
            searchIndex.put(loc.getName(), loc);
            searchIndex.put(loc.getCode(), loc);
            searchIndex.put(loc.getId(), loc);
        }

        // 2. Connect Locations with Weighted Edges
        graph.addEdge(new Edge("gate", "admin", 180, "walkway", true), true);
        graph.addEdge(new Edge("admin", "library", 210, "garden_path", true), true);
        graph.addEdge(new Edge("admin", "eng", 160, "walkway", true), true);
        graph.addEdge(new Edge("library", "cslab", 160, "indoor_corridor", true), true);
        graph.addEdge(new Edge("library", "sci", 230, "walkway", true), true);
        graph.addEdge(new Edge("cslab", "eng", 210, "walkway", true), true);
        graph.addEdge(new Edge("cslab", "sac", 180, "garden_path", true), true);
        graph.addEdge(new Edge("cslab", "aud", 210, "walkway", true), true);
        graph.addEdge(new Edge("eng", "canteen", 190, "walkway", true), true);
        graph.addEdge(new Edge("eng", "sac", 170, "walkway", true), true);
        graph.addEdge(new Edge("canteen", "sac", 220, "walkway", true), true);
        graph.addEdge(new Edge("sac", "aud", 260, "walkway", true), true);
        graph.addEdge(new Edge("sci", "aud", 200, "walkway", true), true);
        graph.addEdge(new Edge("aud", "sports", 190, "walkway", true), true);
    }

    public void runDemo() {
        System.out.println("==================================================");
        System.out.println("     SMART CAMPUS NAVIGATION SYSTEM (JAVA)        ");
        System.out.println("==================================================");
        System.out.println("Data Structures Used:");
        System.out.println(" 1. Graph (Adjacency List): O(V + E) representation");
        System.out.println(" 2. LocationHashTable: O(1) average building search");
        System.out.println(" 3. MinPriorityQueue (Min-Heap): O(log V) priority retrieval");
        System.out.println(" 4. Dijkstra's Algorithm: O((V + E) log V) optimal path finding");
        System.out.println("--------------------------------------------------");

        // Demo 1: Fast Lookup using Hash Table
        System.out.println("\\n>>> DEMO 1: Hash Table Instant Lookup for 'LIB-200':");
        Location lib = searchIndex.get("LIB-200");
        if (lib != null) {
            System.out.println("Found: " + lib);
        }

        // Demo 2: Dijkstra Shortest Path Calculation
        System.out.println("\\n>>> DEMO 2: Calculating Shortest Path from Main Gate to Sports Arena:");
        DijkstraShortestPath.PathResult result = DijkstraShortestPath.findShortestPath(graph, "gate", "sports", false);

        if (result.found) {
            System.out.println("✓ Path Found!");
            System.out.println("Total Distance: " + result.totalDistance + " meters");
            System.out.println("Estimated Walking Time: " + result.walkingTimeMinutes + " minutes");
            System.out.println("\\nStep-by-Step Directions:");
            for (String step : result.directions) {
                System.out.println("  - " + step);
            }
        } else {
            System.out.println("✗ No route exists.");
        }
        System.out.println("\\n==================================================");
    }

    public static void main(String[] args) {
        CampusNavigationSystem app = new CampusNavigationSystem();
        app.runDemo();
    }
}
`,
  },
];

export const VSCODE_SETUP_INSTRUCTIONS = {
  prerequisites: [
    {
      title: 'Java Development Kit (JDK 17 or 21)',
      description: 'Ensure JDK is installed on your computer. You can check by running `java -version` in your terminal. If not installed, download Temurin OpenJDK from adoptium.net.',
    },
    {
      title: 'Visual Studio Code',
      description: 'Download and install Visual Studio Code from code.visualstudio.com.',
    },
    {
      title: 'Extension Pack for Java (by Microsoft)',
      description: 'In VS Code, press Ctrl+Shift+X (Cmd+Shift+X on Mac), search for "Extension Pack for Java", and click Install.',
    },
  ],
  steps: [
    {
      step: 1,
      title: 'Create Project Directory',
      command: 'mkdir CampusNavigator && cd CampusNavigator',
      details: 'Create a new folder named `CampusNavigator` and open it in VS Code (`File > Open Folder...`).',
    },
    {
      step: 2,
      title: 'Place Java Files',
      command: 'touch Location.java Edge.java MinPriorityQueue.java LocationHashTable.java Graph.java DijkstraShortestPath.java CampusNavigationSystem.java',
      details: 'Copy each file from the Java Code viewer tab into your project folder with matching filenames.',
    },
    {
      step: 3,
      title: 'Compile the Project',
      command: 'javac *.java',
      details: 'Open the VS Code integrated terminal (`Ctrl+\` ` or `Terminal > New Terminal`) and run `javac *.java` to compile all classes into bytecode.',
    },
    {
      step: 4,
      title: 'Run the Campus Navigator',
      command: 'java CampusNavigationSystem',
      details: 'Run `java CampusNavigationSystem` to launch the application and observe Dijkstra calculations and Hash Table searches in console output.',
    },
    {
      step: 5,
      title: 'Run with One-Click (VS Code Run Button)',
      command: 'Press F5 or click "Run Java" above main() in CampusNavigationSystem.java',
      details: 'VS Code Java extension provides an inline "Run | Debug" button directly above the `public static void main(String[] args)` method for instant execution with breakpoint debugging.',
    },
  ],
  launchJson: `{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "java",
      "name": "Launch CampusNavigationSystem",
      "request": "launch",
      "mainClass": "CampusNavigationSystem",
      "projectName": "CampusNavigator"
    }
  ]
}`,
};
