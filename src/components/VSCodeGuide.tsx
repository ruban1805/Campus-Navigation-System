/**
 * VSCodeGuide Component
 * Step-by-step beginner-friendly guide to setting up and executing the Java project
 * in Visual Studio Code.
 */

import React, { useState } from 'react';
import {
  Laptop,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  BookOpen,
  Play,
  Bug,
  FolderGit2,
} from 'lucide-react';
import { VSCODE_SETUP_INSTRUCTIONS } from '../data/javaSourceCode';

export const VSCodeGuide: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedLaunch, setCopiedLaunch] = useState(false);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyLaunchJson = () => {
    navigator.clipboard.writeText(VSCODE_SETUP_INSTRUCTIONS.launchJson);
    setCopiedLaunch(true);
    setTimeout(() => setCopiedLaunch(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-slate-800 bg-slate-900/95 p-4 sm:p-6 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Laptop className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">VS Code Project Setup & Execution Guide</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Complete beginner-friendly instructions to clone, compile, and run the Smart Campus Navigation Java project on your local machine.
        </p>
      </div>

      {/* Prerequisites Strip */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
          Step 0: Prerequisites Checklist
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {VSCODE_SETUP_INSTRUCTIONS.prerequisites.map((req, idx) => (
            <div
              key={idx}
              className="flex flex-col rounded-lg border border-slate-800 bg-slate-950 p-3.5"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>{req.title}</span>
              </div>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                {req.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Step by Step Execution Guide */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
          Execution Walkthrough (Terminal & GUI)
        </h3>

        <div className="space-y-3.5">
          {VSCODE_SETUP_INSTRUCTIONS.steps.map((step, idx) => (
            <div
              key={step.step}
              className="flex flex-col rounded-xl border border-slate-800 bg-slate-950 p-4 transition-all hover:border-slate-700"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-900/60 border border-indigo-700/50 text-xs font-mono font-bold text-indigo-300">
                    {step.step}
                  </span>
                  <h4 className="text-sm font-bold text-white">{step.title}</h4>
                </div>
              </div>

              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                {step.details}
              </p>

              {step.command && (
                <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-800 bg-black/80 px-3 py-2 font-mono text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 overflow-x-auto pr-2">
                    <Terminal className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <span>{step.command}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(step.command, idx)}
                    className="flex items-center gap-1 text-[11px] font-sans font-medium text-slate-400 hover:text-white shrink-0 ml-2"
                  >
                    {copiedIndex === idx ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Optional: launch.json Configuration */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="h-4 w-4 text-indigo-400" />
            <h4 className="text-xs font-bold text-white">
              Optional: .vscode/launch.json (For F5 Breakpoint Debugging)
            </h4>
          </div>
          <button
            onClick={handleCopyLaunchJson}
            className="flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:text-white"
          >
            {copiedLaunch ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>{copiedLaunch ? 'Copied' : 'Copy launch.json'}</span>
          </button>
        </div>
        <pre className="rounded-lg border border-slate-800/80 bg-black/70 p-3 font-mono text-xs text-slate-300 overflow-x-auto">
          <code>{VSCODE_SETUP_INSTRUCTIONS.launchJson}</code>
        </pre>
      </div>
    </div>
  );
};
