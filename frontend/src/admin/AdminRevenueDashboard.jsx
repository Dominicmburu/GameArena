import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Users, Calendar, Filter } from 'lucide-react';

const AdminRevenueDashboard = () => {
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all');
  const [privacyFilter, setPrivacyFilter] = useState('all');

  useEffect(() => {
    fetchRevenueData();
  }, [dateFilter, privacyFilter]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      
      if (dateFilter !== 'all') {
        const now = new Date();
        let startDate;
        
        switch(dateFilter) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          default:
            startDate = null;
        }
        
        if (startDate) {
          params.append('startDate', startDate.toISOString());
        }
      }
      
      if (privacyFilter !== 'all') {
        params.append('privacy', privacyFilter);
      }

      const response = await fetch(`/api/competitions/revenue?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch revenue data');
      
      const data = await response.json();
      setRevenueData(data);
    } catch (error) {
      console.error('Error fetching revenue:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents) => {
    return `KSh ${(cents / 100).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading revenue data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!revenueData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 text-white">
            <p className="font-semibold">Error loading revenue data</p>
            <p className="text-sm mt-2">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Platform Revenue Dashboard
            </h1>
            <p className="text-gray-400">Track platform earnings from competitions</p>
          </div>
          
          {/* Filters */}
          <div className="flex gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-purple-500 focus:outline-none"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
            
            <select
              value={privacyFilter}
              onChange={(e) => setPrivacyFilter(e.target.value)}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-purple-500 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="PUBLIC">Public (20%)</option>
              <option value="PRIVATE">Private (15%)</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <DollarSign className="text-green-400" size={24} />
              </div>
              <TrendingUp className="text-green-400" size={20} />
            </div>
            <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-white">
              {formatCurrency(revenueData.total.amount)}
            </p>
            <p className="text-green-400 text-sm mt-2">
              From {revenueData.total.competitions} competitions
            </p>
          </div>

          {/* Public Competitions Revenue */}
          {revenueData.byPrivacy.find(p => p.privacy === 'PUBLIC') && (
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <Users className="text-blue-400" size={24} />
                </div>
                <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs font-semibold">
                  20% FEE
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-1">Public Competitions</p>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(revenueData.byPrivacy.find(p => p.privacy === 'PUBLIC')._sum.amount || 0)}
              </p>
              <p className="text-blue-400 text-sm mt-2">
                {revenueData.byPrivacy.find(p => p.privacy === 'PUBLIC')._count} competitions
              </p>
            </div>
          )}

          {/* Private Competitions Revenue */}
          {revenueData.byPrivacy.find(p => p.privacy === 'PRIVATE') && (
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-500/20 p-3 rounded-lg">
                  <Users className="text-purple-400" size={24} />
                </div>
                <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs font-semibold">
                  15% FEE
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-1">Private Competitions</p>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(revenueData.byPrivacy.find(p => p.privacy === 'PRIVATE')._sum.amount || 0)}
              </p>
              <p className="text-purple-400 text-sm mt-2">
                {revenueData.byPrivacy.find(p => p.privacy === 'PRIVATE')._count} competitions
              </p>
            </div>
          )}
        </div>

        {/* Recent Revenue Table */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl backdrop-blur-sm overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Calendar className="text-purple-400" size={20} />
              <h2 className="text-xl font-bold text-white">Recent Revenue Entries</h2>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Competition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Fee %
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Players
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {revenueData.recent.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                      No revenue data available for selected filters
                    </td>
                  </tr>
                ) : (
                  revenueData.recent.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{entry.competitionTitle}</p>
                          <p className="text-gray-400 text-sm">Code: {entry.competitionCode}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          entry.privacy === 'PUBLIC' 
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-purple-500/20 text-purple-300'
                        }`}>
                          {entry.privacy}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-white font-mono">
                          {entry.feePercentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-white">
                          {entry.playersJoined}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-green-400 font-semibold">
                          {formatCurrency(entry.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-400 text-sm">
                          {new Date(entry.createdAt).toLocaleDateString('en-KE', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRevenueDashboard;