import React, { useState, useEffect } from 'react';
import { Tractor, Plus, Search, Filter, Calendar, X, Loader, AlertCircle, ArrowRight, Download, BarChart } from 'lucide-react';
import { generateGeminiResponse } from '../../lib/gemini';
import { farmManagementApi, Operation } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const FarmOperations = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    dateRange: {
      start: '',
      end: ''
    },
    search: ''
  });

  const [newOperation, setNewOperation] = useState({
    title: '',
    type: '',
    field: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pending' as const,
    description: ''
  });

  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAIInsights] = useState<string>('');
  const [aiLoading, setAILoading] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    fetchOperations();
  }, []);

  const fetchOperations = async () => {
    try {
      setLoading(true);
      const data = await farmManagementApi.getOperations();
      setOperations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load operations');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOperation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const operation = await farmManagementApi.createOperation(newOperation);
      setOperations(prev => [operation, ...prev]);
      setShowModal(false);
      setNewOperation({
        title: '',
        type: '',
        field: '',
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        description: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create operation');
    }
  };

  const getAIInsights = async () => {
    setAILoading(true);
    try {
      const prompt = `Analyze these farm operations and provide insights:
        ${JSON.stringify(operations)}
        
        Please provide:
        1. Efficiency improvements
        2. Resource optimization suggestions
        3. Risk assessment
        4. Best practices recommendations`;

      const response = await generateGeminiResponse(prompt);
      setAIInsights(response);
      setShowAIInsights(true);
    } catch (error) {
      console.error('Failed to get AI insights:', error);
    } finally {
      setAILoading(false);
    }
  };

  const handleExportOperations = () => {
    const content = `Farm Operations Report
Generated on: ${new Date().toLocaleDateString()}

${operations.map(op => `
Operation: ${op.title}
Type: ${op.type}
Field: ${op.field}
Date: ${op.date}
Status: ${op.status}
Description: ${op.description}
`).join('\n---\n')}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `farm-operations-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredOperations = operations.filter(operation => {
    const matchesType = filters.type === 'all' || operation.type === filters.type;
    const matchesStatus = filters.status === 'all' || operation.status === filters.status;
    const matchesDateRange = (!filters.dateRange.start || operation.date >= filters.dateRange.start) &&
                           (!filters.dateRange.end || operation.date <= filters.dateRange.end);
    const matchesSearch = 
      operation.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      operation.type.toLowerCase().includes(filters.search.toLowerCase()) ||
      operation.description.toLowerCase().includes(filters.search.toLowerCase());

    return matchesType && matchesStatus && matchesDateRange && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader className="h-10 w-10 text-green-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (error && operations.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-6 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-6 w-6 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-lg">Error Loading Operations</h3>
            <p>{error}</p>
            <button 
              onClick={fetchOperations}
              className="mt-2 text-red-600 dark:text-red-400 underline"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Tractor className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Farm Operations</h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            New Operation
          </button>
          <button
            onClick={handleExportOperations}
            className="flex items-center gap-2 px-4 py-2 border border-green-600 text-green-600 dark:text-green-500 dark:border-green-500 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          >
            <Download className="h-5 w-5" />
            Export
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            placeholder="Search operations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:placeholder-gray-400"
          />
        </div>

        {/* Date Range Picker */}
        <div className="relative">
          <button
            onClick={() => setShowDateRangePicker(!showDateRangePicker)}
            className={`flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
              (filters.dateRange.start || filters.dateRange.end) ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <Calendar className="h-5 w-5" />
            <span>
              {filters.dateRange.start || filters.dateRange.end ? 
                `${filters.dateRange.start || 'Start'} - ${filters.dateRange.end || 'End'}` : 
                'Date Range'
              }
            </span>
          </button>

          {showDateRangePicker && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white dark:bg-gray-700"
                  />
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        dateRange: { start: '', end: '' }
                      }));
                      setShowDateRangePicker(false);
                    }}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm"
                  >
                    Clear Dates
                  </button>
                  <button
                    onClick={() => setShowDateRangePicker(false)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
            showFilters ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          <Filter className="h-5 w-5" />
          Filters
        </button>

        <button
          onClick={getAIInsights}
          disabled={aiLoading || operations.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {aiLoading ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <BarChart className="h-5 w-5" />
              <span>Get AI Insights</span>
            </>
          )}
        </button>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Advanced Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Operation Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white dark:bg-gray-700"
              >
                <option value="all">All Types</option>
                {Array.from(new Set(operations.map(op => op.type))).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Field
              </label>
              <select
                value={filters.field}
                onChange={(e) => setFilters(prev => ({ ...prev, field: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white dark:bg-gray-700"
              >
                <option value="all">All Fields</option>
                {Array.from(new Set(operations.map(op => op.field))).map(field => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white dark:bg-gray-700"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setFilters({
                type: 'all',
                status: 'all',
                dateRange: { start: '', end: '' },
                search: ''
              })}
              className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Operations Table */}
      {filteredOperations.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
            <Tractor className="h-8 w-8 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No operations found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {filters.search || filters.type !== 'all' || filters.status !== 'all' || filters.dateRange.start || filters.dateRange.end ? 
              'Try adjusting your filters to see more results.' : 
              'Get started by adding your first farm operation.'}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add First Operation
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Field
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOperations.map((operation) => (
                  <tr key={operation.id || `temp-${operation.title}-${operation.date}`} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {operation.title}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-gray-200">{operation.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-gray-200">{operation.field}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-gray-200">
                        {new Date(operation.date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(operation.status)}`}>
                        {operation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 dark:text-gray-200">{operation.description}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Operation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Operation</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddOperation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={newOperation.title}
                  onChange={(e) => setNewOperation({ ...newOperation, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white dark:bg-gray-700"
                  placeholder="Operation title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <input
                  type="text"
                  required
                  value={newOperation.type}
                  onChange={(e) => setNewOperation({ ...newOperation, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white dark:bg-gray-700"
                  placeholder="e.g., Planting, Irrigation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Field
                </label>
                <input
                  type="text"
                  required
                  value={newOperation.field}
                  onChange={(e) => setNewOperation({ ...newOperation, field: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white dark:bg-gray-700"
                  placeholder="e.g., North Field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={newOperation.date}
                  onChange={(e) => setNewOperation({ ...newOperation, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={newOperation.status}
                  onChange={(e) => setNewOperation({ ...newOperation, status: e.target.value as 'pending' | 'in-progress' | 'completed' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white dark:bg-gray-700"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  required
                  value={newOperation.description}
                  onChange={(e) => setNewOperation({ ...newOperation, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white dark:bg-gray-700"
                  rows={3}
                  placeholder="Enter operation details..."
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Operation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Insights Panel */}
      {showAIInsights && (
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-300">AI Operations Insights</h2>
            <button 
              onClick={() => setShowAIInsights(false)}
              className="text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="prose prose-blue dark:prose-invert max-w-none">
            <p className="text-blue-800 dark:text-blue-300 whitespace-pre-wrap">{aiInsights}</p>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                const blob = new Blob([aiInsights], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `farm-operations-insights-${new Date().toISOString().split('T')[0]}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2 text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <Download className="h-4 w-4" />
              <span>Download Insights</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmOperations;