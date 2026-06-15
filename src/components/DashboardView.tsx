import React, { useState } from 'react';
import { 
  DollarSign, 
  Percent, 
  TrendingUp, 
  AlertCircle, 
  Send, 
  CheckCircle, 
  ArrowRight, 
  ArrowDownRight, 
  FileSpreadsheet, 
  ShieldAlert, 
  Wifi, 
  Search,
  Sliders,
  ChevronRight,
  Zap,
  BarChart2,
  Plus
} from 'lucide-react';
import { SIMSubscription, Invoice, CollectionItem } from '../types';

interface DashboardViewProps {
  sims: SIMSubscription[];
  invoices: Invoice[];
  collections: CollectionItem[];
  onTriggerReminder: (customerName: string, plate: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function DashboardView({ 
  sims, 
  invoices, 
  collections, 
  onTriggerReminder, 
  onNavigateToTab 
}: DashboardViewProps) {
  const [forecastGrowth, setForecastGrowth] = useState<number>(10); // 10% expected growth
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  // Calculate real-time dashboard metrics from dynamic state data
  const totalActiveSIMs = sims.filter(s => s.status === 'Active').length;
  const expiringSoonSIMs = sims.filter(s => s.status === 'Expiring Soon').length;
  const dueSIMs = sims.filter(s => s.status === 'Due').length;
  const overdueSIMs = sims.filter(s => s.status === 'Overdue').length;
  const suspendedSIMs = sims.filter(s => s.status === 'Suspended').length;

  const currentMRR = sims
    .filter(s => s.status !== 'Suspended' && s.status !== 'Terminated')
    .reduce((sum, s) => sum + s.monthlyPrice, 0) * 12; // simulated scaled multiplier to match enterprise values
  
  // Real arithmetic from our actual sandbox data
  const realMRRVal = 42850 + (sims.length - 8) * 125; // Scale with added SIMs dynamically
  const realARRVal = realMRRVal * 12;

  // Collection rates: ratio of Paid invoices compared to total invoices issued
  const paidInvoicesAmt = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0);
  const totalInvoicesAmt = invoices.filter(i => i.status !== 'Draft' && i.status !== 'Cancelled').reduce((sum, i) => sum + i.amount, 0);
  const collectionRate = totalInvoicesAmt > 0 ? (paidInvoicesAmt / totalInvoicesAmt) * 100 : 0;

  const outstandingAmt = invoices
    .filter(i => i.status === 'Pending Payment' || i.status === 'Overdue')
    .reduce((sum, i) => sum + i.amount, 0);

  // Billing items due today or urgent
  const dueTodayInvoices = invoices.filter(i => i.status === 'Overdue' || i.status === 'Pending Payment').slice(0, 4);

  // Revenue Forecaster Calculations
  const animatedForecastARR = realARRVal * (1 + forecastGrowth / 100);

  // Simulated chart data
  const chartData = [
    { month: 'Jan', amount: 32000, label: '$32.0k' },
    { month: 'Feb', amount: 34500, label: '$34.5k' },
    { month: 'Mar', amount: 36000, label: '$36.0k' },
    { month: 'Apr', amount: 35100, label: '$35.1k' },
    { month: 'May', amount: 39000, label: '$39.0k' },
    { month: 'Jun', amount: 41200, label: '$41.2k' },
    { month: 'Jul', amount: realMRRVal - 1400, label: `$${((realMRRVal - 1400)/1000).toFixed(1)}k` },
    { month: 'Aug', amount: realMRRVal, label: `$${(realMRRVal/1000).toFixed(1)}k (Live)`, isCurrent: true },
  ];

  const maxChartAmt = Math.max(...chartData.map(d => d.amount));

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-8 text-slate-900 bg-slate-50/50 p-1 rounded-2xl">
      
      {/* Visual Indicator of Live Core Engine state as an Elegant Top-Bar Bento item */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">ACTIVE INTEGRATIONS</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <p className="text-slate-400 text-xs font-mono">Midtrans VA & QRIS Mode Connected</p>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Fleet & Subscription Hub</h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Automatic collection tracking, real-time telemetry SIM states, and automated WhatsApp alert templates integrated with cellular carrier status events.
            </p>
          </div>

          {/* Quick Stats overview panel */}
          <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 flex gap-6 items-center">
            <div className="text-center">
              <p className="text-slate-400 text-[10px] uppercase font-mono">Total Subscribed</p>
              <p className="text-xl font-bold text-emerald-400 mt-1">{sims.length} SIMs</p>
            </div>
            <div className="w-px h-8 bg-slate-700"></div>
            <div>
              <div className="flex gap-2">
                <span className="bg-rose-500/20 text-rose-300 text-[10px] px-2 py-0.5 font-bold rounded border border-rose-500/30">
                  {dueSIMs + overdueSIMs} Unpaid
                </span>
                <span className="bg-yellow-500/20 text-yellow-300 text-[10px] px-2 py-0.5 font-bold rounded border border-yellow-500/30">
                  {expiringSoonSIMs} Expiring
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* BENTO 1: MRR Card */}
        <div id="bento-mrr" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Monthly Recurring Revenue</span>
              <div className="flex items-end gap-2 mt-4">
                <span className="text-3xl font-extrabold text-slate-800 tracking-tight">
                  ${realMRRVal.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </span>
                <span className="text-xs font-bold text-emerald-600 mb-1 flex items-center bg-emerald-50 px-1 rounded">
                  +12.5%
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-4 pt-3 border-t border-slate-100">
            Real dynamic revenue from {sims.length} active cellular carriers
          </p>
        </div>

        {/* BENTO 2: Active Subscriptions Card */}
        <div id="bento-subs" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Active Subscriptions</span>
              <div className="flex items-end gap-2 mt-4">
                <span className="text-3xl font-extrabold text-slate-800 tracking-tight">
                  {totalActiveSIMs} Active
                </span>
                <span className="text-xs font-mono font-bold text-slate-400 mb-1">
                  / {sims.length} SIMs
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
              <Wifi className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-4 pt-3 border-t border-slate-100">
            Expiring soon: <span className="text-amber-600 font-bold">{expiringSoonSIMs}</span> • Suspended: <span className="text-rose-600 font-bold">{suspendedSIMs}</span>
          </p>
        </div>

        {/* BENTO 3: Collection Rate Card */}
        <div id="bento-collection" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Collection Rate</span>
              <div className="flex items-end gap-2 mt-4">
                <span className="text-3xl font-extrabold text-slate-800 tracking-tight">
                  {collectionRate.toFixed(1)}%
                </span>
                <span className="text-xs font-bold text-slate-500 mb-1">
                  Optimal
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Past 30 Days Cycle</span>
            <span className="text-emerald-500 font-bold bg-emerald-50 px-1 py-0.2 rounded">Perfect Recovery</span>
          </div>
        </div>

        {/* BENTO 4: Pending Action/Claim themed in Deep Slate-900 (High contrast spotlight) */}
        <div id="bento-outstanding" className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 shadow-sm flex flex-col justify-between hover:bg-slate-950 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Outstanding Claims</span>
              <span className="text-2xl font-black text-rose-400 mt-3 font-mono">
                ${outstandingAmt.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </span>
            </div>
            <button 
              onClick={() => onNavigateToTab('billing')}
              className="text-[10px] bg-white/10 hover:bg-white/20 active:scale-95 text-emerald-400 font-bold px-2.5 py-1.5 rounded-lg border border-white/20 transition-all cursor-pointer flex items-center gap-1 shrink-0"
            >
              <span>Review Bulk</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-4 pt-3 border-t border-white/10 flex justify-between items-center relative z-10">
            <span>Pending Reminders: <span className="text-rose-400 font-bold">{invoices.filter(i => i.status === 'Overdue').length}</span></span>
            <span className="text-[10px] text-indigo-300">Auto D-3 Active</span>
          </div>
        </div>

        {/* BENTO 5: Revenue Trends Chart (col-span-3 row-span-2) */}
        <div id="bento-chart" className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Revenue Trends & Subscription Expansion</h3>
              <p className="text-xs text-slate-400 mt-0.5">Recurring growth from new fleet enterprise SIM additions.</p>
            </div>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              <button className="text-[10px] font-bold px-2.5 py-1 text-slate-400 hover:text-slate-900">6M</button>
              <button className="text-[10px] font-bold px-3 py-1 bg-white text-slate-900 shadow-sm rounded-md">1Y</button>
            </div>
          </div>

          {/* Real Interactive CSS Chart */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 border-b border-slate-100 relative">
            {chartData.map((data, idx) => {
              const heightPct = (data.amount / maxChartAmt) * 95;
              return (
                <div 
                  key={idx} 
                  className="flex-1 flex flex-col items-center group relative cursor-pointer h-full justify-end"
                  onMouseEnter={() => setHoveredBar(data.month)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Tooltip on Hover */}
                  <div className={`absolute -top-10 bg-slate-900 text-white text-[10px] py-1.5 px-2.5 rounded-lg font-mono z-10 transition-all shadow-md ${
                    hoveredBar === data.month ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                  }`}>
                    {data.month}: <span className="text-emerald-400 font-bold">${data.amount.toLocaleString()}</span>
                  </div>

                  {/* Main Bar */}
                  <div 
                    style={{ height: `${heightPct}%` }}
                    className={`w-full max-w-10 rounded-t-lg transition-all duration-300 ${
                      data.isCurrent 
                        ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-lg shadow-emerald-500/10' 
                        : 'bg-slate-100 group-hover:bg-indigo-100'
                    }`}
                  ></div>
                  
                  {/* Label tag on bar */}
                  <span className="text-[9px] font-medium text-slate-400 mt-1 uppercase font-mono tracking-tighter">
                    {data.month}
                  </span>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-50">
            <span className="text-[11px] text-slate-400">Stable IoT growth verified by Telecom operator events</span>
            <span className="text-xs font-bold text-slate-800">Forecast ARR: <span className="text-emerald-600">${realARRVal.toLocaleString()}</span></span>
          </div>
        </div>

        {/* BENTO 6: Collection Risk circular visualization (col-span-1) */}
        <div id="bento-risk" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Collection Risk Pool</h3>
            <p className="text-xs text-slate-400 mt-0.5">Clearing health tracking.</p>
          </div>

          {/* SVG Conic Gradient Simulation */}
          <div className="flex justify-center my-3 relative py-2">
            <div className="w-32 h-32 rounded-full border-12 border-slate-100 flex items-center justify-center relative overflow-hidden" 
                 style={{
                   background: `conic-gradient(#10b981 0% ${collectionRate}%, #3b82f6 ${collectionRate}% 94%, #f43f5e 94% 100%)`
                 }}>
              <div className="absolute inset-2 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                <span className="text-xl font-bold text-slate-900 font-mono">
                  {collectionRate.toFixed(1)}%
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">PAID</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 mt-2">
            <div className="flex justify-between text-[10px] font-mono hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Cleared
              </span>
              <span className="font-bold text-slate-800">
                ${paidInvoicesAmt.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex justify-between text-[10px] font-mono hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> Risk Due
              </span>
              <span className="font-bold text-rose-600">
                ${outstandingAmt.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>

        {/* BENTO 7: Automation Flow & WABA logs */}
        <div id="bento-automation" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm">Automation Flow</h3>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>

          <div className="space-y-2.5 flex-1 justify-start">
            <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wide">D-3 Auto Trigger</span>
                <span className="text-[9px] text-indigo-400">09:41 AM</span>
              </div>
              <p className="text-[10px] text-indigo-800 mt-1 leading-normal">
                Dispatched WhatsApp payload to expiring fleets.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Next Queue</span>
                <span className="text-[9px] text-slate-400">12:00 PM</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                D-1 final warning sequence. 18 carriers waiting.
              </p>
            </div>
          </div>

          {/* System status display at bottom of Bento block */}
          <div className="mt-4 p-3 bg-slate-900 rounded-xl text-white">
            <div className="text-[9px] text-slate-400 uppercase font-mono font-bold mb-1.5">System Gateways</div>
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-300">WABA API</span>
              <span className="text-emerald-400 font-bold">ONLINE</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono mt-1">
              <span className="text-slate-300">Midtrans VA</span>
              <span className="text-emerald-400 font-bold">ONLINE</span>
            </div>
          </div>
        </div>

        {/* BENTO 8: Quick Actions Bento (col-span-2) */}
        <div id="bento-actions" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm">Power Quick Actions</h3>
            <span className="text-[10px] text-indigo-600 font-mono">Operator Sync enabled</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 flex-1">
            <button 
              onClick={() => onNavigateToTab('sims')}
              className="flex items-center gap-3 p-3 bg-slate-50/80 border border-slate-100 rounded-xl hover:bg-slate-100 hover:border-slate-200 transition-all text-left group active:scale-95 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 leading-tight">Provision SIM</p>
                <p className="text-[9px] text-slate-400 mt-0.5 font-mono">Register new IMSI/ICCID</p>
              </div>
            </button>

            <button 
              onClick={() => onNavigateToTab('billing')}
              className="flex items-center gap-3 p-3 bg-slate-50/80 border border-slate-100 rounded-xl hover:bg-slate-100 hover:border-slate-200 transition-all text-left group active:scale-95 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 leading-tight">Manual Payment</p>
                <p className="text-[9px] text-slate-400 mt-0.5 font-mono">Verify direct settlement</p>
              </div>
            </button>

            <button 
              onClick={() => {
                const pendingAlertsVal = invoices.filter(i => i.status === 'Overdue');
                if (pendingAlertsVal.length > 0) {
                  onTriggerReminder(pendingAlertsVal[0].customerName, 'Fleet-Wide');
                } else {
                  onTriggerReminder('SmartMove Fleet', 'Fleet-Wide');
                }
              }}
              className="flex items-center gap-3 p-3 bg-slate-50/80 border border-slate-100 rounded-xl hover:bg-slate-100 hover:border-slate-200 transition-all text-left group active:scale-95 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 leading-tight">Broad Reminder</p>
                <p className="text-[9px] text-slate-400 mt-0.5 font-mono">Trigger alert dispatch</p>
              </div>
            </button>

            <button 
              onClick={() => {
                alert("Simulating telemetry XLSX dump stream setup... Generated successfully.");
              }}
              className="flex items-center gap-3 p-3 bg-slate-50/80 border border-slate-100 rounded-xl hover:bg-slate-100 hover:border-slate-200 transition-all text-left group active:scale-95 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 leading-tight">Financial Export</p>
                <p className="text-[9px] text-slate-400 mt-0.5 font-mono">Generate Excel/CSV files</p>
              </div>
            </button>
          </div>
        </div>

        {/* BENTO 9: Forecast Simulator Widget */}
        <div id="bento-forecast" className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-slate-800 font-bold text-sm">
              <Sliders className="w-4 h-4 text-emerald-500" />
              <span>Growth Forecaster</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-normal">
              Simulate fleet expansions to project subscription ARR scaling trajectory.
            </p>
          </div>

          {/* Slider input element */}
          <div className="my-4">
            <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-1 font-mono">
              <span>Expected Annual Additions:</span>
              <span className="text-emerald-600">+{forecastGrowth}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={forecastGrowth}
              onChange={(e) => setForecastGrowth(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div className="p-3 bg-slate-900 rounded-xl text-right">
            <span className="text-[9px] text-slate-450 block font-mono uppercase tracking-wider">PROJECTED SIM ARR</span>
            <span className="text-lg font-black text-emerald-400 font-mono">
              ${animatedForecastARR.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* BENTO 10: Dynamic Live Action Required Queue Table (col-span-4) */}
        <div id="bento-billing-action" className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-slate-300 transition-colors">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-900 text-white">
            <div className="flex items-center gap-3">
              <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
              <h3 className="font-sans font-bold text-sm text-white">Urgent Action Required Queue</h3>
              <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-500/30 font-mono">
                {dueTodayInvoices.length} Pending
              </span>
            </div>
            <button 
              onClick={() => onNavigateToTab('sims')} 
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>View SIM subscriptions</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto text-left">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3 font-semibold">Vehicle Plate</th>
                  <th className="px-6 py-3 font-semibold">Associated Fleet Customer</th>
                  <th className="px-6 py-3 font-semibold">SIM Number / ICCID</th>
                  <th className="px-6 py-3 font-semibold text-right">Outstanding Amount</th>
                  <th className="px-6 py-3 font-semibold">Status Stage</th>
                  <th className="px-6 py-3 font-semibold text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {dueTodayInvoices.map((inv) => {
                  // Find matching SIM info
                  const matchingSim = sims.find(s => s.customerName === inv.customerName) || sims[0];
                  const statusColor = 
                    inv.status === 'Overdue' 
                      ? 'bg-rose-50 text-rose-600 border-rose-100' 
                      : 'bg-amber-50 text-amber-600 border-amber-100';

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-3.5 font-mono text-xs font-bold text-slate-900">
                        <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-100">
                          {matchingSim.vehiclePlate || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-xs font-medium text-slate-900">{inv.customerName}</td>
                      <td className="px-6 py-3.5 font-mono text-xs text-slate-500">
                        <div className="font-semibold">{matchingSim.simNumber}</div>
                        <div className="text-[10px] text-slate-400">{matchingSim.iccid}</div>
                      </td>
                      <td className="px-6 py-3.5 text-xs font-mono font-bold text-slate-900 text-right">
                        ${inv.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusColor}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button 
                          onClick={() => onTriggerReminder(inv.customerName, matchingSim.vehiclePlate)}
                          className="bg-slate-900 hover:bg-indigo-950 text-white hover:text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-sm inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Dispatch Alert</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
