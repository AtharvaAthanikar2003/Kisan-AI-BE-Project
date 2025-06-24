import React, { useState, useEffect } from 'react';
import { Cloud, Droplets, Wind, Thermometer, Loader, Sun, Umbrella, Eye, Gauge, Search, MapPin, RefreshCw } from 'lucide-react';
import Plot from 'react-plotly.js';
import WeatherAPI, { WeatherData } from '../../lib/weatherApi';

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'current' | 'hourly' | 'daily'>('current');
  const [location, setLocation] = useState('Pune');
  const [searchInput, setSearchInput] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchWeather = async (loc: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await WeatherAPI.getWeatherData(loc);
      setWeather(data);
      setLocation(loc);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(location);
    const interval = setInterval(() => fetchWeather(location), 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLocationSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchWeather(searchInput.trim());
      setSearchInput('');
    }
  };

  const renderTemperatureGraph = () => {
    if (!weather) return null;

    const hourlyData = {
      x: weather.hourly.map(h => h.time),
      y: weather.hourly.map(h => h.temp),
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Temperature',
      line: { color: '#ef4444', shape: 'spline' },
      marker: { size: 6 }
    };

    const cloudCoverData = {
      x: weather.hourly.map(h => h.time),
      y: weather.hourly.map(h => h.cloudCover),
      type: 'scatter',
      mode: 'lines',
      name: 'Cloud Cover',
      line: { color: '#9ca3af', shape: 'spline' },
      yaxis: 'y2'
    };

    return (
      <Plot
        data={[hourlyData, cloudCoverData]}
        layout={{
          title: '24-Hour Forecast',
          height: 300,
          margin: { t: 30, r: 50, l: 50, b: 40 },
          xaxis: { title: 'Time', gridcolor: '#f3f4f6' },
          yaxis: { 
            title: 'Temperature (°C)',
            gridcolor: '#f3f4f6',
            zeroline: false
          },
          yaxis2: {
            title: 'Cloud Cover (%)',
            overlaying: 'y',
            side: 'right',
            range: [0, 100],
            gridcolor: '#f3f4f6',
            zeroline: false
          },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          showlegend: true,
          legend: {
            x: 0,
            y: 1.2,
            orientation: 'h'
          },
          font: { color: document.documentElement.classList.contains('dark') ? '#fff' : '#000' }
        }}
        config={{ responsive: true, displayModeBar: false }}
        className="w-full"
      />
    );
  };

  const renderDailyForecast = () => {
    if (!weather) return null;

    const tempData = {
      x: weather.forecast.map(f => f.date),
      y: weather.forecast.map(f => f.temp),
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Temperature',
      line: { color: '#ef4444', shape: 'spline' },
      marker: { size: 8 }
    };

    const precipData = {
      x: weather.forecast.map(f => f.date),
      y: weather.forecast.map(f => f.precipitation),
      type: 'bar',
      name: 'Precipitation',
      marker: { color: '#3b82f6' },
      yaxis: 'y2'
    };

    return (
      <Plot
        data={[tempData, precipData]}
        layout={{
          title: '7-Day Forecast',
          height: 300,
          margin: { t: 30, r: 50, l: 50, b: 40 },
          xaxis: { title: 'Date', gridcolor: '#f3f4f6' },
          yaxis: {
            title: 'Temperature (°C)',
            gridcolor: '#f3f4f6',
            zeroline: false
          },
          yaxis2: {
            title: 'Precipitation (mm)',
            overlaying: 'y',
            side: 'right',
            gridcolor: '#f3f4f6',
            zeroline: false
          },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          showlegend: true,
          legend: {
            x: 0,
            y: 1.2,
            orientation: 'h'
          },
          font: { color: document.documentElement.classList.contains('dark') ? '#fff' : '#000' }
        }}
        config={{ responsive: true, displayModeBar: false }}
        className="w-full"
      />
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-gray-800">
      {/* Location Search */}
      <form onSubmit={handleLocationSearch} className="mb-6">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search location..."
            className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </form>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Weather Forecast</h2>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <MapPin className="inline-block h-4 w-4 mr-1" />
            {location}
            {lastUpdated && (
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchWeather(location)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            title="Refresh"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setView('current')}
              className={`px-3 py-1 rounded-lg text-sm ${
                view === 'current' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Current
            </button>
            <button
              onClick={() => setView('hourly')}
              className={`px-3 py-1 rounded-lg text-sm ${
                view === 'hourly' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Hourly
            </button>
            <button
              onClick={() => setView('daily')}
              className={`px-3 py-1 rounded-lg text-sm ${
                view === 'daily' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Daily
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => fetchWeather(location)}
            className="text-blue-500 dark:text-blue-400 underline"
          >
            Retry
          </button>
        </div>
      ) : weather && (
        <>
          {view === 'current' && (
            <div className="space-y-6">
              <div className="flex items-center justify-center mb-6">
                <div className="text-center">
                  <span className="text-6xl">{weather.current.icon}</span>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {weather.current.temp}°C
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 capitalize">
                    {weather.current.description}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Feels like {weather.current.feelsLike}°C
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { icon: <Thermometer className="text-red-500" />, label: 'Temperature', value: `${weather.current.temp}°C` },
                  { icon: <Droplets className="text-blue-500" />, label: 'Humidity', value: `${weather.current.humidity}%` },
                  { icon: <Wind className="text-gray-500" />, label: 'Wind', value: `${weather.current.windSpeed} km/h` },
                  { icon: <Umbrella className="text-blue-500" />, label: 'Rain', value: `${weather.current.precipitation} mm` },
                  { icon: <Eye className="text-purple-500" />, label: 'Visibility', value: `${weather.current.visibility} km` },
                  { icon: <Gauge className="text-yellow-500" />, label: 'Pressure', value: `${weather.current.pressure} mb` },
                  { icon: <Sun className="text-yellow-500" />, label: 'UV Index', value: weather.current.uvIndex },
                  { icon: <Cloud className="text-gray-500" />, label: 'Cloud Cover', value: `${weather.current.cloudCover}%` },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-2">
                      {React.cloneElement(item.icon, { className: `h-5 w-5 ${item.icon.props.className}` })}
                      <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
                    </div>
                    <span className="font-semibold dark:text-gray-200">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'hourly' && (
            <div className="space-y-6">
              {renderTemperatureGraph()}
              <div className="overflow-x-auto">
                <div className="flex gap-4 min-w-max pb-2">
                  {weather.hourly.map((hour, index) => (
                    <div key={index} className="flex-shrink-0 w-24 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{hour.time}</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{hour.temp}°C</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {hour.precipitation}mm
                        <br />
                        {hour.conditions}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {view === 'daily' && (
            <div className="space-y-6">
              {renderDailyForecast()}
              <div className="space-y-3">
                {weather.forecast.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{day.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{day.date}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 capitalize">{day.description}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          🌅 {day.sunrise} · 🌇 {day.sunset}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {day.tempMin}° / {day.tempMax}°C
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        💧 {day.precipitation}mm · ☁️ {day.cloudCover}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WeatherWidget;