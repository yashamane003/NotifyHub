import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  CheckCircle, 
  XCircle, 
  Calendar, 
  FileText, 
  RefreshCw, 
  Plus, 
  Send,
  ArrowRight
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSent: 0,
    totalFailed: 0,
    scheduledCount: 0,
    templatesCount: 0
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const statsRes = await api.get('/dashboard/stats');
      setStats(statsRes.data);

      const logsRes = await api.get('/emails/history');
      setRecentLogs(logsRes.data.slice(0, 5)); // show top 5
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const cards = [
    {
      title: 'Total Sent',
      value: stats.totalSent,
      icon: CheckCircle,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      gradient: 'from-emerald-500/20 to-emerald-500/5'
    },
    {
      title: 'Total Failed',
      value: stats.totalFailed,
      icon: XCircle,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      gradient: 'from-rose-500/20 to-rose-500/5'
    },
    {
      title: 'Scheduled Queue',
      value: stats.scheduledCount,
      icon: Calendar,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      gradient: 'from-amber-500/20 to-amber-500/5'
    },
    {
      title: 'Active Templates',
      value: stats.templatesCount,
      icon: FileText,
      color: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
      gradient: 'from-brand-500/20 to-brand-500/5'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading system metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard Overview</h1>
          <p className="text-sm text-slate-400">Real-time status of your email delivery performance</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Stats'}
        </button>
      </div>

      {/* Grid Cards metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`glass rounded-2xl p-6 border border-slate-800/80 hover:border-slate-700/80 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group`}
            >
              {/* Background gradient hint */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${card.gradient} rounded-bl-full opacity-50 blur-2xl group-hover:opacity-80 transition-opacity`} />
              <div className="flex justify-between items-start mb-4">
                <span className="text-slate-400 text-sm font-semibold tracking-wide uppercase">{card.title}</span>
                <div className={`p-2.5 rounded-xl border ${card.color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="text-4xl font-extrabold text-white font-mono mt-2 tracking-tight">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick actions and recent activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions Panel */}
        <div className="glass rounded-2xl p-6 border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white mb-2">Quick Commands</h2>
          
          <button
            onClick={() => navigate('/send-email')}
            className="w-full flex items-center justify-between p-4 bg-brand-500 hover:bg-brand-600 rounded-xl text-white font-semibold shadow-lg shadow-brand-500/10 group transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white/10 rounded-lg">
                <Send size={18} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold">Dispatch Email</span>
                <span className="text-xs text-brand-100 font-normal">Immediate or scheduled delivery</span>
              </div>
            </div>
            <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
          </button>

          <button
            onClick={() => navigate('/templates', { state: { openCreate: true } })}
            className="w-full flex items-center justify-between p-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-200 hover:text-white transition-all duration-300 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-slate-800 rounded-lg text-brand-400">
                <Plus size={18} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold">New Email Template</span>
                <span className="text-xs text-slate-500">Design dynamic reusable content</span>
              </div>
            </div>
            <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform text-slate-500 group-hover:text-slate-300" />
          </button>
        </div>

        {/* Recent Activity Table */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Recent Activities</h2>
              <button
                onClick={() => navigate('/history')}
                className="text-xs font-semibold text-brand-400 hover:text-brand-300"
              >
                View History
              </button>
            </div>

            {recentLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
                <Mail size={32} className="mb-2 opacity-30" />
                <p className="text-sm">No recent activities found.</p>
                <p className="text-xs mt-1">Send an email to see delivery reports here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3.5 bg-slate-900/60 rounded-xl border border-slate-850 hover:border-slate-800 transition-colors">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`p-2 rounded-lg border ${
                        log.status === 'SENT' 
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                          : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                      }`}>
                        <Mail size={16} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-slate-200 truncate">{log.subject}</span>
                        <span className="text-xs text-slate-500 truncate">{log.recipient}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        log.status === 'SENT' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      }`}>
                        {log.status}
                      </span>
                      <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                        {new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
