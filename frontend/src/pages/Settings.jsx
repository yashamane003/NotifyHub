import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Shield, 
  Mail, 
  Database, 
  Cpu, 
  Server, 
  Activity 
} from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();

  const configs = [
    { name: 'Relational Database', value: 'MySQL 8.0', icon: Database, details: 'Active (Stores users, templates, schedule queues and history logs)' },
    { name: 'Caching layer', value: 'Redis Cache 7.2', icon: Cpu, details: 'Active (Handles fast cache queries for dashboard metrics statistics)' },
    { name: 'Cron Mail Task Runner', value: '@Scheduled Scheduler', icon: Activity, details: 'Active (Runs every minute checking for pending emails due for delivery)' },
    { name: 'SMTP Mail Server', value: 'Mailpit Developer Box', icon: Server, details: 'Active (Fulfills sandbox mock SMTP routing and holds developer UI)' }
  ];

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">System Settings</h1>
        <p className="text-sm text-slate-400">View active operator profiles and platform architecture details</p>
      </div>

      {/* Profile Card */}
      <div className="glass-premium rounded-3xl p-8 border border-slate-800 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <User size={18} className="text-brand-400" />
          Operator Profile
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Full Name</span>
            <div className="text-sm font-semibold text-slate-200 bg-slate-900/60 px-4 py-3 rounded-xl border border-slate-850">
              {user?.name}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Email Address</span>
            <div className="text-sm font-semibold text-slate-200 bg-slate-900/60 px-4 py-3 rounded-xl border border-slate-850 flex items-center gap-2">
              <Mail size={14} className="text-slate-500" />
              {user?.email}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Assigned Security Role</span>
            <div className="text-sm font-bold text-brand-300 bg-brand-500/5 px-4 py-3 rounded-xl border border-brand-500/10 flex items-center gap-2 w-max">
              <Shield size={14} className="text-brand-400" />
              {user?.role}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Unique Database ID</span>
            <div className="text-sm font-mono text-slate-400 bg-slate-900/60 px-4 py-3 rounded-xl border border-slate-850 w-max">
              # {user?.id}
            </div>
          </div>
        </div>
      </div>

      {/* Stack configuration details */}
      <div className="glass rounded-3xl p-8 border border-slate-800 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu size={18} className="text-brand-400" />
            Infrastructure Configurations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Active architecture layers running under Docker Compose environment</p>
        </div>

        <div className="divide-y divide-slate-850">
          {configs.map((config, idx) => {
            const Icon = config.icon;
            return (
              <div key={idx} className="py-4.5 flex items-start gap-4 first:pt-0 last:pb-0">
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 shrink-0">
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-slate-200">{config.name}</span>
                    <span className="text-xs font-bold text-slate-400 font-mono bg-slate-900 px-2.5 py-0.5 rounded-md border border-slate-800 shrink-0">
                      {config.value}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{config.details}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Settings;
