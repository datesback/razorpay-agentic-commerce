import React from 'react';
import { 
  MessageSquare, 
  Workflow, 
  ShoppingBag, 
  CheckCircle2, 
  FolderTree, 
  BookOpen, 
  Zap,
  Video
} from 'lucide-react';

export type ActiveTab = 'demo' | 'chat' | 'architecture' | 'catalog' | 'tests' | 'repo' | 'docs';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  status: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab, status }) => {
  const tabs = [
    { id: 'demo', label: '5-Min Demo Video', icon: Video, badge: 'Voice' },
    { id: 'chat', label: 'In-Chat Engine', icon: MessageSquare, badge: status },
    { id: 'architecture', label: 'State Machine', icon: Workflow },
    { id: 'catalog', label: 'D2C Catalog (15)', icon: ShoppingBag },
    { id: 'tests', label: 'Test Suite (17)', icon: CheckCircle2, badge: 'Pass' },
    { id: 'repo', label: 'Repository', icon: FolderTree },
    { id: 'docs', label: 'Submission Dossier', icon: BookOpen },
  ];

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & Project Identity */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-xs text-white font-bold text-lg">
              <div className="w-4 h-4 border-2 border-white rotate-45 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-xs"></div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                  RAC-Engine
                </span>
                <span className="font-normal text-slate-400 text-xs sm:text-sm">v1.0</span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Agentic Commerce
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal hidden sm:block">
                LangGraph State Machine + In-Chat Razorpay Checkout
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden lg:flex items-center space-x-1">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onSelectTab(t.id as ActiveTab)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{t.label}</span>
                  {t.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {t.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Info Badges */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-semibold tracking-wider">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              <span className="hidden sm:inline">Razorpay Connected</span>
              <span className="sm:hidden">Razorpay</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-semibold tracking-wider">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              <span>Agent Active</span>
            </div>
          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 scrollbar-none border-t border-slate-100">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onSelectTab(t.id as ActiveTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
