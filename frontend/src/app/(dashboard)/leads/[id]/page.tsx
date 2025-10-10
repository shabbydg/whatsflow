'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { leadsAPI } from '@/lib/api';
import {
  ArrowLeft,
  Building,
  Briefcase,
  MapPin,
  Mail,
  Globe,
  Users,
  Calendar,
  Flame,
  TrendingUp,
  Snowflake,
  Award,
  AlertCircle,
  Target,
  Clock,
  MessageCircle,
  CheckCircle,
  XCircle,
  StickyNote,
  Activity,
  Sparkles
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

interface LeadDetail {
  id: string;
  contact_id: string;
  contact_name: string;
  phone_number: string;
  profile_pic_url?: string;
  company_name?: string;
  job_title?: string;
  industry?: string;
  team_size?: string;
  location?: string;
  email?: string;
  website?: string;
  street_address?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  pain_points?: string[];
  interests?: string[];
  intent_keywords?: string[];
  budget_range?: string;
  timeline?: string;
  decision_stage: string;
  lead_score: number;
  lead_temperature: 'hot' | 'warm' | 'cold';
  lead_status: string;
  is_qualified: boolean;
  qualification_notes?: string;
  conversation_summary?: string;
  next_best_action?: string;
  first_interaction_at: string;
  last_interaction_at: string;
  total_interactions: number;
  messages_received: number;
  messages_sent: number;
  activities?: any[];
}

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    contact_name: '',
    phone_number: '',
    email: '',
    company_name: '',
    job_title: '',
    industry: '',
    team_size: '',
    website: '',
    location: '',
    street_address: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: '',
  });

  useEffect(() => {
    loadLead();
  }, [leadId]);

  const loadLead = async () => {
    try {
      const response = await leadsAPI.getById(leadId);
      setLead(response.data.lead);
    } catch (error) {
      console.error('Error loading lead:', error);
      router.push('/leads');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setUpdating(true);
      await leadsAPI.updateStatus(leadId, newStatus);
      await loadLead();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await leadsAPI.addNote(leadId, newNote);
      setNewNote('');
      setShowNoteModal(false);
      await loadLead();
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleQualify = async (qualified: boolean) => {
    try {
      setUpdating(true);
      await leadsAPI.qualifyLead(leadId, qualified);
      await loadLead();
    } catch (error) {
      console.error('Error qualifying lead:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenEditModal = () => {
    if (lead) {
      setEditForm({
        contact_name: lead.contact_name || '',
        phone_number: lead.phone_number || '',
        email: lead.email || '',
        company_name: lead.company_name || '',
        job_title: lead.job_title || '',
        industry: lead.industry || '',
        team_size: lead.team_size || '',
        website: lead.website || '',
        location: lead.location || '',
        street_address: lead.street_address || '',
        city: lead.city || '',
        state_province: lead.state_province || '',
        postal_code: lead.postal_code || '',
        country: lead.country || '',
      });
      setShowEditModal(true);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await leadsAPI.updateProfile(leadId, editForm);
      setShowEditModal(false);
      await loadLead();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getTemperatureColor = (temp: string) => {
    switch (temp) {
      case 'hot': return 'bg-red-100 text-red-800 border-red-200';
      case 'warm': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cold': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTemperatureIcon = (temp: string) => {
    switch (temp) {
      case 'hot': return <Flame className="w-5 h-5" />;
      case 'warm': return <TrendingUp className="w-5 h-5" />;
      case 'cold': return <Snowflake className="w-5 h-5" />;
      default: return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!lead) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/leads"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          {lead.profile_pic_url ? (
            <img 
              src={lead.profile_pic_url} 
              alt={lead.contact_name}
              className="w-16 h-16 rounded-full object-cover border-2 border-purple-200"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center border-2 border-purple-200">
              <span className="text-white font-bold text-2xl">
                {lead.contact_name?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{lead.contact_name}</h1>
            <p className="text-gray-600 mt-1">{lead.phone_number}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleOpenEditModal}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Edit Details
          </button>
          <span className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium border ${getTemperatureColor(lead.lead_temperature)}`}>
            {getTemperatureIcon(lead.lead_temperature)}
            <span className="capitalize">{lead.lead_temperature} Lead</span>
          </span>
          {lead.is_qualified && (
            <div className="bg-green-100 border border-green-300 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-800">Qualified Lead</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Score Card */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Lead Score</p>
                <p className="text-5xl font-bold mt-2">{lead.lead_score}</p>
                <p className="text-purple-100 text-sm mt-1">out of 100</p>
              </div>
              <div className="bg-white/20 rounded-full p-4">
                <Award className="w-12 h-12" />
              </div>
            </div>
            <div className="mt-4 bg-white/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">AI Analysis</span>
              </div>
              <p className="text-sm text-purple-50">
                {lead.conversation_summary || 'No conversation summary available yet'}
              </p>
            </div>
          </div>

          {/* Company Profile */}
          {(lead.company_name || lead.job_title || lead.industry) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Company Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lead.company_name && (
                  <div className="flex items-start space-x-3">
                    <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="font-medium text-gray-900">{lead.company_name}</p>
                    </div>
                  </div>
                )}
                {lead.job_title && (
                  <div className="flex items-start space-x-3">
                    <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Job Title</p>
                      <p className="font-medium text-gray-900">{lead.job_title}</p>
                    </div>
                  </div>
                )}
                {lead.industry && (
                  <div className="flex items-start space-x-3">
                    <Target className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Industry</p>
                      <p className="font-medium text-gray-900">{lead.industry}</p>
                    </div>
                  </div>
                )}
                {lead.team_size && (
                  <div className="flex items-start space-x-3">
                    <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Team Size</p>
                      <p className="font-medium text-gray-900">{lead.team_size}</p>
                    </div>
                  </div>
                )}
                {lead.location && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium text-gray-900">{lead.location}</p>
                    </div>
                  </div>
                )}
                {lead.email && (
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{lead.email}</p>
                    </div>
                  </div>
                )}
                {lead.website && (
                  <div className="flex items-start space-x-3">
                    <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Website</p>
                      <a 
                        href={lead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-purple-600 hover:text-purple-700"
                      >
                        {lead.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact & Address Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contact & Address Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lead.email && (
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{lead.email}</p>
                  </div>
                </div>
              )}
              {lead.phone_number && (
                <div className="flex items-start space-x-3">
                  <MessageCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{lead.phone_number}</p>
                  </div>
                </div>
              )}
              {lead.street_address && (
                <div className="flex items-start space-x-3 md:col-span-2">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium text-gray-900">
                      {lead.street_address}
                      {lead.city && `, ${lead.city}`}
                      {lead.state_province && `, ${lead.state_province}`}
                      {lead.postal_code && ` ${lead.postal_code}`}
                      {lead.country && `, ${lead.country}`}
                    </p>
                  </div>
                </div>
              )}
              {!lead.street_address && (lead.city || lead.state_province || lead.postal_code || lead.country) && (
                <div className="flex items-start space-x-3 md:col-span-2">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Location Details</p>
                    <p className="font-medium text-gray-900">
                      {[lead.city, lead.state_province, lead.postal_code, lead.country]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lead Intelligence */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Lead Intelligence</h2>
            <div className="space-y-6">
              {/* Pain Points */}
              {lead.pain_points && lead.pain_points.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span>Pain Points</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {lead.pain_points.map((point, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm border border-orange-200"
                      >
                        {point}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests */}
              {lead.interests && lead.interests.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                    <Target className="w-4 h-4 text-green-500" />
                    <span>Interests</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {lead.interests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm border border-green-200"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Intent Keywords */}
              {lead.intent_keywords && lead.intent_keywords.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span>Buying Intent Keywords</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {lead.intent_keywords.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm border border-purple-200 font-medium"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Budget & Timeline */}
              <div className="grid grid-cols-2 gap-4">
                {lead.budget_range && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-blue-700 font-medium">Budget Signals</p>
                    <p className="text-lg font-semibold text-blue-900 mt-1">{lead.budget_range}</p>
                  </div>
                )}
                {lead.timeline && (
                  <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                    <p className="text-sm text-indigo-700 font-medium">Timeline</p>
                    <p className="text-lg font-semibold text-indigo-900 mt-1">{lead.timeline}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Next Best Action */}
          {lead.next_best_action && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <div className="bg-green-600 rounded-full p-2">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Suggested Next Action</h3>
                  <p className="text-gray-700 mt-2">{lead.next_best_action}</p>
                </div>
              </div>
            </div>
          )}

          {/* Activity Timeline */}
          {lead.activities && lead.activities.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Activity className="w-6 h-6" />
                <span>Activity Timeline</span>
              </h2>
              <div className="space-y-4">
                {lead.activities.slice(0, 10).map((activity: any, idx: number) => (
                  <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
                    <div className="bg-purple-100 rounded-full p-2">
                      <Activity className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(activity.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href={`/messages?contact=${lead.contact_id}`}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>View Conversation</span>
              </Link>

              <button
                onClick={() => setShowNoteModal(true)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
              >
                <StickyNote className="w-4 h-4" />
                <span>Add Note</span>
              </button>

              {!lead.is_qualified ? (
                <button
                  onClick={() => handleQualify(true)}
                  disabled={updating}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark as Qualified</span>
                </button>
              ) : (
                <button
                  onClick={() => handleQualify(false)}
                  disabled={updating}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Disqualify</span>
                </button>
              )}
            </div>
          </div>

          {/* Lead Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Lead Status</h2>
            <select
              value={lead.lead_status}
              onChange={(e) => handleUpdateStatus(e.target.value)}
              disabled={updating}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal Sent</option>
              <option value="negotiation">Negotiation</option>
              <option value="closed_won">Closed Won</option>
              <option value="closed_lost">Closed Lost</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Current: <span className="font-medium capitalize">{lead.lead_status.replace('_', ' ')}</span>
            </p>
          </div>

          {/* Engagement Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Engagement</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Decision Stage</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">{lead.decision_stage}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Total Interactions</span>
                  <span className="text-sm font-medium text-gray-900">{lead.total_interactions}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Messages Received</span>
                  <span className="text-sm font-medium text-gray-900">{lead.messages_received}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Messages Sent</span>
                  <span className="text-sm font-medium text-gray-900">{lead.messages_sent}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                  <Clock className="w-4 h-4" />
                  <span>First Contact</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{formatDate(lead.first_interaction_at)}</p>
              </div>
              <div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>Last Contact</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{formatDate(lead.last_interaction_at)}</p>
              </div>
            </div>
          </div>

          {/* Qualification Notes */}
          {lead.is_qualified && lead.qualification_notes && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-900">Qualification Notes</span>
              </div>
              <p className="text-sm text-green-700">{lead.qualification_notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Note</h2>
            <form onSubmit={handleAddNote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note
                </label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Enter your note..."
                  rows={4}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 placeholder-gray-500"
                />
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Add Note
                </button>
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="flex-1 px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Lead Details Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Lead Details</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Profile Photo Display */}
              <div className="flex items-center space-x-4 pb-6 border-b border-gray-200">
                {lead?.profile_pic_url ? (
                  <img 
                    src={lead.profile_pic_url} 
                    alt={lead.contact_name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-purple-200"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center border-2 border-purple-200">
                    <span className="text-white font-bold text-2xl">
                      {editForm.contact_name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Profile Photo</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Profile photos are automatically synced from WhatsApp
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={editForm.contact_name}
                      onChange={(e) => setEditForm({ ...editForm, contact_name: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone_number}
                      onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={editForm.company_name}
                      onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={editForm.job_title}
                      onChange={(e) => setEditForm({ ...editForm, job_title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry
                    </label>
                    <input
                      type="text"
                      value={editForm.industry}
                      onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Team Size
                    </label>
                    <input
                      type="text"
                      value={editForm.team_size}
                      onChange={(e) => setEditForm({ ...editForm, team_size: e.target.value })}
                      placeholder="e.g., 1-10, 11-50"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={editForm.website}
                      onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      General Location
                    </label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      placeholder="e.g., San Francisco Bay Area"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={editForm.street_address}
                      onChange={(e) => setEditForm({ ...editForm, street_address: e.target.value })}
                      placeholder="123 Main Street"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={editForm.city}
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State/Province
                      </label>
                      <input
                        type="text"
                        value={editForm.state_province}
                        onChange={(e) => setEditForm({ ...editForm, state_province: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={editForm.postal_code}
                        onChange={(e) => setEditForm({ ...editForm, postal_code: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={editForm.country}
                      onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={updating}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

