'use client';

import { useEffect, useState } from 'react';
import { personasAPI } from '@/lib/api';
import { Persona, AIModel } from '@/types';
import { Brain, Plus, Edit2, Trash2, Sparkles, Lock } from 'lucide-react';

export default function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [aiModels, setAIModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [personasRes, modelsRes] = await Promise.all([
        personasAPI.getAll(),
        personasAPI.getAvailableModels(),
      ]);
      setPersonas(personasRes.data.data);
      setAIModels(modelsRes.data.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (persona: Persona) => {
    if (persona.is_system) {
      alert('Cannot delete system personas');
      return;
    }

    if (persona.device_count && persona.device_count > 0) {
      alert(`Cannot delete persona "${persona.name}". It is being used by ${persona.device_count} device(s).`);
      return;
    }

    if (!confirm(`Are you sure you want to delete "${persona.name}"?`)) return;

    try {
      await personasAPI.delete(persona.id);
      await loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete persona');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Personas</h1>
          <p className="text-gray-600 mt-1">Manage AI personalities for your devices</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Persona</span>
        </button>
      </div>

      {/* System Personas */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
          <Lock className="w-5 h-5 text-gray-500" />
          <span>System Personas</span>
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {personas
            .filter((p) => p.is_system)
            .map((persona) => (
              <PersonaCard
                key={persona.id}
                persona={persona}
                onEdit={() => {
                  setSelectedPersona(persona);
                  setShowEditModal(true);
                }}
                onDelete={() => handleDelete(persona)}
              />
            ))}
        </div>
      </div>

      {/* Custom Personas */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <span>Custom Personas</span>
        </h2>
        {personas.filter((p) => !p.is_system).length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Brain className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">No custom personas yet</p>
            <p className="text-sm text-gray-500 mb-4">
              Create custom AI personalities tailored to your business needs
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Create Your First Persona
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {personas
              .filter((p) => !p.is_system)
              .map((persona) => (
                <PersonaCard
                  key={persona.id}
                  persona={persona}
                  onEdit={() => {
                    setSelectedPersona(persona);
                    setShowEditModal(true);
                  }}
                  onDelete={() => handleDelete(persona)}
                />
              ))}
          </div>
        )}
      </div>

      {/* Add Persona Modal */}
      {showAddModal && (
        <PersonaModal
          aiModels={aiModels}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadData();
          }}
        />
      )}

      {/* Edit Persona Modal */}
      {showEditModal && selectedPersona && (
        <PersonaModal
          persona={selectedPersona}
          aiModels={aiModels}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPersona(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedPersona(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

// Persona Card Component
function PersonaCard({
  persona,
  onEdit,
  onDelete,
}: {
  persona: Persona;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {!persona.is_system && (
            <button
              onClick={onDelete}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">{persona.name}</h3>
            {persona.is_system && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                System
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {persona.description || 'No description'}
          </p>
        </div>

        <div className="pt-3 border-t border-gray-100 space-y-2 text-sm">
          {persona.ai_model && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Model:</span>
              <span className="font-medium text-gray-900">{persona.ai_model}</span>
            </div>
          )}
          {persona.tone && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tone:</span>
              <span className="font-medium text-gray-900 capitalize">{persona.tone}</span>
            </div>
          )}
          {persona.response_style && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Style:</span>
              <span className="font-medium text-gray-900 capitalize">{persona.response_style}</span>
            </div>
          )}
        </div>

        {persona.device_count !== undefined && (
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Devices using:</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-medium">
                {persona.device_count}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Persona Modal Component (Add/Edit)
function PersonaModal({
  persona,
  aiModels,
  onClose,
  onSuccess,
}: {
  persona?: Persona;
  aiModels: AIModel[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: persona?.name || '',
    description: persona?.description || '',
    ai_instructions: persona?.ai_instructions || '',
    ai_model: persona?.ai_model || 'gemini-2.0-flash',
    tone: persona?.tone || 'professional',
    response_style: persona?.response_style || 'concise',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (persona) {
        await personasAPI.update(persona.id, formData);
      } else {
        await personasAPI.create(formData);
      }
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.error || `Failed to ${persona ? 'update' : 'create'} persona`);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {persona ? 'Edit Persona' : 'Create New Persona'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Persona Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Sales Expert, Support Specialist"
                required
                disabled={persona?.is_system}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-100 text-gray-900 placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this persona"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Instructions *
              </label>
              <textarea
                value={formData.ai_instructions}
                onChange={(e) => setFormData({ ...formData, ai_instructions: e.target.value })}
                placeholder="System instructions for the AI. Define personality, tone, goals, and behavior..."
                required
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent font-mono text-sm text-gray-900 placeholder-gray-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Example: "You are a friendly sales expert. Help customers find the right products, answer questions about pricing and features, and guide them through the purchase process."
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Model
                </label>
                <select
                  value={formData.ai_model}
                  onChange={(e) => setFormData({ ...formData, ai_model: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 placeholder-gray-500"
                >
                  {aiModels.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tone
                </label>
                <select
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 placeholder-gray-500"
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="casual">Casual</option>
                  <option value="formal">Formal</option>
                  <option value="enthusiastic">Enthusiastic</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Style
                </label>
                <select
                  value={formData.response_style}
                  onChange={(e) => setFormData({ ...formData, response_style: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 placeholder-gray-500"
                >
                  <option value="concise">Concise</option>
                  <option value="detailed">Detailed</option>
                  <option value="conversational">Conversational</option>
                  <option value="technical">Technical</option>
                </select>
              </div>
            </div>

            {persona?.is_system && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> You can modify AI instructions and settings for system personas, but cannot change the name or delete them.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {submitting ? (persona ? 'Saving...' : 'Creating...') : (persona ? 'Save Changes' : 'Create Persona')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
