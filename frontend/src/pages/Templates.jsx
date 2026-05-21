import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  HelpCircle,
  FileText,
  Calendar,
  User
} from 'lucide-react';

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [activeId, setActiveId] = useState(null);
  const [formData, setFormData] = useState({ name: '', subject: '', body: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const location = useLocation();

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/templates');
      setTemplates(res.data);
    } catch (err) {
      console.error('Failed to load templates', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
    
    // Check if redirect state asks to open template creation modal immediately
    if (location.state?.openCreate) {
      handleOpenCreate();
    }
  }, [location.state]);

  const handleOpenCreate = () => {
    setModalMode('create');
    setFormData({ name: '', subject: '', body: '' });
    setError('');
    setIsOpen(true);
  };

  const handleOpenEdit = (template) => {
    setModalMode('edit');
    setActiveId(template.id);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body
    });
    setError('');
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/templates/${id}`);
      fetchTemplates();
    } catch (err) {
      console.error('Failed to delete template', err);
      alert('Error deleting template. Please try again.');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (modalMode === 'create') {
        await api.post('/templates', formData);
      } else {
        await api.put(`/templates/${activeId}`, formData);
      }
      setIsOpen(false);
      fetchTemplates();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save template. Please verify input data.');
    } finally {
      setSaving(false);
    }
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Title section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Email Templates</h1>
          <p className="text-sm text-slate-400">Design and manage modular email templates with dynamic variable support</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 rounded-xl text-white font-semibold transition-all duration-200 self-start sm:self-auto shadow-lg shadow-brand-500/10"
        >
          <Plus size={16} />
          Create Template
        </button>
      </div>

      {/* Filter and variable hint section */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Search Filter input */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search templates by name or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500/50 transition-colors"
          />
        </div>

        {/* Dynamic Variable Hint Box */}
        <div className="p-3.5 bg-brand-500/5 border border-brand-500/10 rounded-xl flex items-start gap-3 lg:max-w-md">
          <HelpCircle className="text-brand-400 shrink-0 mt-0.5" size={16} />
          <div className="text-xs text-slate-400 leading-relaxed">
            <span className="font-semibold text-brand-300">Variable Syntax:</span> Write <code className="px-1.5 py-0.5 bg-slate-900 rounded font-mono text-brand-300 font-bold">{"{{variable_name}}"}</code> (e.g. <code className="font-mono text-brand-300">{"{{name}}"}</code>) inside the subject or body. Variable input fields will generate dynamically when sending.
          </div>
        </div>
      </div>

      {/* Templates List Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Loading templates...</p>
          </div>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center border border-slate-800 flex flex-col items-center justify-center">
          <FileText size={48} className="text-slate-700 mb-4 opacity-40" />
          <h3 className="text-lg font-semibold text-slate-300">No Templates Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mt-1">
            {search ? 'No templates match your search criteria.' : 'Create your first email template to get started with email campaigns.'}
          </p>
          {!search && (
            <button
              onClick={handleOpenCreate}
              className="mt-6 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-brand-400 hover:text-brand-300 text-sm font-semibold transition-colors"
            >
              Get Started
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="glass rounded-2xl border border-slate-800 hover:border-slate-750 flex flex-col justify-between overflow-hidden hover:scale-[1.01] transition-all duration-300"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-850 flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-200 truncate">{template.name}</h3>
                  <span className="text-xs text-slate-400 font-medium block truncate mt-0.5">Subj: {template.subject}</span>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(template)}
                    className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-brand-400 hover:bg-brand-500/5 hover:border-brand-500/20 transition-colors"
                    title="Edit Template"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/5 hover:border-red-500/20 transition-colors"
                    title="Delete Template"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Body snippet */}
              <div className="p-6 flex-1 bg-slate-900/40">
                <p className="text-xs text-slate-400 font-mono line-clamp-6 whitespace-pre-wrap leading-relaxed">
                  {template.body}
                </p>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-900/90 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <User size={12} className="text-slate-600" />
                  <span className="truncate max-w-[100px]">{template.creatorName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-slate-600" />
                  <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal Dialoag */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {modalMode === 'create' ? 'Create New Template' : 'Edit Email Template'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Provide structure and placeholders for your notification content</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 bg-slate-800 border border-slate-750 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit}>
              <div className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Template Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Welcome Onboarding, Invoice Invoice Notification"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500/50 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Email Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Welcome to NotifyHub, {{name}}! or Your invoice {{invoiceId}} is ready"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500/50 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Body Content (HTML / Text)</label>
                  <textarea
                    required
                    rows={8}
                    placeholder={`Hello {{name}},\n\nYour account setup is complete. You can access the console here: {{consoleUrl}}.\n\nBest regards,\nThe Team`}
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500/50 transition-colors font-mono resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-800 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-brand-500/10"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    modalMode === 'create' ? 'Create Template' : 'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;
