import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Search, Filter, Calendar, X, Loader, BarChart, TrendingUp, Download, PieChart } from 'lucide-react';
import { generateGeminiResponse } from '../../lib/gemini';
import { farmManagementApi, FinanceTransaction } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const Finance = () => {
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all' as 'all' | 'income' | 'expense',
    status: 'all' as 'all' | 'pending' | 'completed',
    dateRange: {
      start: '',
      end: ''
    },
    search: ''
  });

  const [newTransaction, setNewTransaction] = useState({
    type: 'expense' as const,
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pending' as const
  });

  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [aiAnalysis, setAIAnalysis] = useState<string>('');
  const [aiLoading, setAILoading] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await farmManagementApi.getTransactions();
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const transaction = await farmManagementApi.createTransaction({
        ...newTransaction,
        amount: parseFloat(newTransaction.amount)
      });
      setTransactions(prev => [transaction, ...prev]);
      setShowModal(false);
      setNewTransaction({
        type: 'expense',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        status: 'pending'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
    }
  };

  const getAIAnalysis = async () => {
    setAILoading(true);
    try {
      const totals = calculateTotals();
      const prompt = `Analyze these financial transactions and provide insights:
        Transactions: ${JSON.stringify(transactions)}
        Total Income: ₹${totals.income}
        Total Expenses: ₹${totals.expenses}
        
        Please provide:
        1. Financial health assessment
        2. Cost optimization suggestions
        3. Revenue improvement opportunities
        4. Cash flow management recommendations
        5. Risk analysis`;

      const response = await generateGeminiResponse(prompt);
      setAIAnalysis(response);
      setShowAIAnalysis(true);
    } catch (error) {
      console.error('Failed to get AI analysis:', error);
    } finally {
      setAILoading(false);
    }
  };

  const handleExport = () => {
    const totals = calculateTotals();
    const content = `Financial Report
Generated on: ${new Date().toLocaleDateString()}

Summary:
Total Income: ₹${totals.income.toLocaleString('en-IN')}
Total Expenses: ₹${totals.expenses.toLocaleString('en-IN')}
Net Balance: ₹${(totals.income - totals.expenses).toLocaleString('en-IN')}

Transactions:
${transactions.map(t => `
Date: ${t.date}
Type: ${t.type}
Category: ${t.category}
Description: ${t.description}
Amount: ₹${t.amount.toLocaleString('en-IN')}
Status: ${t.status}
`).join('\n')}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = filters.type === 'all' || transaction.type === filters.type;
    const matchesStatus = filters.status === 'all' || transaction.status === filters.status;
    const matchesDateRange = (!filters.dateRange.start || transaction.date >= filters.dateRange.start) &&
                           (!filters.dateRange.end || transaction.date <= filters.dateRange.end);
    const matchesSearch = 
      transaction.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      transaction.category.toLowerCase().includes(filters.search.toLowerCase());

    return matchesType && matchesStatus && matchesDateRange && matchesSearch;
  });

  const calculateTotals = () => {
    const filteredTransactions = transactions.filter(transaction => {
      const matchesStatus = filters.status === 'all' || transaction.status === filters.status;
      const matchesDateRange = (!filters.dateRange.start || transaction.date >= filters.dateRange.start) &&
                             (!filters.dateRange.end || transaction.date <= filters.dateRange.end);
      return matchesStatus && matchesDateRange;
    });

    const completed = filteredTransactions.filter(t => t.status === 'completed');
    return {
      income: completed.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
      expenses: completed.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const totals = calculateTotals();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <DollarSign className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Management</h1>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="h-5 w-5" />
          New Transaction
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Income</h3>
            <TrendingUp className="h-6 w-6 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totals.income)}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Expenses</h3>
            <TrendingUp className="h-6 w-6 text-red-500 transform rotate-180" />
          </div>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totals.expenses)}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Net Balance</h3>
            <PieChart className="h-6 w-6 text-blue-500" />
          </div>
          <p className={`text-3xl font-bold ${totals.income - totals.expenses >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(totals.income - totals.expenses)}
          </p>
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
            placeholder="Search transactions..."
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
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
        >
          <Download className="h-5 w-5" />
          Export
        </button>

        <button
          onClick={getAIAnalysis}
          disabled={aiLoading || transactions.length === 0}
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
              <span>Get AI Analysis</span>
            </>
          )}
        </button>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Advanced Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Transaction Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as typeof filters.type }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white dark:bg-gray-700"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as typeof filters.status }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white dark:bg-gray-700"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
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

      {/* Transactions Table */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
            <DollarSign className="h-8 w-8 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No transactions found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {filters.search || filters.type !== 'all' || filters.status !== 'all' || filters.dateRange.start || filters.dateRange.end ? 
              'Try adjusting your filters to see more results.' : 
              'Get started by adding your first financial transaction.'}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add First Transaction
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id || `temp-${transaction.type}-${transaction.date}-${transaction.amount}`} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-gray-200">
                        {new Date(transaction.date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${transaction.type === 'income' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {transaction.type === 'income' ? 'Income' : 'Expense'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-gray-200">
                        {transaction.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 dark:text-gray-200">{transaction.description}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${transaction.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Transaction</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as 'income' | 'expense' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white dark:bg-gray-700"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  required
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white dark:bg-gray-700"
                >
                  <option value="">Select Category</option>
                  {newTransaction.type === 'income' ? (
                    <>
                      <option value="Crop Sales">Crop Sales</option>
                      <option value="Equipment Rental">Equipment Rental</option>
                      <option value="Government Subsidies">Government Subsidies</option>
                      <option value="Other Income">Other Income</option>
                    </>
                  ) : (
                    <>
                      <option value="Seeds">Seeds</option>
                      <option value="Fertilizers">Fertilizers</option>
                      <option value="Equipment">Equipment</option>
                      <option value="Labor">Labor</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Other Expenses">Other Expenses</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white dark:bg-gray-700"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  required
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white dark:bg-gray-700"
                  rows={3}
                  placeholder="Enter transaction details..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={newTransaction.status}
                  onChange={(e) => setNewTransaction({ ...newTransaction, status: e.target.value as 'pending' | 'completed' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white dark:bg-gray-700"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
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
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Analysis Panel */}
      {showAIAnalysis && (
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-300">AI Financial Analysis</h2>
            <button 
              onClick={() => setShowAIAnalysis(false)}
              className="text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="prose prose-blue dark:prose-invert max-w-none">
            <p className="text-blue-800 dark:text-blue-300 whitespace-pre-wrap">{aiAnalysis}</p>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                const blob = new Blob([aiAnalysis], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `financial-analysis-${new Date().toISOString().split('T')[0]}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2 text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <Download className="h-4 w-4" />
              <span>Download Analysis</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;