import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Loader, MapPin, RefreshCw, Search } from 'lucide-react';
import WeatherAlertAPI, { WeatherAlert } from '../lib/weatherAlertApi';

const AlertsPage = () => {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [location, setLocation] = useState('Pune');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showLocationSearch, setShowLocationSearch] = useState(false);

  const fetchAlerts = async (loc?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await WeatherAlertAPI.getAlerts(loc || location);
      setAlerts(data.alerts);
      setLastUpdated(new Date());
      if (loc) {
        setLocation(data.location.name);
        setShowLocationSearch(false);
        setSearchInput('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load weather alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Refresh alerts every 15 minutes
    const interval = setInterval(() => fetchAlerts(), 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLocationSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchAlerts(searchInput.trim());
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  // Popular Indian cities for quick selection
  const popularCities = [
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Hyderabad',
    'Chennai',
    'Kolkata',
    'Pune',
    'Ahmedabad'
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <Bell className="h-8 w-8 text-red-600" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Weather Alerts</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        {/* Header Section */}
        <div className="p-6 border-b">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700 font-medium">{location}</span>
                <button
                  onClick={() => setShowLocationSearch(!showLocationSearch)}
                  className="ml-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  Change Location
                </button>
              </div>
              <div className="flex items-center gap-4">
                {lastUpdated && (
                  <span className="text-sm text-gray-500">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
                <button
                  onClick={() => fetchAlerts()}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Location Search */}
            {showLocationSearch && (
              <div className="space-y-4">
                <form onSubmit={handleLocationSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Enter city name or coordinates..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!searchInput.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Search
                  </button>
                </form>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Popular Cities</h3>
                  <div className="flex flex-wrap gap-2">
                    {popularCities.map((city) => (
                      <button
                        key={city}
                        onClick={() => fetchAlerts(city)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Alerts Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No active weather alerts for this location</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`border-l-4 rounded-lg p-4 ${WeatherAlertAPI.getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold mb-1">{alert.headline}</h3>
                      <p className="text-sm mb-2">{alert.desc}</p>
                      {alert.instruction && (
                        <p className="text-sm font-medium mt-2">
                          Instructions: {alert.instruction}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 mt-3 text-sm">
                        <span>Event: {alert.event}</span>
                        <span>Areas: {alert.areas}</span>
                        <span>Certainty: {alert.certainty}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${WeatherAlertAPI.getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <div className="text-xs mt-2">
                        <div>Effective: {formatDate(alert.effective)}</div>
                        <div>Expires: {formatDate(alert.expires)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;