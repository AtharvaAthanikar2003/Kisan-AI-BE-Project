import React, { useState, useCallback, useEffect } from 'react';
import { BarChart3, Upload, Database, Brain, Loader, AlertCircle } from 'lucide-react';
import DataUploader from './DataUploader';
import DataVisualizer from './DataVisualizer';
import AIAnalysis from './AIAnalysis';
import WeatherAnalytics from './WeatherAnalytics';
import { DataPoint } from './types';
import WeatherAPI from '../../lib/weatherApi';

const AnalyticsPage = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'weather' | 'upload' | 'visualize' | 'analyze'>('weather');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await WeatherAPI.getWeatherData('Pune');
        setWeatherData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'weather') {
      fetchWeatherData();
    }
  }, [activeTab]);

  const handleDataLoaded = useCallback((parsedData: DataPoint[], headers: string[]) => {
    setData(parsedData);
    setColumns(headers);
    setActiveTab('visualize');
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <BarChart3 className="h-8 w-8 text-green-600" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('weather')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'weather'
              ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'
              : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
          }`}
        >
          <Database className="h-5 w-5" />
          <span>Weather Analytics</span>
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'upload'
              ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'
              : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
          }`}
        >
          <Upload className="h-5 w-5" />
          <span>Upload Data</span>
        </button>
        <button
          onClick={() => setActiveTab('visualize')}
          disabled={data.length === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'visualize'
              ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'
              : data.length === 0
              ? 'text-gray-400 cursor-not-allowed dark:text-gray-600'
              : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
          }`}
        >
          <Database className="h-5 w-5" />
          <span>Visualize</span>
        </button>
        <button
          onClick={() => setActiveTab('analyze')}
          disabled={data.length === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'analyze'
              ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'
              : data.length === 0
              ? 'text-gray-400 cursor-not-allowed dark:text-gray-600'
              : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
          }`}
        >
          <Brain className="h-5 w-5" />
          <span>AI Analysis</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden dark:bg-gray-800">
        <div className="h-[calc(100vh-240px)] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader className="h-8 w-8 text-green-600 animate-spin" />
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="bg-red-50 text-red-600 p-4 rounded-lg dark:bg-red-900/30 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              {activeTab === 'weather' && <WeatherAnalytics weatherData={weatherData} />}
              {activeTab === 'upload' && <DataUploader onDataLoaded={handleDataLoaded} />}
              {activeTab === 'visualize' && <DataVisualizer data={data} columns={columns} />}
              {activeTab === 'analyze' && <AIAnalysis data={data} columns={columns} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;