import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Shield, 
  Sparkles, 
  Database, 
  DollarSign, 
  Percent, 
  TrendingUp, 
  ShieldAlert, 
  Sliders, 
  Check, 
  CheckCircle,
  HelpCircle,
  Zap,
  Briefcase
} from 'lucide-react';

interface SettingsViewProps {
  currentRole: 'Owner' | 'Admin Staff' | 'Finance Team';
  onChangeRole: (role: 'Owner' | 'Admin Staff' | 'Finance Team') => void;
  priceIncreasePct: number;
  onUpdatePriceIncrease: (pct: number) => void;
  gracePeriodDays: number;
  onUpdateGracePeriod: (days: number) => void;
}

export default function SettingsView({
  currentRole,
  onChangeRole,
  priceIncreasePct,
  onUpdatePriceIncrease,
  gracePeriodDays,
  onUpdateGracePeriod
}: SettingsViewProps) {
  
  // Local states for mock options
  const [midtransClientKey, setMidtransClientKey] = useState('SB-Mid-client-k7291845vjYeq92p');
  const [midtransServerKey, setMidtransClientSecret] = useState('SB-Mid-server-x815049385vbaOp91s');
  const [isSaved, setIsSaved] = useState(false);

  // Scoring weight parameters
  const [disruptionWeight, setDisruptionWeight] = useState(30);
  const [paymentDaysLimit, setPaymentDaysLimit] = useState(7);

  const handleSaveConfigs = () => {
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Title block */}
      <div>
        <h2 className="text-xl font-bold font-sans text-slate-150 text-slate-950">System Configurations &amp; Sandbox Roleplay</h2>
        <p className="text-xs text-slate-500 mt-1">Configure automated rules, credit scoring metrics, and toggle security roles to test PRD permissions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Dynamic Parameters (Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* USERS & ROLES SIMULATOR */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900">Users &amp; Roles Simulator</h3>
            </div>
            
            <p className="text-xs text-slate-500 leading-normal">
              Test dynamic workspace views from different employee layers as defined in the PRD scope. Toggle back and forth instantly to experience different dashboard controls.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { name: 'Owner', role: 'Owner' as const, desc: 'Full root access to forecasting, custom billing releases and settings panel.' },
                { name: 'Admin Staff', role: 'Admin Staff' as const, desc: 'SIM additions, profile changes, and manual billing releases only.' },
                { name: 'Finance Team', role: 'Finance Team' as const, desc: 'View revenue graphs, collect aging debts and trigger manual reminders.' }
              ].map((roleObj) => {
                const isSelected = currentRole === roleObj.role;
                return (
                  <button
                    key={roleObj.role}
                    type="button"
                    onClick={() => {
                      onChangeRole(roleObj.role);
                      alert(`Switched workspace sandbox session permission role to: ${roleObj.role}`);
                    }}
                    className={`p-4 border text-left rounded-2xl transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 justify-between">
                      <span className="text-xs font-bold font-sans">{roleObj.name}</span>
                      {isSelected && <span className="bg-emerald-500 text-slate-950 font-black text-[8px] font-mono px-1.5 py-0.5 rounded">ONLINE</span>}
                    </div>
                    <p className={`text-[10px] mt-2 block leading-relaxed ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {roleObj.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AUTOMATED WORKFLOW PARAMETERS (SIM Suspension & Price Increase) */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-500 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-900">Auto Pricing &amp; Carrier Suspension Rules</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Factor 1: Grace period suspension */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-700 font-bold font-mono">
                  <span>Grace Period Days:</span>
                  <span className="text-rose-600">{gracePeriodDays} Days Grace</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={gracePeriodDays}
                  onChange={(e) => onUpdateGracePeriod(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
                />
                <p className="text-[10px] text-slate-400 font-mono leading-relaxed mt-1">
                  Once aging arrears exceed this day margin, carrier suspension webhook triggers instantly to put device offline.
                </p>
              </div>

              {/* Factor 2: Dynamic price adjustment */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-700 font-bold font-mono">
                  <span>Automated Price Increase Margin:</span>
                  <span className="text-emerald-600">+{priceIncreasePct}% Increase</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={priceIncreasePct}
                  onChange={(e) => onUpdatePriceIncrease(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
                />
                <p className="text-[10px] text-slate-400 font-mono leading-relaxed mt-1">
                  Default price shift multiplier applies to aging subscriptions on auto-renewal.
                </p>
              </div>

            </div>
          </div>

          {/* PAYMENT BEHAVIOR SCORING METRICS */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4 text-left">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900">Payment Behavior Scoring Model</h3>
            </div>

            <p className="text-xs text-slate-500 leading-normal">
              IoT Connect assesses credit intelligence on enterprise fleet owners based on timely payments. Toggle weights parameters used by the engine:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 font-bold block uppercase">Disruption deduction weight</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={disruptionWeight}
                    onChange={(e) => setDisruptionWeight(Number(e.target.value))}
                    className="w-20 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-900"
                  />
                  <span className="text-[11px] text-slate-400 self-center">Points deducted per billing skip.</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 font-bold block uppercase">Maximum Overdue Limit Days</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={paymentDaysLimit}
                    onChange={(e) => setPaymentDaysLimit(Number(e.target.value))}
                    className="w-20 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-900"
                  />
                  <span className="text-[11px] text-slate-400 self-center">Limit days before profile scores turn "High-Risk"</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Security keys sandbox config (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* credentials configuration */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-300 text-left space-y-4 shadow-xl">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Credentials Authorization</h3>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-slate-400 block font-bold">Midtrans Sandkey Client</label>
                <input
                  type="text"
                  value={midtransClientKey}
                  onChange={(e) => setMidtransClientKey(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-slate-400 block font-bold">Midtrans Server Security</label>
                <input
                  type="password"
                  value={midtransServerKey}
                  onChange={(e) => setMidtransClientSecret(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl text-xs font-mono text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveConfigs}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-xl text-xs transition-all active:scale-95 text-center flex items-center justify-center gap-1 cursor-pointer"
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Keys Saved Successfully</span>
                  </>
                ) : (
                  <span>Apply Sandbox Secrets</span>
                )}
              </button>
            </div>
          </div>

          {/* Quick FAQ summary box */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 text-left shadow-sm">
            <div className="flex items-center gap-1.5 mb-2 text-indigo-950 font-bold text-xs">
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              <span>Diagnostic Sandbox FAQ</span>
            </div>
            
            <div className="space-y-3 text-[11px] text-slate-500 leading-normal">
              <div>
                <p className="font-bold text-slate-800">Has Midtrans webhooks automatic release been verified?</p>
                <p className="mt-0.5">Yes! Use the simulated Midtrans Payment gate inside standard Billing tab. Direct payment triggers release event.</p>
              </div>
              <div className="w-full h-px bg-slate-100 my-1"></div>
              <div>
                <p className="font-bold text-slate-800">Who maps E.164 preview details?</p>
                <p className="mt-0.5">WhatsApp sequences read real-time properties from your current SIM table dataset mapping instantly.</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
