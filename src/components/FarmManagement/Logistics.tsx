import React, { useState, useEffect } from 'react';
import { Truck, Plus, Search, Filter, Calendar, MapPin, Package, Clock, X } from 'lucide-react';
import { generateGeminiResponse } from '../../lib/gemini';
import { farmManagementApi, LogisticsShipment } from '../../lib/supabase';

const Logistics = () => {
  const [shipments, setShipments] = useState<LogisticsShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all' as 'all' | 'inbound' | 'outbound',
    status: 'all' as 'all' | 'pending' | 'in-transit' | 'delivered',
    dateRange: {
      start: '',
      end: ''
    },
    search: ''
  });

  const [newShipment, setNewShipment] = useState({
    type: 'outbound' as const,
    cargo: '',
    origin: '',
    destination: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pending' as const,
    vehicle: '',
    quantity: ''
  });

  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAIInsights] = useState<string>('');
  const [aiLoading, setAILoading] = useState(false);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const data = await farmManagementApi.getShipments();
      setShipments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const shipment = await farmManagementApi.createShipment(newShipment);
      setShipments(prev => [shipment, ...prev]);
      setShowModal(false);
      setNewShipment({
        type: 'outbound',
        cargo: '',
        origin: '',
        destination: '',
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        vehicle: '',
        quantity: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create shipment');
    }
  };

  const getAIInsights = async () => {
    setAILoading(true);
    try {
      const prompt = `Analyze these logistics operations and provide insights:
        Shipments: ${JSON.stringify(shipments)}
        
        Please provide:
        1. Route optimization suggestions
        2. Delivery efficiency improvements
        3. Resource allocation recommendations
        4. Cost reduction opportunities
        5. Risk assessment and mitigation strategies`;

      const response = await generateGeminiResponse(prompt);
      setAIInsights(response);
      setShowAIInsights(true);
    } catch (error) {
      console.error('Failed to get AI insights:', error);
    } finally {
      setAILoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in-transit':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredShipments = shipments.filter(shipment => {
    const matchesType = filters.type === 'all' || shipment.type === filters.type;
    const matchesStatus = filters.status === 'all' || shipment.status === filters.status;
    const matchesDateRange = (!filters.dateRange.start || shipment.date >= filters.dateRange.start) &&
                           (!filters.dateRange.end || shipment.date <= filters.dateRange.end);
    const matchesSearch = 
      shipment.cargo.toLowerCase().includes(filters.search.toLowerCase()) ||
      shipment.origin.toLowerCase().includes(filters.search.toLowerCase()) ||
      shipment.destination.toLowerCase().includes(filters.search.toLowerCase()) ||
      shipment.vehicle.toLowerCase().includes(filters.search.toLowerCase());

    return matchesType && matchesStatus && matchesDateRange && matchesSearch;
  });

  const stats = {
    activeShipments: shipments.filter(s => s.status === 'in-transit').length,
    pendingDeliveries: shipments.filter(s => s.status === 'pending').length,
    completedToday: shipments.filter(s => 
      s.status === 'delivered' && 
      s.date === new Date().toISOString().split('T')[0]
    ).length
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Truck className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Logistics Management</h1>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="h-5 w-5" />
          New Shipment
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Shipments</h3>
            <Truck className="h-6 w-6 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {stats.activeShipments}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pending Deliveries</h3>
            <Package className="h-6 w-6 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-yellow-600">
            {stats.pendingDeliveries}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Completed Today</h3>
            <Clock className="h-6 w-6 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-600">
            {stats.completedToday}
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            placeholder="Search shipments..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
          />
        </div>

        {/* Date Range Picker */}
        <div className="relative">
          <button
            onClick={() => setShowDateRangePicker(!showDateRangePicker)}
            className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 ${
              (filters.dateRange.start || filters.dateRange.end) ? 'bg-green-50 text-green-600' : ''
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
            <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg p-4 z-50">
              <div className="space-y-4">
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
                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        dateRange: { start: '', end: '' }
                      }));
                      setShowDateRangePicker(false);
                    }}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Clear Dates
                  </button>
                  <button
                    onClick={() => setShowDateRangePicker(false)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
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
          className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 ${
            showFilters ? 'bg-green-50 text-green-600' : ''
          }`}
        >
          <Filter className="h-5 w-5" />
          Filters
        </button>

        <button
          onClick={getAIInsights}
          disabled={aiLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Get AI Insights
        </button>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Advanced Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shipment Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as typeof filters.type }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              >
                <option value="all">All Types</option>
                <option value="inbound">Inbound</option>
                <option value="outbound">Outbound</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as typeof filters.status }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-transit">In Transit</option>
                <option value="delivered">Delivered</option>
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
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Shipments Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Origin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredShipments.map((shipment) => (
                <tr key={shipment.id || `temp-${shipment.type}-${shipment.date}-${shipment.cargo}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {new Date(shipment.date).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${shipment.type === 'inbound' ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'}`}>
                      {shipment.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {shipment.cargo}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{shipment.origin}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{shipment.destination}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${getStatusColor(shipment.status)}`}>
                      {shipment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{shipment.vehicle}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{shipment.quantity}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Shipment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Create New Shipment</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddShipment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={newShipment.type}
                  onChange={(e) => setNewShipment({ ...newShipment, type: e.target.value as 'inbound' | 'outbound' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                >
                  <option value="outbound">Outbound</option>
                  <option value="inbound">Inbound</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cargo
                </label>
                <input
                  type="text"
                  required
                  value={newShipment.cargo}
                  onChange={(e) => setNewShipment({ ...newShipment, cargo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  placeholder="e.g., Corn, Fertilizer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Origin
                </label>
                <input
                  type="text"
                  required
                  value={newShipment.origin}
                  onChange={(e) => setNewShipment({ ...newShipment, origin: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  placeholder="Starting location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destination
                </label>
                <input
                  type="text"
                  required
                  value={newShipment.destination}
                  onChange={(e) => setNewShipment({ ...newShipment, destination: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  placeholder="End location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle
                </label>
                <input
                  type="text"
                  required
                  value={newShipment.vehicle}
                  onChange={(e) => setNewShipment({ ...newShipment, vehicle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  placeholder="e.g., Truck-01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="text"
                  required
                  value={newShipment.quantity}
                  onChange={(e) => setNewShipment({ ...newShipment, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  placeholder="e.g., 5 tons"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={newShipment.date}
                  onChange={(e) => setNewShipment({ ...newShipment, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={newShipment.status}
                  onChange={(e) => setNewShipment({ ...newShipment, status: e.target.value as 'pending' | 'in-transit' | 'delivered' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                >
                  <option value="pending">Pending</option>
                  <option value="in-transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                </select>
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
                  Create Shipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Insights Panel */}
      {showAIInsights && (
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">AI Logistics Insights</h2>
          <div className="prose prose-blue max-w-none">
            <p className="text-blue-800 whitespace-pre-wrap">{aiInsights}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logistics;