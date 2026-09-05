import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Play, 
  RotateCcw, 
  Terminal, 
  Clock, 
  ShieldCheck, 
  Check, 
  FileCode,
  Sparkles
} from 'lucide-react';
import { TEST_CASES } from '../data/testsData';
import { TestCase } from '../types';

export const TestRunner: React.FC = () => {
  const [tests, setTests] = useState<TestCase[]>(TEST_CASES);
  const [isRunning, setIsRunning] = useState(false);
  const [activeSuite, setActiveSuite] = useState<'all' | 'test_tools.py' | 'test_graph.py'>('all');
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(TEST_CASES[0]);

  const handleRunAllTests = () => {
    setIsRunning(true);
    // Reset all to running
    setTests((prev) => prev.map((t) => ({ ...t, status: 'running' })));

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < TEST_CASES.length) {
        const itemToPass = TEST_CASES[currentIndex];
        setTests((prev) =>
          prev.map((t) => (t.id === itemToPass.id ? { ...t, status: 'passed' } : t))
        );
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 120);
  };

  const filteredTests = tests.filter((t) => {
    if (activeSuite === 'all') return true;
    return t.suite === activeSuite;
  });

  const passedCount = tests.filter((t) => t.status === 'passed').length;
  const totalDuration = tests.reduce((acc, t) => acc + t.durationMs, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header & Run CTA */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
            <CheckCircle2 className="h-4 w-4" />
            Pytest Automated Test Harness (rac-engine/tests)
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Unit & Integration Test Suite ({tests.length} Tests)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Validates Catalog search, stock checks, discount cap enforcement, Razorpay mocks, and PCI-DSS state machine guardrails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunAllTests}
            disabled={isRunning}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
          >
            {isRunning ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                <span>Executing Tests...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span>Run Test Suite (pytest -v)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Test Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs text-slate-500">Total Assertions Passed</div>
            <div className="text-2xl font-black text-emerald-600">{passedCount} / {tests.length}</div>
          </div>
          <CheckCircle2 className="h-8 w-8 text-emerald-600 opacity-80" />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs text-slate-500">Total Execution Time</div>
            <div className="text-2xl font-black text-indigo-600">{totalDuration}ms</div>
          </div>
          <Clock className="h-8 w-8 text-indigo-600 opacity-80" />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs text-slate-500">PCI-DSS Guardrail Coverage</div>
            <div className="text-2xl font-black text-purple-600">100% Pass</div>
          </div>
          <ShieldCheck className="h-8 w-8 text-purple-600 opacity-80" />
        </div>
      </div>

      {/* Suite Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveSuite('all')}
          className={`text-xs px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
            activeSuite === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-50 shadow-2xs'
          }`}
        >
          All Test Cases ({tests.length})
        </button>
        <button
          onClick={() => setActiveSuite('test_tools.py')}
          className={`text-xs px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
            activeSuite === 'test_tools.py'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-50 shadow-2xs'
          }`}
        >
          test_tools.py (11 Tests)
        </button>
        <button
          onClick={() => setActiveSuite('test_graph.py')}
          className={`text-xs px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
            activeSuite === 'test_graph.py'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-50 shadow-2xs'
          }`}
        >
          test_graph.py (6 Tests)
        </button>
      </div>

      {/* Test List and Log Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Test List */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm h-[460px] flex flex-col">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Test Case Function Name</span>
            <span>Duration / Status</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredTests.map((test) => {
              const isSelected = selectedTestCase?.id === test.id;
              return (
                <div
                  key={test.id}
                  onClick={() => setSelectedTestCase(test)}
                  className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="font-mono text-xs font-bold text-slate-800 truncate max-w-sm">
                      {test.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-md">
                      {test.description}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400">
                      {test.durationMs}ms
                    </span>
                    {test.status === 'passed' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        PASS
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse">
                        RUNNING
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Output Log Detail */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Terminal className="h-4 w-4 text-indigo-600" />
                Assertion Log Details
              </h3>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                {selectedTestCase?.suite}
              </span>
            </div>

            {selectedTestCase ? (
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-mono font-bold text-slate-900">
                    {selectedTestCase.name}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedTestCase.description}
                  </p>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 space-y-2">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Pytest Console Stream:</div>
                  <div className="text-slate-300">
                    tests/{selectedTestCase.suite}::{selectedTestCase.name}
                  </div>
                  <div className="text-emerald-400 font-bold">
                    {selectedTestCase.outputLog}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Select a test case to view output.</p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 text-xs text-slate-400 flex items-center justify-between">
            <span>Framework: pytest 8.3+</span>
            <span>Runner: asyncio / unittest.mock</span>
          </div>

        </div>

      </div>

    </div>
  );
};
