import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  HelpCircle, 
  User, 
  CheckCircle, 
  Radio, 
  Briefcase, 
  Sparkles, 
  ShieldAlert,
  Menu,
  X,
  Search
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import SimManagementView from './components/SimManagementView';
import BillingView from './components/BillingView';
import WhatsAppView from './components/WhatsAppView';
import SettingsView from './components/SettingsView';

import { 
  Customer, 
  SIMSubscription, 
  Invoice, 
  WhatsAppTemplate, 
  WhatsAppLog, 
  CollectionItem,
  SimStatus,
  InvoiceStatus
} from './types';

import { 
  initialCustomers, 
  initialSIMs, 
  initialInvoices, 
  initialWhatsAppTemplates, 
  initialWhatsAppLogs, 
  initialCollections 
} from './mockData';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  
  // Dynamic Databases
  const [sims, setSims] = useState<SIMSubscription[]>(initialSIMs);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [collections, setCollections] = useState<CollectionItem[]>(initialCollections);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>(initialWhatsAppTemplates);
  const [logs, setLogs] = useState<WhatsAppLog[]>(initialWhatsAppLogs);

  // App settings parameters
  const [currentRole, setCurrentRole] = useState<'Owner' | 'Admin Staff' | 'Finance Team'>('Owner');
  const [priceIncreasePct, setPriceIncreasePct] = useState<number>(10);
  const [gracePeriodDays, setGracePeriodDays] = useState<number>(7);

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'alert'>('success');
  const [isToastVisible, setIsToastVisible] = useState(false);

  // Global search bar text
  const [globalSearch, setGlobalSearch] = useState('');

  const triggerToast = (message: string, type: 'success' | 'alert' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setIsToastVisible(true);
  };

  useEffect(() => {
    if (isToastVisible) {
      const timer = setTimeout(() => {
        setIsToastVisible(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isToastVisible]);

  // Handler: Manual & webhook payment verification / checkout completion
  const handleVerifyInvoicePayment = (invoiceNumber: string, reference: string, paymentMethod: string) => {
    // Find matching invoice
    const mInvoice = invoices.find(i => i.invoiceNumber === invoiceNumber);
    if (!mInvoice) return;

    // 1. Update invoice in database
    const updatedInvoices = invoices.map(i => {
      if (i.invoiceNumber === invoiceNumber) {
        return {
          ...i,
          status: 'Paid' as InvoiceStatus,
          transactionId: reference,
          paymentMethod: paymentMethod,
        };
      }
      return i;
    });
    setInvoices(updatedInvoices);

    // 2. Automated Webhook Release: Find associated Customer and change Due/Overdue SIMs status back to Active
    const updatedSims = sims.map(s => {
      if (s.customerName === mInvoice.customerName && (s.status === 'Due' || s.status === 'Overdue' || s.status === 'Suspended')) {
        return {
          ...s,
          status: 'Active' as SimStatus,
          paymentScore: Math.min(100, s.paymentScore + 15), // boost score on prompt wire release!
        };
      }
      return s;
    });
    setSims(updatedSims);

    // 3. Resolve collection items outstanding
    setCollections(collections.map(c => {
      if (c.customerName === mInvoice.customerName) {
        return {
          ...c,
          status: 'Paid',
          lastNote: `Auto resolved. Reconciled via transaction ${reference}`,
        };
      }
      return c;
    }));

    // 4. Log WhatsApp dispatch notification
    const timeNow = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const notificationLog: WhatsAppLog = {
      id: 'log-' + Math.floor(Math.random() * 1000),
      customerName: mInvoice.customerName,
      phone: '+62 811-3944-001',
      stage: 'Activation Receipt',
      sentAt: timeNow,
      messageType: 'Manual',
      status: 'Read',
    };
    setLogs([notificationLog, ...logs]);

    triggerToast(`Payment ${reference} Reconciled. SIMs for ${mInvoice.customerName} reactivated!`, 'success');
  };

  // Handler: Add New SIM
  const handleAddSim = (newSim: Omit<SIMSubscription, 'id'>) => {
    if (currentRole === 'Finance Team') {
      triggerToast("Access Denied: Provisioning SIM plans is restricted for the Finance Team.", "alert");
      return;
    }

    const randomId = 'sim-' + (sims.length + 1);
    const validatedSim: SIMSubscription = {
      ...newSim,
      id: randomId,
    };

    setSims([...sims, validatedSim]);
    triggerToast(`Provisioned SIM ${newSim.simNumber} for ${newSim.customerName}`, 'success');
  };

  // Handler: Update SIM
  const handleUpdateSim = (updatedSim: SIMSubscription) => {
    if (currentRole === 'Finance Team') {
      triggerToast("Access Denied: Editing cellular configs is restricted for the Finance Team.", "alert");
      return;
    }

    setSims(sims.map(s => s.id === updatedSim.id ? updatedSim : s));
    triggerToast(`SIM configuration ${updatedSim.simNumber} updated`, 'success');
  };

  // Handler: Delete SIM
  const handleDeleteSim = (id: string) => {
    if (currentRole === 'Finance Team') {
      triggerToast("Access Denied: Cellular terminations are restricted for the Finance Team.", "alert");
      return;
    }

    setSims(sims.filter(s => s.id !== id));
    triggerToast(`SIM configuration removed successfully`, 'success');
  };

  // Handler: Bulk status manipulation
  const handleBulkUpdateSimStatus = (ids: string[], newStatus: SimStatus) => {
    if (currentRole === 'Finance Team') {
      triggerToast("Access Denied: Bulk action is restricted for Finance role.", "alert");
      return;
    }

    setSims(sims.map(s => ids.includes(s.id) ? { ...s, status: newStatus } : s));
    triggerToast(`Swapped status of ${ids.length} SIM records to ${newStatus}`, 'success');
  };

  // Handler: Send manual WhatsApp sequence triggers (D-30, etc.)
  const handleTriggerWhatsAppManual = (customerName: string, plate: string) => {
    const timeNow = new Date().toISOString().replace('T', ' ').slice(0, 16);
    
    // Write WhatsApp log history
    const manualLog: WhatsAppLog = {
      id: 'log-' + Math.floor(Math.random() * 1000),
      customerName: customerName,
      phone: '+62 811-1234-001',
      stage: 'Urgent Alert',
      sentAt: timeNow,
      messageType: 'Manual',
      status: 'Sent',
    };
    setLogs([manualLog, ...logs]);

    // Show beautiful toast explicitly matching PRD: "Reminder sent successfully to fleet owner."
    triggerToast(`Reminder sent successfully to fleet owner of vehicle ${plate || ''}.`, 'success');
  };

  // Handler: WhatsApp Bulk Campaign trigger
  const handleDispatchCampaign = (campaignTitle: string, templateId: string, operatorFilter: string) => {
    const timeNow = new Date().toISOString().replace('T', ' ').slice(0, 16);
    
    // Generate simulated logs based on matching Operators
    const targets = sims.filter(s => operatorFilter === 'ALL' || s.operator === operatorFilter);
    const newCampaignLogs: WhatsAppLog[] = targets.slice(0, 5).map((s, idx) => ({
      id: `c-log-${Date.now()}-${idx}`,
      customerName: s.customerName,
      phone: s.simNumber,
      stage: campaignTitle,
      sentAt: timeNow,
      messageType: 'Bulk Campaign',
      status: 'Sent',
    }));

    setLogs([...newCampaignLogs, ...logs]);
    triggerToast(`Fired bulk campaign payload to ${targets.length} SIM subscribers`, 'success');
  };

  // Handler: Update Collection Item notes or status
  const handleUpdateCollectionStatus = (
    id: string, 
    status: 'Reminder Sent' | 'Contacted' | 'Promise To Pay' | 'Paid' | 'Escalated', 
    note: string
  ) => {
    setCollections(collections.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status,
          lastNote: note,
        };
      }
      return c;
    }));
    triggerToast("Audit collection records updated", "success");
  };

  // Calculate unpaid invoice counts forSidebar badge
  const pendingInvsCount = invoices.filter(i => i.status === 'Pending Payment' || i.status === 'Overdue').length;

  return (
    <div className="bg-[#f8f9ff] text-slate-800 font-sans min-h-screen flex text-left relative selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Toast Notification Container */}
      <div 
        className={`fixed bottom-8 right-8 z-50 transform transition-all duration-500 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border ${
          isToastVisible 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-12 opacity-0 pointer-events-none'
        } ${
          toastType === 'success' 
            ? 'bg-slate-900 border-emerald-500/25 text-white' 
            : 'bg-rose-950 border-rose-500/20 text-rose-200'
        }`}
      >
        <CheckCircle className={`w-5 h-5 ${toastType === 'success' ? 'text-emerald-400' : 'text-rose-400'}`} />
        <span className="text-xs font-bold font-sans">{toastMessage}</span>
      </div>

      {/* FIXED SIDE NAVIGATION BAR */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        onAddNewSim={() => {
          if (currentRole === 'Finance Team') {
            triggerToast("Access Denied: SIM creations restricted for Finance role", "alert");
          } else {
            setCurrentTab('sims');
            // Simply trigger direct click
          }
        }}
        outstandingCount={pendingInvsCount}
      />

      {/* MAIN CONTAINER STREAM */}
      <div className="ml-70 flex-1 flex flex-col min-h-screen">
        
        {/* TOP COMPLIANT NAVBAR */}
        <header className="sticky top-0 z-30 h-16 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 flex justify-between items-center px-8">
          
          {/* Custom Global Search */}
          <div className="flex items-center gap-3 flex-grow max-w-sm">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Global telemetry query..."
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  // Quick shortcut redirection mapping matches
                  if (e.target.value && currentTab === 'dashboard') {
                    setCurrentTab('sims');
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-9 pr-3 py-1.5 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            
            {/* Rapid payment release */}
            <button 
              onClick={() => {
                const overdueInvs = invoices.filter(i => i.status !== 'Paid');
                if (overdueInvs.length === 0) {
                  triggerToast("No outstanding invoices remaining inside this sandbox session", "success");
                } else {
                  setCurrentTab('billing');
                  triggerToast("Redirection: Loaded verification sidebar inside Billing tab.", "success");
                }
              }}
              className="text-xs text-indigo-600 hover:text-indigo-850 font-bold bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer"
            >
              Verify Direct Settlement
            </button>

            {/* Notification logs triggers */}
            <div className="flex items-center gap-4 text-slate-400 relative">
              <div className="relative cursor-pointer hover:text-slate-800" onClick={() => triggerToast(`Sandbox status: Active session logging role ${currentRole}`, 'success')}>
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              </div>
              <HelpCircle className="w-4.5 h-4.5 cursor-pointer hover:text-slate-800" onClick={() => triggerToast("IoT Connect PROD Sandbox: fully offline. Live integrations fully simulated.", "success")} />
            </div>

            {/* Security active role display */}
            <div className="flex items-center gap-2 pl-4 border-l border-slate-100">
              <div className="text-right">
                <p className="text-[11px] font-bold text-slate-900 leading-tight">Alex Chen</p>
                <div className="flex items-center gap-1 justify-end mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <p className="text-[9px] font-mono text-indigo-600 font-bold uppercase tracking-wider">{currentRole}</p>
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                <img 
                  alt="User Profile" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpAD_TKn5GeKNE62DvNaE2nK1LW0dGCe2APtH7vyVgQEeY38dXEu_8LbR_b5yuTs2Eb7VV4_mLbH2pBWTpDoGWgUmywOq3KC9y8Sgp4yBsHPa1oJW_I_Y0LlV0P2Mh8eqCx9Q0l0xgngrdsc3jWgm1aQh5uThJvcdJVSQ1G_igY5H8tlZHOQVhFOIgNMcZ427_hJJluF2ZBU0qaud1bJWYQSwaxVhzhBuz1pPzioqsC9wB1TjDiGrPV6bT-jOvBN5dyNqIBcRqbUM"
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>

          </div>
        </header>

        {/* CONTAINER SCROLL STREAM */}
        <main className="flex-grow p-8 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView 
              sims={sims} 
              invoices={invoices} 
              collections={collections}
              onTriggerReminder={handleTriggerWhatsAppManual}
              onNavigateToTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'sims' && (
            <SimManagementView 
              sims={sims}
              onAddSim={handleAddSim}
              onUpdateSim={handleUpdateSim}
              onDeleteSim={handleDeleteSim}
              onBulkUpdateStatus={handleBulkUpdateSimStatus}
            />
          )}

          {currentTab === 'billing' && (
            <BillingView 
              invoices={invoices} 
              collections={collections}
              onTriggerReminder={handleTriggerWhatsAppManual}
              onVerifyPayment={handleVerifyInvoicePayment}
              onUpdateCollectionStatus={handleUpdateCollectionStatus}
            />
          )}

          {currentTab === 'whatsapp' && (
            <WhatsAppView 
              templates={templates} 
              logs={logs} 
              sims={sims}
              onUpdateTemplate={(updated) => {
                setTemplates(templates.map(t => t.id === updated.id ? updated : t));
                triggerToast(`WhatsApp template "${updated.stageName}" parameters saved!`, "success");
              }}
              onDispatchCampaign={handleDispatchCampaign}
              onClearLogs={() => {
                setLogs([]);
                triggerToast("Cleared diagnostic database logs", "success");
              }}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView 
              currentRole={currentRole}
              onChangeRole={setCurrentRole}
              priceIncreasePct={priceIncreasePct}
              onUpdatePriceIncrease={setPriceIncreasePct}
              gracePeriodDays={gracePeriodDays}
              onUpdateGracePeriod={setGracePeriodDays}
            />
          )}
        </main>
      </div>
    </div>
  );
}
