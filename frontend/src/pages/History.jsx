import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { 
  History as HistoryIcon, 
  Calendar, 
  Search, 
  Eye, 
  RefreshCw, 
  X, 
  Mail,
  AlertCircle,
  FileText,
  User,
  Clock
} from 'lucide-react';

const History = () => {
  const [activeTab, setActiveTab] = useState('history'); // 'history' or 'scheduled'
  const [historyList, setHistoryList] = useState([]);
  const [scheduledList, setScheduledList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // Inspector Modal state
  const [inspectItem, setInspectItem] = useState(null);

  const location = useLocation();

  const loadData = async () => {
    try {
      if (activeTab === 'history') {
        const res = await api.get('/emails/history');
        setHistoryList(res.data);
      } else {
        const res = await api.get('/emails/scheduled');
        setScheduledList(res.data);
      }
    } catch (err) {
      console.error('Failed to load logs', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Check if redirect state specifies active tab
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [activeTab]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleInspect = async (item) => {
    // If it's a history item, we can query its detailed endpoint GET /emails/history/{id}
    if (activeTab === 'history') {
      try {
        const res = await api.get(`/emails/history/${item.id}`);
        setInspectItem({ ...res.data, type: 'history' });
      } catch (err) {
        console.error('Failed to load log detail', err);
        // Fallback to list details
        setInspectItem({ ...item, type: 'history' });
      }
    } else {
      setInspectItem({ ...item, type: 'scheduled' });
    }
  };

  const currentList = activeTab === 'history' ? historyList : scheduledList;
  const filteredList = currentList.filter(item => 
    item.recipient.toLowerCase().includes(search.toLowerCase()) ||
    item.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Title section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Delivery Auditing</h1>
          <p className="text-sm text-slate-400">Inspect historical transaction dispatches and future automation queues</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors self-start sm:self-auto"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Tabs toggle */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => { setActiveTab('history'); setSearch(''); }}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'history' 
              ? 'border-brand-500 text-brand-400 font-bold bg-brand-500/5' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <HistoryIcon size={16} />
          Sent & Failed History
        </button>
        <button
          onClick={() => { setActiveTab('scheduled'); setSearch(''); }}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'scheduled' 
              ? 'border-brand-500 text-brand-400 font-bold bg-brand-500/5' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar size={16} />
          Scheduled Queue
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder={`Search ${activeTab === 'history' ? 'history logs' : 'scheduled queue'} by recipient or subject...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500/50 transition-colors"
        />
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Loading delivery reports...</p>
          </div>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center border border-slate-800 flex flex-col items-center justify-center">
          <Mail size={48} className="text-slate-700 mb-4 opacity-40" />
          <h3 className="text-lg font-semibold text-slate-300">No Records Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mt-1">
            {search ? 'No results match your search term.' : `No ${activeTab === 'history' ? 'emails have been sent yet' : 'emails scheduled in queue'}.`}
          </p>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-850 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Recipient</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">
                    {activeTab === 'history' ? 'Dispatched At' : 'Scheduled Delivery'}
                  </th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300 text-sm">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4.5 font-semibold text-slate-200">
                      {item.recipient}
                    </td>
                    <td className="px-6 py-4.5 truncate max-w-xs sm:max-w-md">
                      {item.subject}
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        item.status === 'SENT' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : item.status === 'FAILED'
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 font-mono text-xs text-slate-400">
                      {activeTab === 'history' 
                        ? (item.sentAt ? new Date(item.sentAt).toLocaleString() : 'N/A')
                        : new Date(item.scheduledTime).toLocaleString()
                      }
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <button
                        onClick={() => handleInspect(item)}
                        className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-brand-300 hover:border-brand-500/20 transition-all duration-200"
                        title="Inspect Delivery details"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INSPECTOR DETAILS MODAL */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Mail size={18} className="text-brand-400" />
                  Email Dispatch Audit
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">ID: {inspectItem.id} • Type: {inspectItem.type === 'history' ? 'Historical Dispatch' : 'Scheduled Queue'}</p>
              </div>
              <button
                onClick={() => setInspectItem(null)}
                className="p-1.5 bg-slate-800 border border-slate-750 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Audit Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/50 p-4 border border-slate-850 rounded-2xl text-xs">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User size={13} className="text-slate-500" />
                    <span className="text-slate-400">Recipient:</span>
                    <span className="font-semibold text-slate-200 truncate">{inspectItem.recipient}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText size={13} className="text-slate-500" />
                    <span className="text-slate-400">Template:</span>
                    <span className="font-semibold text-brand-300 truncate">{inspectItem.templateName}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User size={13} className="text-slate-500" />
                    <span className="text-slate-400">Operator:</span>
                    <span className="font-semibold text-slate-200">{inspectItem.senderName || inspectItem.schedulerName || 'System'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={13} className="text-slate-500" />
                    <span className="text-slate-400">
                      {inspectItem.type === 'history' ? 'Dispatched:' : 'Target Time:'}
                    </span>
                    <span className="font-mono text-slate-300">
                      {inspectItem.type === 'history' 
                        ? (inspectItem.sentAt ? new Date(inspectItem.sentAt).toLocaleString() : 'Pending')
                        : new Date(inspectItem.scheduledTime).toLocaleString()
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Subject Line</span>
                <div className="bg-slate-950 px-4 py-3 rounded-xl border border-slate-850 font-semibold text-slate-200 text-sm">
                  {inspectItem.subject}
                </div>
              </div>

              {/* Rendered Body */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Compiled Message Body</span>
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {inspectItem.body}
                </div>
              </div>

              {/* Status & Error Logs */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Dispatch Status</span>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                    inspectItem.status === 'SENT' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : inspectItem.status === 'FAILED'
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  }`}>
                    {inspectItem.status}
                  </span>
                </div>

                {inspectItem.status === 'FAILED' && inspectItem.errorMessage && (
                  <div className="mt-4 p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 text-xs flex items-start gap-2.5">
                    <AlertCircle className="text-rose-400 shrink-0 mt-0.5" size={16} />
                    <div className="space-y-1">
                      <span className="font-bold text-rose-300 block">SMTP Exception Log:</span>
                      <p className="text-rose-400/90 font-mono leading-relaxed break-all">
                        {inspectItem.errorMessage}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectItem(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-750 text-slate-300 hover:text-white font-semibold rounded-xl text-sm transition-colors"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
