import React, { useState } from 'react';
import { 
  MessageSquare, 
  Settings, 
  Send, 
  Save, 
  History, 
  Check, 
  CheckCircle, 
  Volume2, 
  Smartphone, 
  User, 
  Database,
  ArrowRight,
  Eye,
  Sliders,
  Play,
  FileText,
  Clock,
  Sparkles,
  RefreshCw,
  Zap,
  HelpCircle,
  ShieldCheck,
  X
} from 'lucide-react';
import { WhatsAppTemplate, WhatsAppLog, SIMSubscription } from '../types';

interface WhatsAppViewProps {
  templates: WhatsAppTemplate[];
  logs: WhatsAppLog[];
  sims: SIMSubscription[];
  onUpdateTemplate: (updatedTemplate: WhatsAppTemplate) => void;
  onDispatchCampaign: (campaignName: string, templateId: string, operatorFilter: string) => void;
  onClearLogs: () => void;
}

export default function WhatsAppView({ 
  templates, 
  logs, 
  sims, 
  onUpdateTemplate, 
  onDispatchCampaign,
  onClearLogs
}: WhatsAppViewProps) {
  // Configured WhatsApp API tokens
  const [apiEndpoint, setApiEndpoint] = useState('https://api.iotconnect.io/v1/whatsapp');
  const [bearerToken, setBearerToken] = useState('Bearer waba_live_prod_secret_8429184591aef');
  const [testNumber, setTestNumber] = useState('+62 811-1234-567');
  
  // Custom template active preview selector
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  const [selectedSimPreviewId, setSelectedSimPreviewId] = useState<string>(sims[0]?.id || '');

  // Campaign builder state
  const [campaignTitle, setCampaignTitle] = useState('Q3 Fleet Renewal Blitz');
  const [campaignTemplateId, setCampaignTemplateId] = useState(templates[0]?.id || '');
  const [campaignOperator, setCampaignOperator] = useState('ALL');
  const [isCampaignRunning, setIsCampaignRunning] = useState(false);
  const [campaignProgress, setCampaignProgress] = useState(0);

  // Template editor modal
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);

  // Calculate live preview translation code
  const currentTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];
  const currentSim = sims.find(s => s.id === selectedSimPreviewId) || sims[0];

  const getSubstitutedMessage = (body: string) => {
    if (!body || !currentSim) return body;
    let text = body;
    text = text.replace(/\[\[customer_name\]\]/g, currentSim.customerName);
    text = text.replace(/\[\[vehicle_plate\]\]/g, currentSim.vehiclePlate);
    text = text.replace(/\[\[expiry_date\]\]/g, currentSim.expiryDate);
    text = text.replace(/\[\[iccid_last_6\]\]/g, `...${currentSim.iccid.slice(-6)}`);
    text = text.replace(/\[\[renewal_url\]\]/g, `iot-connect.co/renew/${currentSim.id}`);
    text = text.replace(/\[\[invoice_amount\]\]/g, `$${(currentSim.monthlyPrice * 1.5).toFixed(2)}`); // simulated invoice price
    return text;
  };

  const handleSendTestMessage = () => {
    if (!testNumber) {
      alert("Input phone number first before sending diagnostic test message!");
      return;
    }
    alert(`Success! Simulated WhatsApp broadcast packet dispatched to carrier number: ${testNumber}`);
  };

  const triggerCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCampaignRunning) return;

    setIsCampaignRunning(true);
    setCampaignProgress(10);

    const interval = setInterval(() => {
      setCampaignProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // Callback log write
            onDispatchCampaign(campaignTitle, campaignTemplateId, campaignOperator);
            setIsCampaignRunning(false);
            setCampaignProgress(0);
            alert(`WhatsApp Campaign "${campaignTitle}" fully executed! Packets pushed to carrier queues.`);
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-100 text-slate-950">WhatsApp Business Automation Settings</h2>
          <p className="text-xs text-slate-500 mt-1">Configure timing sequence engines, text message templates, and diagnostic status monitors.</p>
        </div>

        <div className="flex gap-2">
          {/* Diagnostic status line */}
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl px-4 py-2 flex items-center gap-2 text-xs font-mono">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span>Carrier WhatsApp API: Connected (200 OK)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Sequence and Config (Span 7) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* API Configuration Panel */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-5 h-5 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-900">Cellular WhatsApp Gateway Endpoints</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Bearer Security Token</label>
                <input
                  type="password"
                  value={bearerToken}
                  onChange={(e) => setBearerToken(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-900 font-mono focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">WhatsApp API URL</label>
                <input
                  type="text"
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-900 font-mono focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Diagnostic E.164 Test Mobile Phone</label>
                <input
                  type="text"
                  value={testNumber}
                  onChange={(e) => setTestNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-900 font-mono focus:ring-1 focus:ring-slate-900"
                  placeholder="+62 811..."
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleSendTestMessage}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-xl text-xs active:scale-95 transition-all text-center cursor-pointer"
                >
                  Send Diagnostics Test Packet
                </button>
              </div>
            </div>
          </div>

          {/* Sequences and active Stages timeline */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-indigo-50/50 flex justify-between items-center bg-slate-900 text-white">
              <h3 className="text-sm font-bold">Standard Expiration Grace Sequences</h3>
              <span className="bg-emerald-500/10 text-emerald-300 font-mono text-[9px] font-black tracking-wider border border-emerald-500/20 px-2 py-0.5 rounded">
                6 STAGES PROGRAMMED
              </span>
            </div>

            <div className="p-6 relative">
              {/* Timeline center line overlay */}
              <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-slate-100"></div>

              <div className="space-y-6">
                {templates.map((temp) => {
                  const isSelected = selectedTemplateId === temp.id;
                  return (
                    <div key={temp.id} className="relative flex items-start gap-4">
                      {/* Round badge indicator */}
                      <button 
                        onClick={() => setSelectedTemplateId(temp.id)}
                        className={`w-9 h-9 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 z-10 transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-slate-900 text-white border-slate-900' 
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-900 hover:text-slate-900'
                        }`}
                      >
                        {temp.daysIndicator > 0 ? `+${temp.daysIndicator}` : temp.daysIndicator}
                      </button>

                      {/* Timeline Body Box */}
                      <div className={`flex-1 border p-4 rounded-2xl transition-all ${
                        isSelected 
                          ? 'bg-slate-50 border-slate-900 shadow-sm' 
                          : 'bg-white border-slate-100 hover:border-slate-300'
                      }`}>
                        <div className="flex justify-between items-start gap-2">
                          <div 
                            className="cursor-pointer" 
                            onClick={() => setSelectedTemplateId(temp.id)}
                          >
                            <p className="font-bold text-xs text-slate-900">{temp.stageName}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide font-mono font-bold">Timing: Expiration {temp.daysIndicator === 0 ? "Due Date" : `${Math.abs(temp.daysIndicator)} days ${temp.daysIndicator < 0 ? "prior" : "post"}`}</p>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Toggle active / inactive slider */}
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox"
                                checked={temp.isActive}
                                onChange={(e) => onUpdateTemplate({ ...temp, isActive: e.target.checked })}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                            </label>

                            <button
                              type="button"
                              onClick={() => setEditingTemplate(temp)}
                              className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                            >
                              EDIT CONTENT
                            </button>
                          </div>
                        </div>

                        {/* Snippet body */}
                        <div className="mt-3 bg-white border border-slate-100 p-2.5 rounded-lg font-mono text-[10.5px] text-slate-700 max-h-20 overflow-hidden line-clamp-2 leading-relaxed">
                          {temp.bodyTxt}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* BULK WHATSAPP CAMPAIGN SENDER */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-indigo-500 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-900">Trigger Bulk Campaigns (PRD Feature)</h3>
            </div>

            <form onSubmit={triggerCampaignSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 font-bold block">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 font-bold block">Select Template Layout</label>
                <select
                  value={campaignTemplateId}
                  onChange={(e) => setCampaignTemplateId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-slate-900"
                >
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.stageName}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 font-bold block">Carrier Target segment</label>
                <select
                  value={campaignOperator}
                  onChange={(e) => setCampaignOperator(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-slate-900"
                >
                  <option value="ALL">All Carriers SIMs</option>
                  <option value="Kartu Halo">Kartu HALO</option>
                  <option value="XL Axiata IoT">XL Axiata IoT segment</option>
                  <option value="Indosat Ooredoo Business">Indosat Ooredoo segment</option>
                </select>
              </div>

              <div className="md:col-span-3 pt-2">
                {isCampaignRunning ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-bold text-slate-500 font-mono">
                      <span>Dispatching cellular broadcast packets...</span>
                      <span>{campaignProgress}%</span>
                    </div>
                    {/* Progress track */}
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${campaignProgress}%` }}></div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-[#075E54] hover:bg-[#064e45] text-white font-bold py-2 px-4 rounded-xl text-xs active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Trigger Massive Broadcast Sequence</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: E.164 smartphone preview (Span 5) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-300 text-center flex flex-col items-center">
            
            <div className="w-full text-left flex justify-between items-center mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Variable Mapper Diagnostics</span>
              <Smartphone className="w-4 h-4 text-emerald-400" />
            </div>

            {/* Select sim to feed variables */}
            <div className="w-full text-left space-y-1.5 mb-6">
              <label className="text-[10px] text-slate-400 block font-mono uppercase font-bold">Select Simulated Target Subscriber</label>
              <select
                value={selectedSimPreviewId}
                onChange={(e) => setSelectedSimPreviewId(e.target.value)}
                className="w-full bg-slate-800 text-white border border-slate-700 px-3 py-1.5 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                {sims.map(sim => (
                  <option key={sim.id} value={sim.id}>{sim.customerName} - {sim.vehiclePlate}</option>
                ))}
              </select>
            </div>

            {/* Live WhatsApp Smartphone Mockup */}
            <div className="relative w-[280px] h-[520px] bg-slate-950 rounded-[2.5rem] border-[6px] border-slate-800 shadow-2xl overflow-hidden flex flex-col text-left">
              {/* Phone speaker speaker header */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-800 rounded-b-xl z-20"></div>

              {/* Chat Header banner */}
              <div className="bg-[#075E54] pt-7 pb-2.5 px-3 flex items-center gap-2">
                <span className="text-white text-xs">←</span>
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-900 overflow-hidden">
                  IoT
                </div>
                <div>
                  <p className="text-white text-[11px] font-bold leading-tight">IoT Connect Billing Webhook</p>
                  <p className="text-white/60 text-[8.5px]">Official Business Account</p>
                </div>
              </div>

              {/* Chat background body with whatsapp patterns */}
              <div className="flex-1 bg-amber-50/5 p-3 space-y-3 relative overflow-y-auto" style={{ backgroundColor: '#efeae2' }}>
                <div className="flex justify-center">
                  <span className="bg-white/90 text-[9px] text-slate-500 px-2.5 py-0.5 rounded shadow-sm uppercase font-bold">Today</span>
                </div>

                {/* Message Bubble container */}
                <div className="max-w-[85%] bg-white p-2.5 rounded-lg rounded-tl-none shadow-sm relative text-xs">
                  <div className="absolute -left-1.5 top-0 w-0 h-0 border-t-[6px] border-t-white border-l-[6px] border-l-transparent"></div>
                  
                  {/* Translated text preview block */}
                  <div className="whitespace-pre-wrap text-slate-800 leading-normal text-[11px]">
                    {getSubstitutedMessage(currentTemplate?.bodyTxt || "No content")}
                  </div>

                  <div className="flex justify-end mt-1">
                    <span className="text-[8px] text-slate-400 font-mono font-bold">17:00</span>
                  </div>
                </div>

                {/* Secure Payment wire alert attachment */}
                <div className="max-w-[85%] bg-[#dcf8c6] p-2 rounded-lg rounded-tl-none shadow-sm relative text-xs ml-auto">
                  <span className="text-[10px] text-emerald-800 font-bold block">Security Gateway Link</span>
                  <p className="text-[10px] text-slate-700 mt-1 font-mono hover:underline">
                    iot-connect.co/renew/{currentSim?.id || "temp"}
                  </p>
                </div>
              </div>

              {/* Foot input */}
              <div className="bg-slate-100 p-1.5 flex items-center gap-1">
                <div className="flex-1 bg-white rounded-full px-3 py-1 flex justify-between items-center text-[10px] text-slate-400">
                  <span>Type message receipt...</span>
                </div>
                <div className="w-6 h-6 rounded-full bg-[#075E54] flex items-center justify-center">
                  <span className="text-white text-[10px]">🎤</span>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Logs History */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm text-left">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <span className="font-bold text-xs text-slate-800">Auto Trigger Dispatch Logs</span>
              <button 
                onClick={onClearLogs}
                className="text-[9px] font-bold text-rose-600 hover:bg-rose-50 px-2 py-0.5 rounded transition-all cursor-pointer"
              >
                Clear Sandbox Logs
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {logs.length === 0 ? (
                <p className="text-[10px] text-slate-400 italic py-4 text-center">No broadcast packets registered yet.</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="text-[10px] flex justify-between border-b border-slate-50 pb-1.5 last:border-0 hover:bg-slate-50 p-1 rounded transition-colors">
                    <div>
                      <span className="font-bold text-slate-900 block">{log.customerName} ({log.stage})</span>
                      <span className="text-slate-400">{log.sentAt} | {log.messageType}</span>
                    </div>
                    <span className="text-emerald-600 font-bold flex items-center gap-0.5 self-center">
                      ✓ {log.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* MODAL WINDOW 4: Edit Template details */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scale-up text-left">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="font-sans font-bold text-sm">Update Expiration Alert Template</h3>
              </div>
              <button onClick={() => setEditingTemplate(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 font-bold block">Sequence Stage Identifier</label>
                <input
                  type="text"
                  required
                  value={editingTemplate.stageName}
                  onChange={(e) => setEditingTemplate({...editingTemplate, stageName: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 font-bold block">Timing (Days Relative to Expiration)</label>
                <input
                  type="number"
                  required
                  value={editingTemplate.daysIndicator}
                  onChange={(e) => setEditingTemplate({...editingTemplate, daysIndicator: Number(e.target.value)})}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-slate-900"
                />
                <span className="text-[9px] text-slate-400 block font-mono">Use negative for D-minus reminders, zero for due date, positive for past due grace.</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold block">Body Text Copy (Supports Bold Formatting)</label>
                  <span className="text-[9px] text-indigo-600 font-mono">Variables allowed: [[customer_name]], [[vehicle_plate]], [[expiry_date]], [[iccid_last_6]], [[renewal_url]]</span>
                </div>
                <textarea
                  rows={5}
                  required
                  value={editingTemplate.bodyTxt}
                  onChange={(e) => setEditingTemplate({...editingTemplate, bodyTxt: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none font-mono"
                  placeholder="Enter message body text..."
                ></textarea>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={() => setEditingTemplate(null)}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onUpdateTemplate(editingTemplate);
                    setEditingTemplate(null);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs active:scale-95 transition-all text-center cursor-pointer"
                >
                  Save Template Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
