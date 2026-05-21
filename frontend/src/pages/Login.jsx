import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Shield, ArrowRight } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'OPERATOR'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        navigate('/dashboard');
      } else {
        await register(formData.name, formData.email, formData.password, formData.role);
        setSuccess('Account created successfully! You can now sign in.');
        setIsLogin(true);
        setFormData({ name: '', email: formData.email, password: '', role: 'OPERATOR' });
      }
    } catch (err) {
      if (typeof err === 'object') {
        // Validation errors from spring boot
        setError(Object.values(err).join(', '));
      } else {
        setError(err);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex items-center justify-center p-6 overflow-hidden">
      {/* Decorative Glow Bubbles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] glow-animation pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Auth Card Container */}
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-brand-500 rounded-2xl text-white mb-4 shadow-xl shadow-brand-500/20">
            <Mail size={32} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-brand-300 bg-clip-text text-transparent">
            NotifyHub
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Production-grade Email Automation Platform
          </p>
        </div>

        <div className="glass-premium rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Header tabs */}
          <div className="flex bg-slate-900/60 p-1.5 rounded-2xl mb-8 border border-slate-800">
            <button
              onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 text-center text-sm font-semibold rounded-xl transition-all duration-300 ${
                isLogin 
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 text-center text-sm font-semibold rounded-xl transition-all duration-300 ${
                !isLogin 
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your name"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500/50 transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="name@company.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500/50 transition-colors"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Assigned Role</label>
                <div className="relative">
                  <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 focus:outline-none focus:border-brand-500/50 transition-colors appearance-none"
                  >
                    <option value="OPERATOR">Operator (Standard)</option>
                    <option value="ADMIN">Administrator (Full Access)</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 group transition-all duration-300 shadow-lg shadow-brand-500/20 mt-8"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
