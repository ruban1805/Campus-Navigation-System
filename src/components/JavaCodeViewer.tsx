/**
 * JavaCodeViewer Component
 * Full Java Source Code Browser, Interactive Simulated JVM Console Runner,
 * and comprehensive VS Code Setup Guide.
 */

import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Download,
  Terminal,
  Play,
  FileCode,
  Laptop,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { JAVA_SOURCE_FILES, VSCODE_SETUP_INSTRUCTIONS } from '../data/javaSourceCode';

export const JavaCodeViewer: React.FC = () => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string>('');
  const [isRunningSim, setIsRunningSim] = useState(false);

  const currentFile = JAVA_SOURCE_FILES[selectedFileIndex];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([currentFile.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    JAVA_SOURCE_FILES.forEach(file => {
      const blob = new Blob([file.code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  // Run simulated Java console program in browser
  const handleRunJavaSimulation = () => {
    setIsRunningSim(true);
    setConsoleOutput('Compiling Java source files: javac *.java ...\n');

    setTimeout(() => {
      setConsoleOutput(prev => prev + 'Build Successful! Running: java CampusNavigationSystem ...\n\n');

      setTimeout(() => {
        const demoOutput = `==================================================
     SMART CAMPUS NAVIGATION SYSTEM (JAVA)        
==================================================
Data Structures Initialized:
 1. Graph (Adjacency List): 10 Vertices, 14 Weighted Edges
 2. LocationHashTable: Capacity=31, Load Factor=0.32
 3. MinPriorityQueue (Binary Min-Heap): Priority Ordering
 4. Dijkstra's Algorithm: Optimal Single-Source Solver
--------------------------------------------------

>>> TEST 1: Hash Table Instant O(1) Lookup:
Query: 'LIB-200'
Polynomial Hash Index: Bucket #18
Result Found: [LIB-200] Central University Library (library, Bldg Block L)

>>> TEST 2: Dijkstra Shortest Path Search:
From: 'Main Entrance (North Gate)' [gate]
To:   'Sports Arena & Gymnasium' [sports]
Mode: Standard Pedestrian Route

Processing MinPriorityQueue extraction sequence...
[Heap Dequeue] Node: 'gate' (dist: 0m)
[Heap Dequeue] Node: 'admin' (dist: 180m)
[Heap Dequeue] Node: 'library' (dist: 390m)
[Heap Dequeue] Node: 'cslab' (dist: 550m)
[Heap Dequeue] Node: 'aud' (dist: 760m)
[Heap Dequeue] Target Settled! Reconstructing path...

✓ Path Found!
Total Distance: 950 meters
Estimated Walking Time: 13 minutes (pace ~75m/min)

Step-by-Step Navigation Instructions:
  - Step 1: Walk 180m from Main Entrance (North Gate) to Admin & Admissions Block via walkway
  - Step 2: Walk 210m from Admin & Admissions Block to Central University Library via garden_path
  - Step 3: Walk 160m from Central University Library to Alan Turing CS & AI Labs via indoor_corridor
  - Step 4: Walk 210m from Alan Turing CS & AI Labs to University Auditorium via walkway
  - Step 5: Walk 190m from University Auditorium to Sports Arena & Gymnasium via walkway
  - Arrive at Sports Arena & Gymnasium.

==================================================
Process finished with exit code 0`;

        setConsoleOutput(prev => prev + demoOutput);
        setIsRunningSim(false);
      }, 600);
    }, 400);
  };

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-slate-800 bg-slate-900/95 p-4 sm:p-6 shadow-2xl backdrop-blur-md">
      {/* Header Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Java Implementation & Data Structures</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Clean, modular, beginner-friendly Java code ready to run in VS Code, IntelliJ IDEA, or Eclipse.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunJavaSimulation}
            disabled={isRunningSim}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow-sm disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>{isRunningSim ? 'Running...' : 'Run Java in Browser'}</span>
          </button>

          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download All (.java)</span>
          </button>
        </div>
      </div>

      {/* File Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {JAVA_SOURCE_FILES.map((file, idx) => (
          <button
            key={file.filename}
            onClick={() => setSelectedFileIndex(idx)}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-mono font-medium whitespace-nowrap transition-colors ${
              selectedFileIndex === idx
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileCode className="h-3 w-3" />
            <span>{file.filename}</span>
          </button>
        ))}
      </div>

      {/* Active File Meta Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-indigo-300 font-mono">
            {currentFile.filename}
          </span>
          <span className="text-[11px] text-slate-400">
            {currentFile.description} · <strong className="text-slate-300">{currentFile.dataStructureRole}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 hover:text-white transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>

          <button
            onClick={handleDownloadFile}
            className="flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 hover:text-white transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Save .java</span>
          </button>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="relative rounded-lg border border-slate-800 bg-slate-950 overflow-hidden font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-2 bg-slate-900/60 text-slate-400 text-[11px]">
          <span>Java 17+ Standard Source Code</span>
          <span>{currentFile.code.split('\n').length} lines</span>
        </div>
        <pre className="p-4 text-slate-200 overflow-x-auto leading-relaxed max-h-[440px] scrollbar-thin select-text">
          <code>{currentFile.code}</code>
        </pre>
      </div>

      {/* Simulated Console Output Terminal */}
      {consoleOutput && (
        <div className="flex flex-col rounded-lg border border-slate-800 bg-black font-mono text-xs overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 bg-slate-950 text-slate-400 text-[11px]">
            <div className="flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-emerald-400" />
              <span>JVM Console Output (Simulated Execution)</span>
            </div>
            <button
              onClick={() => setConsoleOutput('')}
              className="text-[10px] text-slate-500 hover:text-slate-300"
            >
              Clear Console
            </button>
          </div>
          <pre className="p-4 text-emerald-400 overflow-x-auto leading-relaxed max-h-72 scrollbar-thin">
            {consoleOutput}
          </pre>
        </div>
      )}
    </div>
  );
};
