import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  Filter, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  Cpu, 
  RefreshCw,
  Ban,
  X,
  FileSpreadsheet,
  Check,
  Calendar,
  Layers,
  HelpCircle
} from 'lucide-react';
import { SIMSubscription, SimStatus } from '../types';

interface SimManagementViewProps {
  sims: SIMSubscription[];
  onAddSim: (newSim: Omit<SIMSubscription, 'id'>) => void;
  onUpdateSim: (updatedSim: SIMSubscription) => void;
  onDeleteSim: (id: string) => void;
  onBulkUpdateStatus: (ids: string[], newStatus: SimStatus) => void;
}

export default function SimManagementView({ 
  sims, 
  onAddSim, 
  onUpdateSim, 
  onDeleteSim, 
  onBulkUpdateStatus 
}: SimManagementViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modals / forms state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSim, setEditingSim] = useState<SIMSubscription | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // New SIM form state
  const [newSIMVal, setNewSIMVal] = useState({
    simNumber: '+62 811-',
    iccid: '89441120',
    operator: 'Kartu Halo',
    activationDate: '2026-06-15',
    expiryDate: '2027-06-15',
    monthlyPrice: 15,
    vehiclePlate: 'B ',
    imei: '8610340',
    status: 'Active' as SimStatus,
    customerName: 'SmartMove Logistics',
  });

  // Filter & search calculations
  const filteredSims = sims.filter((s) => {
    const matchesSearch = 
      s.simNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.iccid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.imei && s.imei.includes(searchTerm));
    
    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && s.status === statusFilter;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredSims.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSims.map(s => s.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Add SIM submission
  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSim({
      ...newSIMVal,
      customerId: newSIMVal.customerName === 'SmartMove Logistics' ? 'c1' : 'c2',
      paymentScore: 90,
    });
    setIsAddOpen(false);
    
    // Reset to defaults
    setNewSIMVal({
      simNumber: '+62 811-',
      iccid: '894411120',
      operator: 'Kartu Halo',
      activationDate: '2026-06-15',
      expiryDate: '2027-06-15',
      monthlyPrice: 15,
      vehiclePlate: 'B ',
      imei: '8610340',
      status: 'Active',
      customerName: 'SmartMove Logistics',
    });
  };

  // Edit SIM submission
  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSim) {
      onUpdateSim(editingSim);
      setIsEditOpen(false);
      setEditingSim(null);
    }
  };

  // Mock excel data output download trigger
  const triggerExcelDownload = () => {
    setIsExportModalOpen(true);
  };

  const getStatusStyle = (status: SimStatus) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100';
      case 'Expiring Soon':
        return 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100';
      case 'Due':
        return 'bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-100';
      case 'Overdue':
        return 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100';
      case 'Suspended':
        return 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200';
      case 'Terminated':
        return 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Add Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-950">SIM Subscription Database</h2>
          <p className="text-xs text-slate-500 mt-1">Manage physical ICCIDs, fleet plate mapping and monthly carrier plans.</p>
        </div>

        <div className="flex gap-2">
          {/* Export CSV Button */}
          <button 
            onClick={triggerExcelDownload}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-2 px-4 rounded-xl text-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Database</span>
          </button>

          {/* Add SIM Button */}
          <button 
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 px-4 rounded-xl text-xs transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New SIM</span>
          </button>
        </div>
      </div>

      {/* Database control panel (Search triggers, filters and bulk actions) */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden p-4">
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          
          {/* Filters on Left side */}
          <div className="flex flex-wrap gap-2 items-center flex-1">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search plate, ICCID, number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Status filters buttons */}
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 overflow-x-auto">
              {['ALL', 'Active', 'Expiring Soon', 'Due', 'Overdue', 'Suspended', 'Terminated'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === status 
                      ? 'bg-slate-900 text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Bulk actions on Right side which is only activated on selected count */}
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 ? (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 p-1.5 rounded-xl animate-fade-in">
                <span className="text-[11px] font-bold text-rose-700 px-2">
                  {selectedIds.length} Selected
                </span>
                
                {/* Mark Active Bulk */}
                <button 
                  onClick={() => {
                    onBulkUpdateStatus(selectedIds, 'Active');
                    setSelectedIds([]);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                >
                  Bulk Activate
                </button>

                {/* Bulk Suspend */}
                <button 
                  onClick={() => {
                    onBulkUpdateStatus(selectedIds, 'Suspended');
                    setSelectedIds([]);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                >
                  Bulk Suspend
                </button>

                {/* Bulk Delete */}
                <button 
                  onClick={() => {
                    if (confirm("Are you sure you want to delete these matched records?")) {
                      selectedIds.forEach(id => onDeleteSim(id));
                      setSelectedIds([]);
                    }
                  }}
                  className="text-rose-600 hover:bg-rose-100 p-1.5 rounded-lg transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <button 
                  onClick={() => setSelectedIds([])}
                  className="text-slate-400 hover:text-slate-900 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 font-medium font-mono">
                Select list row check for mass carrier tasks.
              </p>
            )}
          </div>
        </div>

        {/* Database Table Rendering (Responsive) */}
        <div className="overflow-x-auto mt-4 border border-slate-50 rounded-xl text-left">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="p-4 w-10">
                  <input 
                    type="checkbox"
                    checked={filteredSims.length > 0 && selectedIds.length === filteredSims.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-slate-950 focus:ring-slate-950 cursor-pointer"
                  />
                </th>
                <th className="p-4 font-semibold">SIM / Operator</th>
                <th className="p-4 font-semibold">ICCID Record</th>
                <th className="p-4 font-semibold">GPS Plate Mapping</th>
                <th className="p-4 font-semibold">Expiration Date</th>
                <th className="p-4 font-semibold text-right">Carrier Charge</th>
                <th className="p-4 font-semibold">Behavior Score</th>
                <th className="p-4 font-semibold">Lifecycle Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredSims.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-400">
                    <Cpu className="w-12 h-12 stroke-1 text-slate-300 mx-auto mb-3 animate-pulse" />
                    <p className="font-bold">No GPS SIM records found</p>
                    <p className="text-[11px] mt-1 text-slate-400">Try adjusting your filters or add a new fleet line.</p>
                  </td>
                </tr>
              ) : (
                filteredSims.map((sim) => {
                  const isChecked = selectedIds.includes(sim.id);
                  return (
                    <tr key={sim.id} className={`hover:bg-slate-50/50 transition-colors ${isChecked ? 'bg-slate-50' : ''}`}>
                      <td className="p-4">
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(sim.id)}
                          className="rounded border-slate-300 text-slate-950 focus:ring-slate-950 cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <div className="font-sans font-bold text-slate-900">{sim.simNumber}</div>
                        <div className="text-[10px] text-slate-400 focus:outline-none">{sim.operator}</div>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-slate-500">
                        {sim.iccid}
                      </td>
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-800 font-mono font-black border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                          {sim.vehiclePlate}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[11px]">
                        {sim.expiryDate}
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-slate-900">
                        ${sim.monthlyPrice.toFixed(2)}/mo
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                sim.paymentScore > 80 
                                  ? 'bg-emerald-500' 
                                  : sim.paymentScore > 50 
                                    ? 'bg-amber-500' 
                                    : 'bg-rose-500'
                              }`} 
                              style={{ width: `${sim.paymentScore}%` }}
                            ></div>
                          </div>
                          <span className="font-mono text-[10px] font-bold text-slate-500">{sim.paymentScore} pts</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border tracking-wider transition-all cursor-default ${getStatusStyle(sim.status)}`}>
                          {sim.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end">
                          {/* Edit Action Button */}
                          <button 
                            onClick={() => {
                              setEditingSim(sim);
                              setIsEditOpen(true);
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 rounded-lg transition-all cursor-pointer"
                            title="Edit SIM Info"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          
                          {/* Delete Action Button */}
                          <button 
                            onClick={() => {
                              if (confirm(`Remove GPS SIM alignment config for plate ${sim.vehiclePlate}?`)) {
                                onDeleteSim(sim.id);
                              }
                            }}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-1.5 rounded-lg transition-all cursor-pointer"
                            title="Remove SIM Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL WINDOW 1: Add New SIM */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-400" />
                <h3 className="font-sans font-bold text-sm">Provision New Enterprise SIM Card</h3>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-mono uppercase text-slate-400">Carrier SIM Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={newSIMVal.simNumber}
                    onChange={(e) => setNewSIMVal({...newSIMVal, simNumber: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-mono uppercase text-slate-400">ICCID Code (19 Octets)</label>
                  <input
                    type="text"
                    required
                    value={newSIMVal.iccid}
                    onChange={(e) => setNewSIMVal({...newSIMVal, iccid: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-mono uppercase text-slate-400">Cellular Operator</label>
                  <select
                    value={newSIMVal.operator}
                    onChange={(e) => setNewSIMVal({...newSIMVal, operator: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Kartu Halo">Kartu HALO</option>
                    <option value="XL Axiata IoT">XL Axiata IoT</option>
                    <option value="Indosat Ooredoo Business">Indosat Ooredoo Business</option>
                    <option value="Smartfren Corp">Smartfren Corp</option>
                  </select>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-mono uppercase text-slate-400">Monthly Plan Price ($)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newSIMVal.monthlyPrice}
                    onChange={(e) => setNewSIMVal({...newSIMVal, monthlyPrice: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-mono uppercase text-slate-400">GPS Tracker Vehicle Plate</label>
                  <input
                    type="text"
                    required
                    value={newSIMVal.vehiclePlate}
                    onChange={(e) => setNewSIMVal({...newSIMVal, vehiclePlate: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-mono uppercase text-slate-400">GPS Modem IMEI ID</label>
                  <input
                    type="text"
                    required
                    value={newSIMVal.imei}
                    onChange={(e) => setNewSIMVal({...newSIMVal, imei: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-mono uppercase text-slate-400">Lifecycle Status</label>
                  <select
                    value={newSIMVal.status}
                    onChange={(e) => setNewSIMVal({...newSIMVal, status: e.target.value as SimStatus})}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Expiring Soon">Expiring Soon</option>
                    <option value="Due">Due</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-mono uppercase text-slate-400">Customer Enterprise Map</label>
                  <select
                    value={newSIMVal.customerName}
                    onChange={(e) => setNewSIMVal({...newSIMVal, customerName: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="SmartMove Logistics">SmartMove Logistics</option>
                    <option value="NexaTech Energy">NexaTech Energy Solutions</option>
                    <option value="Global Connect">Global Connect Fleet</option>
                    <option value="Alpha Labs">Alpha Labs Biotech</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/50 flex gap-2.5 text-[11px] text-slate-500 leading-normal">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p>Provisioning generates automated billing periods and maps to automated WhatsApp trigger logs.</p>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2 rounded-xl text-xs active:scale-95 transition-all cursor-pointer"
                >
                  Confirm Provisioning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL WINDOW 2: Edit SIM */}
      {isEditOpen && editingSim && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-400" />
                <h3 className="font-sans font-bold text-sm">Edit GPS SIM Config & Expiration</h3>
              </div>
              <button onClick={() => { setIsEditOpen(false); setEditingSim(null); }} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-mono uppercase text-slate-400">SIM Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={editingSim.simNumber}
                    onChange={(e) => setEditingSim({...editingSim, simNumber: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-mono uppercase text-slate-400">GPS Plate Registration</label>
                  <input
                    type="text"
                    required
                    value={editingSim.vehiclePlate}
                    onChange={(e) => setEditingSim({...editingSim, vehiclePlate: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-mono uppercase text-slate-400">Monthly Billing Price ($)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingSim.monthlyPrice}
                    onChange={(e) => setEditingSim({...editingSim, monthlyPrice: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-mono uppercase text-slate-400 text-slate-500 font-bold block">Current Status</label>
                  <select
                    value={editingSim.status}
                    onChange={(e) => setEditingSim({...editingSim, status: e.target.value as SimStatus})}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Expiring Soon">Expiring Soon</option>
                    <option value="Due">Due</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-mono uppercase text-slate-400">Expiration Date</label>
                  <input
                    type="date"
                    required
                    value={editingSim.expiryDate}
                    onChange={(e) => setEditingSim({...editingSim, expiryDate: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-mono uppercase text-slate-400">Modem IMEI ID</label>
                  <input
                    type="text"
                    required
                    value={editingSim.imei}
                    onChange={(e) => setEditingSim({...editingSim, imei: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setIsEditOpen(false); setEditingSim(null); }}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2 rounded-xl text-xs active:scale-95 transition-all cursor-pointer"
                >
                  Save Config Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL WINDOW 3: Export CSV Visual Sandbox */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="bg-emerald-900 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="font-sans font-bold text-sm">Simulated CSV/Excel Billing Export</h3>
              </div>
              <button onClick={() => setIsExportModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                The mock engine has dynamically prepared an Excel-compatible report containing telemetry records, payment scoring behavior, and carriers status. 
              </p>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-[9px] text-slate-600 overflow-y-auto max-h-56 leading-normal text-left">
                <div>sim_id,iccid,operator,vehicle_plate,expiry_date,monthly_price,payment_score,status</div>
                {sims.map((sim) => (
                  <div key={sim.id} className="hover:bg-slate-100 transition-colors">
                    {sim.id},{sim.iccid},{sim.operator.replace(',', '')},{sim.vehiclePlate},{sim.expiryDate},${sim.monthlyPrice.toFixed(2)},{sim.paymentScore},{sim.status}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Report size: ~{sims.length * 150} bytes of text-csv format</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsExportModalOpen(false)}
                    className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                  >
                    Close Sheet Preview
                  </button>
                  <button
                    onClick={() => {
                      // Actually export file!
                      const csvContent = "data:text/csv;charset=utf-8," 
                        + "sim_id,iccid,operator,vehicle_plate,expiry_date,monthly_price,payment_score,status\n"
                        + sims.map(sim => `${sim.id},${sim.iccid},${sim.operator},${sim.vehiclePlate},${sim.expiryDate},${sim.monthlyPrice},${sim.paymentScore},${sim.status}`).join("\n");
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute("download", `gps_subscription_report_${new Date().toISOString().split('T')[0]}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      setIsExportModalOpen(false);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download CSV Spreadsheet</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
