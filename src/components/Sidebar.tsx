import React from 'react';
import { 
  LayoutDashboard, 
  Cpu, 
  CreditCard, 
  MessageSquare, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Users, 
  Radio, 
  TrendingUp, 
  AlertCircle 
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onAddNewSim: () => void;
  outstandingCount: number;
}

export default function Sidebar({ currentTab, setCurrentTab, onAddNewSim, outstandingCount }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'sims', name: 'SIM Subscriptions', icon: Cpu, badge: 0 },
    { id: 'billing', name: 'Billing & Collections', icon: CreditCard, badge: outstandingCount },
    { id: 'whatsapp', name: 'WhatsApp Automation', icon: MessageSquare },
    { id: 'settings', name: 'System Settings', icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-70 bg-slate-900 text-slate-100 flex flex-col py-6 px-4 border-r border-slate-800 z-40">
      {/* Brand logo */}
      <div className="mb-8 px-2">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 text-slate-950 p-2 rounded-lg font-bold flex items-center justify-center">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-lg leading-tight tracking-tight text-white">IoT Connect</h1>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">SIM & Fleet PRD Platform</p>
          </div>
        </div>
      </div>

      {/* Nav Link List */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 ? (
                <span className="bg-rose-500/10 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-500/20">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Account Info and Action */}
      <div className="mt-auto pt-6 border-t border-slate-800 space-y-4">
        <button
          onClick={onAddNewSim}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/10 text-sm"
        >
          <span>+ Add New SIM</span>
        </button>

        <div className="pt-2">
          {/* Support and System Health Indicator */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-3 text-xs text-slate-400 mb-4">
            <div className="flex items-center justify-between mb-1.5 font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Automated Sync Code</span>
              </span>
              <span className="font-mono text-[9px] text-emerald-400">ONLINE</span>
            </div>
            <p className="text-[10px] leading-relaxed">WhatsApp API and Midtrans live mocks are fully configured & functional.</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-3 px-3 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Simulated PRD Sandbox</span>
            </div>
            <div 
              onClick={() => alert("Simulation session started. App is running entirely offline via Reactive Local State Engine.")}
              className="flex items-center gap-3 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span>Reset State Sandbox</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
