import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  Send, 
  History, 
  Settings, 
  LogOut,
  Mail
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/templates', label: 'Templates', icon: FileText },
    { to: '/send-email', label: 'Send Email', icon: Send },
    { to: '/history', label: 'Email History', icon: History },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-2.5">
          <div className="p-1.5 bg-brand-500 rounded-lg text-white glow-animation">
            <Mail size={20} />
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-brand-300 bg-clip-text text-transparent">
            NotifyHub
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="mt-6 px-4 space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive 
                      ? 'bg-brand-500/10 text-brand-300 border-l-4 border-brand-500 pl-3' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`
                }
              >
                <Icon size={18} className="group-hover:scale-105 transition-transform" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center font-semibold text-white shadow-lg shadow-brand-500/10">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate text-slate-200">{user?.name}</span>
              <span className="text-xs text-brand-400 font-medium px-2 py-0.5 bg-brand-500/10 rounded-md border border-brand-500/20 w-max mt-0.5">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 hover:bg-red-500/5 text-sm font-medium transition-all duration-200"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
