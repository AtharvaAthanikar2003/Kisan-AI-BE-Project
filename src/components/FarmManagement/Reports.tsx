import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, RefreshCw, Brain, Loader, AlertTriangle, X } from 'lucide-react';
import { generateGeminiResponse } from '../../lib/gemini';

interface Report {
  id: string;
  title: string;
  type: 'financial' | 'operations' | 'inventory' | 'workforce' | 'analytics';
  date: string;
  status: 'generated' | 'generating' | 'failed';
  summary: string;
  insights?: string;
  amount?: number;
}

interface Filters {
  type: string;
  dateRange: {
    start: string;
    end: string;
  };
  search: string;
}

const Reports = () => {
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      title: 'Monthly Financial Summary',
      type: 'financial',
      date: '2024-03-15',
      status: 'generated',
      summary: 'Revenue: ₹50,000\nExpenses: ₹30,000\nProfit: ₹20,000',
      insights: 'Profit margin increased by 15% compared to last month',
      amount: 50000
    },
    {
      id: '2',
      title: 'Crop Yield Analysis',
      type: 'operations',
      date: '2024-03-14',
      status: 'generated',
      summary: 'Wheat: 25 tons/acre\nCorn: 30 tons/acre\nRevenue: ₹75,000',
      insights: 'Wheat yield improved by 10% due to optimized irrigation',
      amount: 75000
    }
  ]);

  const [selectedType, setSelectedType] = useState<string>('all');
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [aiAnalysis, setAIAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    type: 'all',
    dateRange: {
      start: '',
      end: ''
    },
    search: ''
  });

  const [newReport, setNewReport] = useState({
    title: '',
    type: 'financial' as const,
    date: new Date().toISOString().split('T')[0],
    summary: '',
    amount: ''
  });

  const reportTypes = [
    { id: 'all', label: 'All Reports' },
    { id: 'financial', label: 'Financial' },
    { id: 'operations', label: 'Operations' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'workforce', label: 'Workforce' },
    { id: 'analytics', label: 'Analytics' }
  ];

  const handleAddReport = (e: React.FormEvent) => {
    e.preventDefault();
    const report: Report = {
      id: Date.now().toString(),
      ...newReport,
      amount: parseFloat(newReport.amount) || 0,
      status: 'generated',
      insights: 'AI analysis pending'
    };
    setReports([...reports, report]);
    setShowModal(false);
    setNewReport({
      title: '',
      type: 'financial',
      date: new Date().toISOString().split('T')[0],
      summary: '',
      amount: ''
    });
  };

  const getAIAnalysis = async () => {
    setLoading(true);
    try {
      const prompt = `Analyze these farm management reports and provide insights:
        Reports Data: ${JSON.stringify(reports)}
        
        Please provide:
        1. Key performance indicators analysis
        2. Trend identification and patterns
        3. Areas of improvement
        4. Risk factors and mitigation strategies
        5. Recommendations for optimization`;

      const response = await generateGeminiResponse(prompt);
      setAIAnalysis(response);
      setShowAIAnalysis(true);
    } catch (error) {
      console.error('Failed to get AI analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (report: Report) => {
    const content = `
Report: ${report.title}
Type: ${report.type}
Date: ${report.date}
Status: ${report.status}
Amount: ₹${report.amount?.toLocaleString('en-IN')}

Summary:
${report.summary}

Insights:
${report.insights || 'No insights available'}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.toLowerCase().replace(/\s+/g, '-')}-${report.date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredReports = reports.filter(report => {
    const matchesType = filters.type === 'all' || report.type === filters.type;
    const matchesSearch = report.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         report.summary.toLowerCase().includes(filters.search.toLowerCase());
    const matchesDateRange = (!filters.dateRange.start || report.date >= filters.dateRange.start) &&
                           (!filters.dateRange.end || report.date <= filters.dateRange.end);
    
    return matchesType && matchesSearch && matchesDateRange;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <FileText className="h-5 w-5" />
          Generate New Report
        </button>
      </div>

      {/* Report Type Filter */}
      <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
        {reportTypes.map(type => (
          <button
            key={type.id}
            onClick={() => setFilters(prev => ({ ...prev, type: type.id }))}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              filters.type === type.id
                ? 'bg-green-50 text-green-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            placeholder="Search reports..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
          />
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 ${
            showFilters ? 'bg-green-50 text-green-600' : ''
          }`}
        >
          <Filter className="h-5 w-5" />
          Filters
        </button>
        <button
          onClick={getAIAnalysis}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Get AI Analysis
        </button>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Date Range Filter</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, start: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, end: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setFilters({
                type: 'all',
                dateRange: { start: '', end: '' },
                search: ''
              })}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                  <p className="text-sm text-gray-500">
                    Generated on {new Date(report.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${report.status === 'generated' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {report.status}
              </span>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Summary</h4>
                <pre className="text-sm text-gray-900 whitespace-pre-wrap font-sans">
                  {report.summary.replace(/₹\d+/g, match => formatCurrency(parseInt(match.slice(1))))}
                </pre>
              </div>

              {report.insights && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-700 mb-2">Key Insights</h4>
                  <p className="text-sm text-blue-600">{report.insights}</p>
                </div>
              )}

              <div className="flex justify-end">
                <button 
                  onClick={() => handleDownload(report)}
                  className="flex items-center gap-2 text-green-600 hover:text-green-700"
                >
                  <Download className="h-4 w-4" />
                  <span className="text-sm">Download Report</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Generate Report Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Generate New Report</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddReport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Title
                </label>
                <input
                  type="text"
                  required
                  value={newReport.title}
                  onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  placeholder="Enter report title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Type
                </label>
                <select
                  value={newReport.type}
                  onChange={(e) => setNewReport({ ...newReport, type: e.target.value as Report['type'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                >
                  <option value="financial">Financial</option>
                  <option value="operations">Operations</option>
                  <option value="inventory">Inventory</option>
                  <option value="workforce">Workforce</option>
                  <option value="analytics">Analytics</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={newReport.date}
                  onChange={(e) => setNewReport({ ...newReport, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={newReport.amount}
                  onChange={(e) => setNewReport({ ...newReport, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  placeholder="Enter amount in INR"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Summary
                </label>
                <textarea
                  required
                  value={newReport.summary}
                  onChange={(e) => setNewReport({ ...newReport, summary: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  rows={4}
                  placeholder="Enter report summary..."
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Generate Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Analysis Panel */}
      {showAIAnalysis && (
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">AI Report Analysis</h2>
          <div className="prose prose-blue max-w-none">
            <p className="text-blue-800 whitespace-pre-wrap">{aiAnalysis}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;