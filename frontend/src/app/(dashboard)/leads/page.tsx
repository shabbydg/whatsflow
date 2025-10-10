'use client';

import { useEffect, useState } from 'react';
import { leadsAPI } from '@/lib/api';
import { 
  Flame, 
  Snowflake, 
  TrendingUp, 
  Users, 
  Filter,
  Search,
  ChevronRight,
  Sparkles,
  Target,
  Award,
  CheckCircle
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

interface Lead {
  id: string;
  contact_id: string;
  contact_name: string;
  phone_number: string;
  company_name?: string;
  job_title?: string;
  lead_score: number;
  lead_temperature: 'hot' | 'warm' | 'cold';
  decision_stage: string;
  lead_status: string;
  is_qualified: boolean;
  conversation_summary?: string;
  last_interaction_at: string;
  total_interactions: number;
}

interface LeadStats {
  total_leads: number;
  hot_leads: number;
  warm_leads: number;
  cold_leads: number;
  avg_score: number;
  decision_ready: number;
  qualified_leads: number;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterTemp, setFilterTemp] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const leadsPerPage = 10;

  useEffect(() => {
    loadLeads();
    loadStats();
  }, [filterTemp, currentPage]);

  const loadLeads = async () => {
    try {
      const params: any = {
        page: currentPage,
        limit: leadsPerPage
      };
      if (filterTemp !== 'all') {
        params.temperature = filterTemp;
      }
      const response = await leadsAPI.getAll(params);
      setLeads(response.data.leads || []);
      
      // If API returns pagination info, use it, otherwise calculate from current data
      if (response.data.pagination) {
        setTotalLeads(response.data.pagination.total);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setTotalLeads((response.data.leads || []).length);
        setTotalPages(Math.ceil((response.data.leads || []).length / leadsPerPage));
      }
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await leadsAPI.getStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // For now, we'll do client-side filtering for search since backend doesn't support it yet
  const filteredLeads = leads.filter(lead => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      lead.contact_name?.toLowerCase().includes(search) ||
      lead.company_name?.toLowerCase().includes(search) ||
      lead.phone_number?.includes(search)
    );
  });

  // Reset to page 1 when filter changes
  const handleFilterChange = (newFilter: 'all' | 'hot' | 'warm' | 'cold') => {
    setFilterTemp(newFilter);
    setCurrentPage(1);
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
      case 'hot': return <Flame className="w-4 h-4" />;
      case 'warm': return <TrendingUp className="w-4 h-4" />;
      case 'cold': return <Snowflake className="w-4 h-4" />;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lead Intelligence</h1>
          <p className="text-gray-600 mt-1">AI-powered lead generation from conversations</p>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_leads}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow p-6 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">🔥 Hot Leads</p>
                <p className="text-2xl font-bold text-red-900 mt-1">{stats.hot_leads}</p>
              </div>
              <Flame className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow p-6 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700">Warm Leads</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">{stats.warm_leads}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Decision Ready</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.decision_ready}</p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 placeholder-gray-500"
            />
          </div>

          {/* Temperature Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterTemp}
              onChange={(e) => handleFilterChange(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900"
            >
              <option value="all">All Temperatures</option>
              <option value="hot">🔥 Hot</option>
              <option value="warm">📈 Warm</option>
              <option value="cold">❄️ Cold</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredLeads.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No leads found</p>
            <p className="text-sm text-gray-500 mt-2">Start conversations to generate leads automatically</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredLeads.map((lead) => (
              <Link
                key={lead.id}
                href={`/leads/${lead.id}`}
                className="block hover:bg-gray-50 transition-colors"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    {/* Lead Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {lead.contact_name?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {lead.contact_name || lead.phone_number}
                            </h3>
                            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getTemperatureColor(lead.lead_temperature)}`}>
                              {getTemperatureIcon(lead.lead_temperature)}
                              <span className="capitalize">{lead.lead_temperature}</span>
                            </span>
                            {lead.is_qualified && (
                              <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                <CheckCircle className="w-3 h-3" />
                                <span>Qualified</span>
                              </span>
                            )}
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              lead.lead_status === 'qualified' ? 'bg-blue-100 text-blue-800' :
                              lead.lead_status === 'closed_won' ? 'bg-green-100 text-green-800' :
                              lead.lead_status === 'closed_lost' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {lead.lead_status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </div>
                          {lead.company_name && (
                            <p className="text-sm text-gray-600 mt-1">
                              {lead.job_title ? `${lead.job_title} at ` : ''}{lead.company_name}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 mt-1">{lead.phone_number}</p>
                        </div>
                      </div>

                      {/* Conversation Summary */}
                      {lead.conversation_summary && (
                        <p className="text-sm text-gray-700 mt-3 line-clamp-2">
                          💬 {lead.conversation_summary}
                        </p>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center space-x-6 mt-3 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Award className="w-4 h-4" />
                          <span className={`font-medium ${getScoreColor(lead.lead_score)}`}>
                            Score: {lead.lead_score}/100
                          </span>
                        </span>
                        <span>
                          Stage: <span className="font-medium capitalize">{lead.decision_stage}</span>
                        </span>
                        <span>
                          {lead.total_interactions} interactions
                        </span>
                        <span>
                          Last: {formatDate(lead.last_interaction_at)}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 text-gray-400 mt-2" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * leadsPerPage) + 1} to {Math.min(currentPage * leadsPerPage, totalLeads)} of {totalLeads} leads
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === pageNum
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="bg-purple-600 rounded-full p-2">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">AI-Powered Lead Generation</h3>
            <p className="text-gray-700 mt-2">
              WhatsFlow automatically analyzes your WhatsApp conversations to:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>✅ Extract company info, job titles, and contact details</li>
              <li>✅ Detect buying intent and readiness to purchase</li>
              <li>✅ Score leads based on engagement and signals (0-100)</li>
              <li>✅ Identify pain points and interests</li>
              <li>✅ Categorize leads as Hot 🔥, Warm 📈, or Cold ❄️</li>
            </ul>
            <p className="text-sm text-purple-700 mt-3 font-medium">
              💡 No manual data entry needed - everything happens automatically!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

