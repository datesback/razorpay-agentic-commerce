import React, { useState } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { DemoVideoStudio } from './components/DemoVideoStudio';
import { ChatSimulator } from './components/ChatSimulator';
import { ArchitectureView } from './components/ArchitectureView';
import { CatalogBrowser } from './components/CatalogBrowser';
import { TestRunner } from './components/TestRunner';
import { RepoExplorer } from './components/RepoExplorer';
import { DocumentationView } from './components/DocumentationView';
import { Product } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('demo');

  const handleSelectItemForChat = (product: Product) => {
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        status="LangGraph Live"
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {activeTab === 'demo' && <DemoVideoStudio />}
        {activeTab === 'chat' && <ChatSimulator />}
        {activeTab === 'architecture' && <ArchitectureView />}
        {activeTab === 'catalog' && (
          <CatalogBrowser onSelectItemForChat={handleSelectItemForChat} />
        )}
        {activeTab === 'tests' && <TestRunner />}
        {activeTab === 'repo' && <RepoExplorer />}
        {activeTab === 'docs' && <DocumentationView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-slate-700">Razorpay Agentic Commerce Engine (RAC Engine)</span>
            <span className="text-slate-400">• v1.0.0</span>
          </div>
          <div className="text-slate-500">
            Tech Stack: Python 3.11+ • FastAPI • LangGraph • SQLite • Razorpay SDK • Redis • Docker
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
