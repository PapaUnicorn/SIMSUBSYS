import React, { useState } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  User, 
  ExternalLink, 
  Trash2, 
  ChevronRight, 
  X, 
  Upload, 
  Check, 
  FileText, 
  Zap, 
  Layers,
  Sparkles,
  RefreshCw,
  Clock,
  PhoneCall,
  UserCheck
} from 'lucide-react';
import { Invoice, CollectionItem, InvoiceStatus } from '../types';

interface BillingViewProps {
  invoices: Invoice[];
  collections: CollectionItem[];
  onTriggerReminder: (customerName: string, plate: string) => void;
  onVerifyPayment: (invoiceNumber: string, reference: string, paymentMethod: string) => void;
  onUpdateCollectionStatus: (id: string, status: 'Reminder Sent' | 'Contacted' | 'Promise To Pay' | 'Paid' | 'Escalated', note: string) => void;
}

export default function BillingView({ 
  invoices, 
  collections, 
  onTriggerReminder, 
  onVerifyPayment,
  onUpdateCollectionStatus
}: BillingViewProps) {
  const [activeTab, setActiveTab] = useState<'invoices' | 'collections'>('invoices');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>('ALL');
  
  // Side Panel state for manually verifying payment
  const [isVerifyPanelOpen, setIsVerifyPanelOpen] = useState(false);
  const [verifyInvoiceNum, setVerifyInvoiceNum] = useState('');
  const [verifyRef, setVerifyRef] = useState('TR-');
  const [verifyMethod, setVerifyMethod] = useState('Midtrans BNI VA');
  const [uploadProofName, setUploadProofName] = useState<string | null>(null);

  // Collections contact call state
  const [activeCollectionItem, setActiveCollectionItem] = useState<CollectionItem | null>(null);
  const [collectionActionNote, setCollectionActionNote] = useState('');
  const [collectionActionStatus, setCollectionActionStatus] = useState<string>('Promise To Pay');

  // Midtrans Simulation popup state
  const [isMidtransModalOpen, setIsMidtransModalOpen] = useState(false);
  const [midtransInvoiceNum, setMidtransInvoiceNum] = useState('');
  const [midtransStep, setMidtransStep] = useState<'select' | 'payment' | 'success'>('select');
  const [midtransMethodSIM, setMidtransMethodSIM] = useState<'qris' | 'va_mandiri' | 'gopay'>('qris');

  // Filter calculations
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(invoiceSearch.toLowerCase());
    
    if (invoiceStatusFilter === 'ALL') return matchesSearch;
    return matchesSearch && inv.status === invoiceStatusFilter;
  });

  // Calculate stats overview
  const totalOutstanding = invoices
    .filter(i => i.status === 'Overdue' || i.status === 'Pending Payment')
    .reduce((sum, s) => sum + s.amount, 0);

  const collectionsOutstandingAmt = collections
    .filter(c => c.status !== 'Paid')
    .reduce((sum, c) => sum + c.balance, 0);

  // Mock excel download trigger
  const handleDownloadInvoicesCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "invoice_number,customer_name,billing_period,amount,status,date,due_date,transaction_id,payment_method\n"
      + invoices.map(i => `${i.invoiceNumber},${i.customerName},${i.billingPeriod.replace(',', ' ')},${i.amount},${i.status},${i.date},${i.dueDate},${i.transactionId || 'N/A'},${i.paymentMethod || 'N/A'}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `billing_invoices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Tab Swapping Control */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-sans text-slate-950">Billing &amp; Collections</h2>
          <p className="text-xs text-slate-500 mt-1">Manual payment settlement hub, Midtrans reconciliation API, and debt recovery logs.</p>
        </div>

        {/* Tab selections */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'invoices' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Invoices Table
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'collections' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Collections Queue
          </button>
        </div>
      </div>

      {/* METRIC CARDS SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Aging Arrears Outstanding</p>
          <p className="text-2xl font-black text-rose-600 font-mono mt-1">${totalOutstanding.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          <div className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Awaiting automatic WhatsApp suspension timers</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Midtrans Portal Status</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <p className="text-lg font-bold text-slate-800">Operational Gateway</p>
          </div>
          <div className="text-[10px] text-slate-400 mt-3">
            <span>VA Bank Accounts & QRIS match triggers active</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <pre className="text-[9px] font-mono text-slate-400">STAGES GRACE: D-30 to D+7</pre>
          <p className="text-lg font-black text-slate-900 mt-1">Automatic Suspension</p>
          <div className="mt-2">
            <button 
              onClick={() => {
                setMidtransStep('select');
                setIsMidtransModalOpen(true);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold py-1.5 px-3.5 rounded-lg inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Simulate Midtrans (VA/QRIS)</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: INVOICES PANEL */}
      {activeTab === 'invoices' && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="flex flex-wrap gap-2 items-center flex-1">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                <input
                  type="text"
                  placeholder="Query with ID or company..."
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 rounded-xl text-xs text-slate-800 focus:outline-none"
                />
              </div>

              {/* Status Selector */}
              <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 overflow-x-auto">
                {['ALL', 'Paid', 'Pending Payment', 'Overdue', 'Cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setInvoiceStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      invoiceStatusFilter === status 
                        ? 'bg-slate-900 text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              {/* Trigger CSV */}
              <button 
                onClick={handleDownloadInvoicesCSV}
                className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-2 px-3.5 rounded-xl text-xs cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-400" />
                <span>Export Invoice Log</span>
              </button>

              {/* Manual Verify action */}
              <button 
                onClick={() => {
                  const pendingInvs = invoices.filter(i => i.status === 'Pending Payment' || i.status === 'Overdue');
                  if (pendingInvs.length > 0) {
                    setVerifyInvoiceNum(pendingInvs[0].invoiceNumber);
                  }
                  setIsVerifyPanelOpen(true);
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Reconcile Payment</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border border-slate-50 rounded-xl text-left">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  <th className="p-4 font-semibold">Invoice Number</th>
                  <th className="p-4 font-semibold">Customer Account Mapping</th>
                  <th className="p-4 font-semibold">Billing Term / Date</th>
                  <th className="p-4 font-semibold text-right">Invoice Amount</th>
                  <th className="p-4 font-semibold">Current Gate Status</th>
                  <th className="p-4 font-semibold">Verified Log ID</th>
                  <th className="p-4 font-semibold text-right">Reconciliation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-indigo-600">
                      {inv.invoiceNumber}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{inv.customerName}</div>
                      <div className="text-[10px] text-slate-400">ID: {inv.customerId}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-sans font-medium text-slate-800">{inv.billingPeriod}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Issued: {inv.date} | Due: {inv.dueDate}</div>
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-slate-950">
                      ${inv.amount.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        inv.status === 'Paid' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : inv.status === 'Pending Payment' 
                            ? 'bg-amber-50 text-amber-700 border-amber-100' 
                            : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[10px] text-slate-500">
                      {inv.transactionId ? (
                        <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{inv.transactionId}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Unsettled</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {inv.status !== 'Paid' ? (
                        <button
                          onClick={() => {
                            setVerifyInvoiceNum(inv.invoiceNumber);
                            setIsVerifyPanelOpen(true);
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-1 px-2.5 rounded-lg text-[10.5px] transition-all cursor-pointer"
                        >
                          Manual Verify
                        </button>
                      ) : (
                        <span className="text-emerald-600 font-bold text-[11px] font-mono flex items-center justify-end gap-1 px-2">
                          <Check className="w-3.5 h-3.5" /> Fully Paid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: COLLECTIONS ARREARS QUEUE */}
      {activeTab === 'collections' && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
          <div>
            <h3 className="font-sans font-bold text-base text-slate-900">Collections Delinquency Action List</h3>
            <p className="text-xs text-slate-500">Accounts which exceeded the grace period and have active payment disputes or promise profiles.</p>
          </div>

          <div className="overflow-x-auto border border-slate-50 rounded-xl text-left">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  <th className="p-4 font-semibold">Customer Account</th>
                  <th className="p-4 font-semibold">Arrears Aging</th>
                  <th className="p-4 font-semibold text-right">Balance Due</th>
                  <th className="p-4 font-semibold">Status Stage</th>
                  <th className="p-4 font-semibold">Internal Audit Notes</th>
                  <th className="p-4 font-semibold text-right">Action Panel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {collections.map((coll) => (
                  <tr key={coll.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">
                      <div>{coll.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{coll.phone}</div>
                    </td>
                    <td className="p-4 font-mono text-rose-600 font-bold">
                      <span className="bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md">
                        {coll.daysOverdue} Days Later
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-slate-950">
                      ${coll.balance.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-bold ${
                        coll.status === 'Promise To Pay' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : coll.status === 'Escalated' 
                            ? 'bg-rose-100 text-rose-800 font-mono animate-pulse' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {coll.status}
                      </span>
                    </td>
                    <td className="p-4 max-w-xs italic text-slate-500">
                      "{coll.lastNote}"
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        {/* Call trigger */}
                        <button
                          onClick={() => {
                            setActiveCollectionItem(coll);
                            setCollectionActionStatus(coll.status);
                            setCollectionActionNote(coll.lastNote);
                          }}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-1 px-3 rounded-lg text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <PhoneCall className="w-3 h-3 text-emerald-400" />
                          <span>Contact / Resolve</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECONCILIATION SLIDER PANEL (Verify Payment Modal) */}
      {isVerifyPanelOpen && (
        <div className="fixed inset-0 z-50 pointer-events-auto overflow-hidden">
          {/* Overlay background */}
          <div 
            onClick={() => setIsVerifyPanelOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
          ></div>

          {/* Floating content slide-in */}
          <div className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl p-6 flex flex-col justify-between overflow-y-auto z-10 animate-slide-in">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-sans font-bold text-base text-slate-950">Manual Payment Verification</h3>
                </div>
                <button 
                  onClick={() => setIsVerifyPanelOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-normal">
                Authorize direct bank wire settlements, transfers, or reconcile unresolved Midtrans payment references here. Approved transactions instantly reactivate the customer's GPS SIM subscribers!
              </p>

              {/* Form elements */}
              <div className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Assigned / Selected Invoice</label>
                  <select
                    value={verifyInvoiceNum}
                    onChange={(e) => setVerifyInvoiceNum(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-900 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">Select Invoice...</option>
                    {invoices
                      .filter(i => i.status !== 'Paid')
                      .map((i) => (
                        <option key={i.id} value={i.invoiceNumber}>
                          {i.invoiceNumber} - {i.customerName} (${i.amount})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold block">Midtrans Transaction / Transfer Ref</label>
                  <input
                    type="text"
                    value={verifyRef}
                    onChange={(e) => setVerifyRef(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-900 font-mono focus:ring-1 focus:ring-emerald-500"
                    placeholder="e.g. TR-28492-MT"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold block">Settlement Option Channel</label>
                  <select
                    value={verifyMethod}
                    onChange={(e) => setVerifyMethod(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-900 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Midtrans BNI VA">Midtrans BNI Virtual Account</option>
                    <option value="Midtrans Mandiri VA">Midtrans Mandiri Virtual Account</option>
                    <option value="Midtrans QRIS">Midtrans Automated QRIS Code</option>
                    <option value="Direct BCA Wire Bank">Direct BCA Wire Settlement</option>
                    <option value="Manual cash collector">Manual Invoice Cash Collection</option>
                  </select>
                </div>

                {/* Simulated file upload */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold block">Confirmation Evidence / Receipt Image</label>
                  <div className="border border-dashed border-slate-200 rounded-xl p-6 bg-slate-50 text-center relative hover:bg-slate-100/50 transition-colors cursor-pointer">
                    <input 
                      type="file" 
                      id="wire-proof" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setUploadProofName(e.target.files[0].name);
                          // Auto generate standard Ref code as well
                          if (verifyRef === 'TR-') {
                            setVerifyRef('TR-' + Math.floor(Math.random() * 90000 + 10000) + '-MT');
                          }
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">
                      {uploadProofName ? uploadProofName : "Drag & Drop wire proof snapshot"}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-mono">PNG, JPG or PDF up to 5MB</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={() => setIsVerifyPanelOpen(false)}
                className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!verifyInvoiceNum) {
                    alert("Please select an invoice payload file!");
                    return;
                  }
                  // Run callback
                  onVerifyPayment(verifyInvoiceNum, verifyRef, verifyMethod);
                  setIsVerifyPanelOpen(false);
                  setUploadProofName(null);
                  setVerifyRef('TR-');
                }}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs active:scale-95 transition-all text-center cursor-pointer"
              >
                Reconcile &amp; Release SIMs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESOLUTION AUDIT NOTE MODAL (Collections contacted panel) */}
      {activeCollectionItem && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-sans font-bold text-sm">Update Collections Case File</h3>
              </div>
              <button onClick={() => setActiveCollectionItem(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-xs text-slate-500">
                <span className="font-bold block text-slate-700">Account Owner: {activeCollectionItem.customerName}</span>
                <span className="block mt-1 font-mono">Current Arrears Arising: ${activeCollectionItem.balance.toFixed(2)}</span>
              </div>

              <div className="space-y-3 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Update Collection Status</label>
                  <select
                    value={collectionActionStatus}
                    onChange={(e) => setCollectionActionStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-900 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Reminder Sent">Reminder Sent</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Promise To Pay">Promise To Pay</option>
                    <option value="Paid">Mark Paid / Resolved</option>
                    <option value="Escalated">Escalated to Legal Actions</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Internal Settlement Note</label>
                  <textarea
                    rows={3}
                    value={collectionActionNote}
                    onChange={(e) => setCollectionActionNote(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-900 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Enter audit wire conversation text details..."
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={() => setActiveCollectionItem(null)}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  Discard Notes
                </button>
                <button
                  onClick={() => {
                    onUpdateCollectionStatus(
                      activeCollectionItem.id, 
                      collectionActionStatus as any, 
                      collectionActionNote
                    );
                    setActiveCollectionItem(null);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs active:scale-95 transition-all text-center cursor-pointer"
                >
                  Save Internal Audit File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MIDTRANS API GATEWAY INTEGRATION SIMULATOR GATE */}
      {isMidtransModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
            
            {/* Midtrans Header branding logo */}
            <div className="bg-[#1D2951] p-6 text-white text-left relative">
              <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full font-mono">
                SANDBOX SIMULATOR
              </div>
              <h4 className="text-sm font-black tracking-wider text-emerald-400 font-sans">midtrans</h4>
              <p className="text-[11px] text-slate-300 mt-1">Payment Redirection Gateway Interface</p>
            </div>

            {/* Stepper Logic */}
            <div className="p-6">
              
              {/* STEP 1: Select Invoice */}
              {midtransStep === 'select' && (
                <div className="space-y-4 text-left">
                  <p className="text-xs text-slate-500 leading-normal">
                    This wizard simulates a customer clicking a Midtrans secure link on their WhatsApp alert to pay their invoice via Virtual Account (VA) or QRIS.
                  </p>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Unpaid Invoice Payload</label>
                    <select
                      value={midtransInvoiceNum}
                      onChange={(e) => setMidtransInvoiceNum(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-900 focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">Select Invoice...</option>
                      {invoices
                        .filter(i => i.status !== 'Paid')
                        .map((i) => (
                          <option key={i.id} value={i.invoiceNumber}>
                            {i.invoiceNumber} - {i.customerName} (${i.amount})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Reconciliation Payment Method</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        type="button"
                        onClick={() => setMidtransMethodSIM('qris')}
                        className={`p-2 border rounded-xl text-xs font-bold text-center flex flex-col justify-center items-center gap-1 cursor-pointer transition-all ${
                          midtransMethodSIM === 'qris' 
                            ? 'bg-slate-900 text-white border-slate-900' 
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-[10px] font-black">QRIS</span>
                        <span className="text-[8px] opacity-70">Gopay, OVO</span>
                      </button>

                      <button 
                        type="button"
                        onClick={() => setMidtransMethodSIM('va_mandiri')}
                        className={`p-2 border rounded-xl text-xs font-bold text-center flex flex-col justify-center items-center gap-1 cursor-pointer transition-all ${
                          midtransMethodSIM === 'va_mandiri' 
                            ? 'bg-slate-900 text-white border-slate-900' 
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-[10px] font-black">BNI / Mandiri</span>
                        <span className="text-[8px] opacity-70">Virtual Account</span>
                      </button>

                      <button 
                        type="button"
                        onClick={() => setMidtransMethodSIM('gopay')}
                        className={`p-2 border rounded-xl text-xs font-bold text-center flex flex-col justify-center items-center gap-1 cursor-pointer transition-all ${
                          midtransMethodSIM === 'gopay' 
                            ? 'bg-slate-900 text-white border-slate-900' 
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-[10px] font-black">LinkAja</span>
                        <span className="text-[8px] opacity-70">Direct Debit</span>
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (!midtransInvoiceNum) {
                        alert("Please select an invoice payload first!");
                        return;
                      }
                      setMidtransStep('payment');
                    }}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-xs tracking-wide cursor-pointer text-center"
                  >
                    Proceed to Simulated Payment Checkout
                  </button>
                </div>
              )}

              {/* STEP 2: Checkout Redirection */}
              {midtransStep === 'payment' && (
                <div className="space-y-4 text-center">
                  <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl">
                    <span className="text-slate-400 font-mono text-[9px] block">CHECKOUT INVOICE {midtransInvoiceNum}</span>
                    <span className="text-2xl font-black text-slate-950 font-mono">
                      ${(invoices.find(i => i.invoiceNumber === midtransInvoiceNum)?.amount || 45.00).toFixed(2)}
                    </span>
                  </div>

                  {midtransMethodSIM === 'qris' ? (
                    <div className="flex flex-col items-center justify-center p-4 bg-white border border-slate-100 rounded-2xl w-48 mx-auto shadow-inner">
                      {/* Placeholder QR Code using SVG lines perfectly */}
                      <svg className="w-32 h-32 text-slate-950" viewBox="0 0 100 100" fill="currentColor">
                        <rect x="10" y="10" width="20" height="20" />
                        <rect x="70" y="10" width="20" height="20" />
                        <rect x="10" y="70" width="20" height="20" />
                        <rect x="20" y="20" width="5" height="5" fill="white" />
                        <rect x="75" y="15" width="5" height="5" fill="white" />
                        <rect x="15" y="75" width="5" height="5" fill="white" />
                        <rect x="40" y="40" width="10" height="10" />
                        <rect x="60" y="60" width="5" height="20" />
                        <rect x="40" y="10" width="10" height="25" />
                        <rect x="50" y="70" width="15" height="5" />
                      </svg>
                      <p className="text-[10px] text-slate-400 mt-2 font-mono">Scan QRIS code via Shopee / Gopay</p>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1 font-mono text-left">
                      <span className="text-[10px] text-slate-400 block uppercase">Virtual Account Code (BNI)</span>
                      <span className="text-lg font-black text-slate-900 tracking-wider">8801944201948562</span>
                      <span className="text-[8px] text-slate-500 block">Copy this numeric VA to simulator wire BCA transfer</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setMidtransStep('select')}
                      className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold py-2 rounded-xl text-xs cursor-pointer"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => {
                        const randomId = 'TR-' + Math.floor(Math.random() * 90000 + 10000) + '-MT';
                        const methodString = midtransMethodSIM === 'qris' ? 'Midtrans QRIS' : 'Midtrans VA';
                        onVerifyPayment(midtransInvoiceNum, randomId, methodString);
                        setMidtransStep('success');
                      }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs cursor-pointer active:scale-95 transition-all text-center"
                    >
                      Simulate Paid Event
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Automated Recognition and Release Success */}
              {midtransStep === 'success' && (
                <div className="space-y-4 text-center py-4">
                  <div className="bg-emerald-100 text-emerald-800 p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-900">Reconciliation Released Successfully!</h5>
                    <p className="text-xs text-slate-500 mt-1.5 leading-normal">
                      The Midtrans webhook triggered successfully. The invoice was matched, status set to "Paid", and the delinquent telemetry GPS SIM re-released back to "Active" status instantly without human delays.
                    </p>
                  </div>

                  <button 
                    onClick={() => {
                      setIsMidtransModalOpen(false);
                      setMidtransStep('select');
                      setMidtransInvoiceNum('');
                    }}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs cursor-pointer"
                  >
                    Finish Simulation
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
