'use client';

import { useEffect, useState } from 'react';
import { profileAPI } from '@/lib/api';
import { BusinessProfile, ScrapingProgress, KnowledgeBase } from '@/types';
import {
  Building2,
  Globe,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader,
  Upload,
  FileText,
  Plus,
  Save,
  Edit,
  Eye,
  Clock,
} from 'lucide-react';

type TabType = 'info' | 'scraping' | 'knowledge';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getProfile();
      setProfile(response.data.data);
    } catch (error: any) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-12 h-12 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">
          Manage your business information and AI knowledge base
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'info'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5" />
              <span>Business Information</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('scraping')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'scraping'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>AI Website Import</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('knowledge')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'knowledge'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Knowledge Base</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && <ProfileInfoTab profile={profile!} onUpdate={loadProfile} />}
      {activeTab === 'scraping' && <ScrapingTab onComplete={loadProfile} />}
      {activeTab === 'knowledge' && <KnowledgeTab />}
    </div>
  );
}

// Profile Info Tab Component
function ProfileInfoTab({ profile, onUpdate }: { profile: BusinessProfile; onUpdate: () => void }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(profile);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await profileAPI.updateProfile(formData);
      setSuccess('Profile updated successfully');
      setEditing(false);
      onUpdate();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setEditing(false);
    setError('');
    setSuccess('');
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-end">
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>{success}</span>
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                disabled={!editing}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-100 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
              <input
                type="text"
                value={formData.industry || ''}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                disabled={!editing}
                placeholder="e.g., Retail, Technology"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-100 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input
                type="url"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                disabled={!editing}
                placeholder="https://example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-100 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
              <input
                type="text"
                value={formData.business_type || ''}
                onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                disabled={!editing}
                placeholder="e.g., ecommerce, retail"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-100 text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={!editing}
              rows={3}
              placeholder="Brief description of your business"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-100 text-gray-900 placeholder:text-gray-400 resize-none"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!editing}
                placeholder="+94771234567"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-100 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!editing}
                placeholder="contact@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-100 text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              disabled={!editing}
              rows={2}
              placeholder="123 Main St, City, Country"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-100 text-gray-900 placeholder:text-gray-400 resize-none"
            />
          </div>
        </div>

        {/* Social Media */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
              <input
                type="url"
                value={formData.social_media?.facebook || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    social_media: { ...formData.social_media, facebook: e.target.value },
                  })
                }
                disabled={!editing}
                placeholder="https://facebook.com/yourpage"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-100 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
              <input
                type="url"
                value={formData.social_media?.instagram || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    social_media: { ...formData.social_media, instagram: e.target.value },
                  })
                }
                disabled={!editing}
                placeholder="https://instagram.com/yourpage"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-100 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
              <input
                type="url"
                value={formData.social_media?.twitter || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    social_media: { ...formData.social_media, twitter: e.target.value },
                  })
                }
                disabled={!editing}
                placeholder="https://twitter.com/yourpage"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-100 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
              <input
                type="url"
                value={formData.social_media?.linkedin || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    social_media: { ...formData.social_media, linkedin: e.target.value },
                  })
                }
                disabled={!editing}
                placeholder="https://linkedin.com/company/yourpage"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-100 text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

// Scraping Tab Component
function ScrapingTab({ onComplete }: { onComplete: () => void }) {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [progress, setProgress] = useState<ScrapingProgress | null>(null);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (scraping) {
      interval = setInterval(async () => {
        try {
          const response = await profileAPI.getScrapingProgress();
          const progressData = response.data.data;
          setProgress(progressData);

          if (progressData.status === 'completed') {
            setScraping(false);
            setResult({ success: true });
            onComplete();
            clearInterval(interval);
          } else if (progressData.status === 'failed') {
            setScraping(false);
            setError(progressData.error || 'Scraping failed');
            clearInterval(interval);
          }
        } catch (error) {
          console.error('Error fetching progress:', error);
        }
      }, 2000); // Poll every 2 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [scraping, onComplete]);

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    setScraping(true);
    setError('');
    setResult(null);
    setProgress(null);

    try {
      await profileAPI.scrapeWebsite(websiteUrl);
      // Progress will be tracked by the interval
    } catch (error: any) {
      setScraping(false);
      setError(error.response?.data?.error || 'Failed to start scraping');
    }
  };

  return (
    <div className="space-y-6">
      {/* Scraping Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Globe className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">Import from Website</h2>
        </div>

        <form onSubmit={handleScrape} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://example.com"
              required
              disabled={scraping}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-100 text-gray-900 placeholder:text-gray-400"
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter your business website URL to automatically extract information
            </p>
          </div>

          <button
            type="submit"
            disabled={scraping}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {scraping ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Importing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Import with AI</span>
              </>
            )}
          </button>
        </form>

        {/* Progress Bar */}
        {progress && scraping && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-blue-900">{progress.message}</p>
              <span className="text-sm text-blue-700">
                {progress.currentPage}/{progress.totalPages}
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    progress.totalPages > 0
                      ? (progress.currentPage / progress.totalPages) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Status: {progress.status.replace('_', ' ')}
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900 font-medium mb-2">What will be imported?</p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Business name and description</li>
            <li>• Products and services</li>
            <li>• Contact information</li>
            <li>• Business hours</li>
            <li>• FAQ and key features</li>
            <li>• Social media links</li>
          </ul>
          <p className="text-sm text-blue-700 mt-3">
            The AI will scrape up to 10 pages from your website to gather comprehensive information.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success */}
      {result && !scraping && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-green-900">Success!</p>
              <p className="text-sm text-green-700 mt-1">
                Your website has been successfully scraped and the AI knowledge base has been
                updated.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Knowledge Tab Component
function KnowledgeTab() {
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit state
  const [aiKnowledge, setAiKnowledge] = useState('');
  const [manualKnowledge, setManualKnowledge] = useState('');

  // Add manual knowledge state
  const [addingKnowledge, setAddingKnowledge] = useState(false);
  const [newKnowledge, setNewKnowledge] = useState('');
  const [newTitle, setNewTitle] = useState('');

  // File upload state
  const [uploadingFile, setUploadingFile] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadKnowledgeBase();
  }, []);

  const loadKnowledgeBase = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getKnowledgeBase();
      const data = response.data.data;
      setKnowledgeBase(data);

      // Parse the combined knowledge to separate AI and manual
      const combined = data.combined_knowledge || '';
      const parts = combined.split('# Additional Knowledge');

      if (parts.length > 1) {
        setAiKnowledge(parts[0].replace('# AI Scraped Knowledge Base\n\n', '').trim());
        setManualKnowledge(parts[1].replace(/^\\n+/, '').trim());
      } else {
        setAiKnowledge(combined.replace('# AI Scraped Knowledge Base\n\n', '').trim());
        setManualKnowledge('');
      }
    } catch (error) {
      console.error('Error loading knowledge base:', error);
      setError('Failed to load knowledge base');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await profileAPI.updateKnowledgeBase({
        ai_knowledge_base: aiKnowledge,
        manual_knowledge: manualKnowledge,
      });
      setSuccess('Knowledge base updated successfully');
      setEditing(false);
      await loadKnowledgeBase();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to update knowledge base');
    } finally {
      setSaving(false);
    }
  };

  const handleAddKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingKnowledge(true);
    setError('');
    setSuccess('');

    try {
      await profileAPI.addManualKnowledge({
        knowledge: newKnowledge,
        title: newTitle || undefined,
      });
      setSuccess('Knowledge added successfully');
      setNewKnowledge('');
      setNewTitle('');
      await loadKnowledgeBase();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to add knowledge');
    } finally {
      setAddingKnowledge(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      await profileAPI.uploadKnowledgeFile(formData);
      setSuccess(`File "${file.name}" uploaded successfully`);
      await loadKnowledgeBase();
      e.target.value = '';
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-12 h-12 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>{success}</span>
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </p>
        </div>
      )}

      {/* Knowledge Base Summary */}
      {knowledgeBase && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Knowledge Base Summary</h3>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {knowledgeBase.sources.scraped ? '✓' : '-'}
              </p>
              <p className="text-sm text-gray-600 mt-1">Website Scraped</p>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {knowledgeBase.sources.files_count}
              </p>
              <p className="text-sm text-gray-600 mt-1">Files Uploaded</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {knowledgeBase.sources.manual ? '✓' : '-'}
              </p>
              <p className="text-sm text-gray-600 mt-1">Manual Knowledge</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex space-x-3">
            <button
              onClick={() => setViewing(!viewing)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>{viewing ? 'Hide' : 'View'} Knowledge Base</span>
            </button>

            <button
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>{editing ? 'Cancel Edit' : 'Edit Knowledge Base'}</span>
            </button>
          </div>

          {/* View Mode */}
          {viewing && !editing && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-900 whitespace-pre-wrap font-mono">
                {knowledgeBase.combined_knowledge || 'No knowledge base content yet.'}
              </pre>
            </div>
          )}

          {/* Edit Mode */}
          {editing && (
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Scraped Knowledge
                </label>
                <textarea
                  value={aiKnowledge}
                  onChange={(e) => setAiKnowledge(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 font-mono text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manual Knowledge
                </label>
                <textarea
                  value={manualKnowledge}
                  onChange={(e) => setManualKnowledge(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 font-mono text-sm resize-none"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Uploaded Files */}
          {knowledgeBase.uploaded_files && knowledgeBase.uploaded_files.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Uploaded Files:</p>
              <div className="space-y-2">
                {knowledgeBase.uploaded_files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.filename}</p>
                        <p className="text-xs text-gray-500">
                          Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Manual Knowledge */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Plus className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">Add Manual Knowledge</h2>
        </div>

        <form onSubmit={handleAddKnowledge} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title (Optional)</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g., Shipping Policy, Refund Terms"
              disabled={addingKnowledge}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-100 text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Knowledge Content</label>
            <textarea
              value={newKnowledge}
              onChange={(e) => setNewKnowledge(e.target.value)}
              placeholder="Enter any additional information you want your AI to know..."
              required
              disabled={addingKnowledge}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-100 text-gray-900 placeholder:text-gray-400 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={addingKnowledge || !newKnowledge.trim()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {addingKnowledge ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>Add Knowledge</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Upload className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">Upload Knowledge Files</h2>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Upload PDF, TXT, DOCX, or MD files to add more information to your AI knowledge base.
        </p>

        <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 cursor-pointer transition-colors">
          <div className="space-y-2 text-center">
            {uploadingFile ? (
              <>
                <Loader className="w-8 h-8 text-purple-600 mx-auto animate-spin" />
                <p className="text-sm text-gray-600">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-purple-600">Click to upload</span> or drag and drop
                </div>
                <p className="text-xs text-gray-500">PDF, TXT, DOCX, MD (max 10MB)</p>
              </>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.txt,.docx,.doc,.md"
            onChange={handleFileUpload}
            disabled={uploadingFile}
          />
        </label>
      </div>
    </div>
  );
}
