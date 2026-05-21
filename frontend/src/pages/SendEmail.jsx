import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Send, 
  Calendar, 
  Mail, 
  Sparkles, 
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  FileText
} from 'lucide-react';

const SendEmail = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('immediate'); // 'immediate' or 'schedule'
  
  // Form input states
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [recipient, setRecipient] = useState('');
  const [variables, setVariables] = useState({});
  const [scheduledTime, setScheduledTime] = useState('');
  
  // Variables detected in active template
  const [detectedVars, setDetectedVars] = useState([]);
  
  // Response states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const res = await api.get('/templates');
        setTemplates(res.data);
        if (res.data.length > 0) {
          // preselect first
          setSelectedTemplateId(res.data[0].id.toString());
        }
      } catch (err) {
        console.error('Failed to load templates', err);
      } finally {
        setLoading(false);
      }
    };
    loadTemplates();
  }, []);

  // Scan template subject & body for variables {{var_name}} whenever template changes
  useEffect(() => {
    if (!selectedTemplateId) {
      setDetectedVars([]);
      return;
    }

    const activeTemplate = templates.find(t => t.id.toString() === selectedTemplateId);
    if (!activeTemplate) {
      setDetectedVars([]);
      return;
    }

    const combinedText = `${activeTemplate.subject} ${activeTemplate.body}`;
    const regex = /\{\{([^}]+)\}\}/g;
    const foundVars = [];
    let match;

    while ((match = regex.exec(combinedText)) !== null) {
      const varName = match[1].trim();
      if (!foundVars.includes(varName)) {
        foundVars.push(varName);
      }
    }

    setDetectedVars(foundVars);
    
    // Initialize variable inputs state with empty strings
    const initialVars = {};
    foundVars.forEach(v => {
      initialVars[v] = '';
    });
    setVariables(initialVars);
    setError('');
  }, [selectedTemplateId, templates]);

  const handleVariableChange = (varName, value) => {
    setVariables({
      ...variables,
      [varName]: value
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    if (activeTab === 'schedule' && !scheduledTime) {
      setError('Please specify a scheduled delivery time.');
      setSubmitting(false);
      return;
    }

    const payload = {
      templateId: parseInt(selectedTemplateId),
      recipient,
      variables
    };

    try {
      if (activeTab === 'immediate') {
        const res = await api.post('/emails/send', payload);
        setSuccess(`Email successfully queued for immediate delivery! Log ID: ${res.data.id}`);
        // Reset recipient and variables
        setRecipient('');
        const resetVars = {};
        detectedVars.forEach(v => { resetVars[v] = ''; });
        setVariables(resetVars);
      } else {
        // Enforce scheduled time conversion to ISO-8601 string compatible with LocalDateTime
        const formattedTime = scheduledTime; // e.g. "2026-05-22T14:30" -> Spring parses easily
        const schedulePayload = { ...payload, scheduledTime: formattedTime };
        
        await api.post('/emails/schedule', schedulePayload);
        setSuccess('Email successfully scheduled!');
        setRecipient('');
        setScheduledTime('');
        const resetVars = {};
        detectedVars.forEach(v => { resetVars[v] = ''; });
        setVariables(resetVars);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred dispatching email.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading automation runner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Send Email</h1>
        <p className="text-sm text-slate-400">Select templates, customize parameters, and dispatch emails immediately or in the future</p>
      </div>

      {templates.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center border border-slate-800 flex flex-col items-center justify-center">
          <FileText size={48} className="text-slate-700 mb-4 opacity-40" />
          <h3 className="text-lg font-semibold text-slate-300">No Templates Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mt-1">
            You must create an email template before dispatching emails.
          </p>
          <button
            onClick={() => navigate('/templates')}
            className="mt-6 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 rounded-xl text-white font-semibold text-sm transition-all duration-200"
          >
            Create Template First
          </button>
        </div>
      ) : (
        <div className="glass-premium rounded-3xl p-8 shadow-2xl relative">
          {/* Dispatch tabs */}
          <div className="flex bg-slate-900/60 p-1.5 rounded-2xl mb-8 border border-slate-850">
            <button
              onClick={() => { setActiveTab('immediate'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 text-center text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${
                activeTab === 'immediate' 
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Send size={14} />
              Send Immediately
            </button>
            <button
              onClick={() => { setActiveTab('schedule'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 text-center text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${
                activeTab === 'schedule' 
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar size={14} />
              Schedule Delivery
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                {success}
              </div>
              <button
                onClick={() => navigate(activeTab === 'immediate' ? '/history' : '/history', { state: { tab: activeTab === 'immediate' ? 'history' : 'scheduled' } })}
                className="text-xs font-bold text-green-300 hover:underline flex items-center gap-1 shrink-0 ml-4"
              >
                Inspect logs
                <ArrowRight size={12} />
              </button>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Template Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Active Template</label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 focus:outline-none focus:border-brand-500/50 transition-colors"
              >
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.subject})
                  </option>
                ))}
              </select>
            </div>

            {/* Recipient Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Recipient Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="recipient@example.com"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Scheduler Delivery Time Input */}
            {activeTab === 'schedule' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Delivery Date & Time</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="datetime-local"
                    required
                    value={scheduledTime}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 focus:outline-none focus:border-brand-500/50 transition-colors font-mono"
                  />
                </div>
              </div>
            )}

            {/* DYNAMIC VARIABLES SECTION */}
            <div className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-brand-400 glow-animation" />
                  Dynamic Template Parameters
                </h3>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
                  {detectedVars.length} Discovered
                </span>
              </div>

              {detectedVars.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">
                  No variable placeholders (like <code className="font-mono text-brand-400">{"{{name}}"}</code>) were discovered in this template. Email will be sent as-is.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {detectedVars.map((varName) => (
                    <div key={varName} className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400 block font-mono">
                        {varName}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={`Value for {{${varName}}}`}
                        value={variables[varName] || ''}
                        onChange={(e) => handleVariableChange(varName, e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3.5 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-brand-500/40 transition-colors"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 group transition-all duration-300 shadow-lg shadow-brand-500/20 mt-8"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {activeTab === 'immediate' ? 'Send Email Now' : 'Schedule Delivery'}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SendEmail;
