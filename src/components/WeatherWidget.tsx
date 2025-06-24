import React, { useState, useEffect } from 'react';
import { Cloud, Droplets, Wind, Thermometer, Loader, Sun, Umbrella, Eye, Gauge, Search, MapPin, RefreshCw } from 'lucide-react';
import Plot from 'react-plotly.js';
import WeatherAPI, { WeatherData } from '../lib/weatherApi';

const CurrentWeather = ({ current }: { current: WeatherData['current'] }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-center mb-6">
      <div className="text-center">
        <span className="text-6xl">{current.icon || '☀️'}</span>
        <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{current.temp}°C</div>
        <div className="text-gray-600 dark:text-gray-300 capitalize">{current.description}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Feels like {current.feelsLike}°C</div>
      </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {[
        { icon: <Thermometer className="text-red-500" />, label: 'Temperature', value: `${current.temp}°C` },
        { icon: <Droplets className="text-blue-500" />, label: 'Humidity', value: `${current.humidity}%` },
        { icon: <Wind className="text-gray-500" />, label: 'Wind', value: `${current.windSpeed} km/h` },
        { icon: <Umbrella className="text-blue-500" />, label: 'Rain', value: `${current.precipitation} mm` },
        { icon: <Eye className="text-purple-500" />, label: 'Visibility', value: `${current.visibility} km` },
        { icon: <Gauge className="text-yellow-500" />, label: 'Pressure', value: `${current.pressure} mb` },
        { icon: <Sun className="text-yellow-500" />, label: 'UV Index', value: current.uvIndex },
        { icon: <Cloud className="text-gray-500" />, label: 'Cloud Cover', value: `${current.cloudCover}%` },
      ].map((item, idx) => (
        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2">
            {item.icon}
            <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
          </div>
          <span className="font-semibold dark:text-gray-200">{item.value}</span>
        </div>
      ))}
    </div>
  </div>
);

const TemperatureGraph = ({ hourly }: { hourly: WeatherData['hourly'] }) => {
  const data = [
    {
      x: hourly.map(h => h.time),
      y: hourly.map(h => h.temp),
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Temperature',
      line: { color: '#ef4444', shape: 'spline' },
      marker: { size: 6 },
    },
    {
      x: hourly.map(h => h.time),
      y: hourly.map(h => h.cloudCover),
      type: 'scatter',
      mode: 'lines',
      name: 'Cloud Cover',
      line: { color: '#9ca3af', shape: 'spline' },
      yaxis: 'y2',
    },
  ];

  const layout = {
    title: '24-Hour Forecast',
    height: 300,
    xaxis: { title: 'Time', gridcolor: '#f3f4f6' },
    yaxis: { title: 'Temperature (°C)', gridcolor: '#f3f4f6' },
    yaxis2: { title: 'Cloud Cover (%)', overlaying: 'y', side: 'right' },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    showlegend: true,
    font: { color: document.documentElement.classList.contains('dark') ? '#fff' : '#000' }
  };

  return <Plot data={data} layout={layout} config={{ responsive: true, displayModeBar: false }} />;
};

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'current' | 'hourly'>('current');
  const [location, setLocation] = useState('Pune');
  const [searchInput, setSearchInput] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await WeatherAPI.getWeatherData(location);
        setWeather(data);
        setLastUpdated(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load weather data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setLocation(searchInput);
      setSearchInput('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="text-center">
        <p className="text-red-500 dark:text-red-400">{error || 'Weather data unavailable'}</p>
        <button onClick={() => window.location.reload()} className="text-blue-500 dark:text-blue-400 underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Weather Forecast</h2>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{location}</span>
            {lastUpdated && (
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search location..."
              className="w-full px-3 py-1 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <Search className="h-4 w-4 text-gray-400" />
            </button>
          </form>
          <button onClick={() => setView('current')} className={`px-3 py-1 ${view === 'current' ? 'bg-blue-500 text-white' : 'dark:text-gray-300'}`}>
            Current
          </button>
          <button onClick={() => setView('hourly')} className={`px-3 py-1 ${view === 'hourly' ? 'bg-blue-500 text-white' : 'dark:text-gray-300'}`}>
            Hourly
          </button>
          <button onClick={() => window.location.reload()} className="p-1 text-gray-500 dark:text-gray-400" title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
      {view === 'current' && weather && <CurrentWeather current={weather.current} />}
      {view === 'hourly' && weather && <TemperatureGraph hourly={weather.hourly} />}
    </div>
  );
};

export default WeatherWidget;