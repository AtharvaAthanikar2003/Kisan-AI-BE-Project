import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { Cloud, Droplets, Wind, Thermometer, Sun, Gauge, Leaf, Waves, Loader } from 'lucide-react';
import Papa from 'papaparse';

interface WeatherAnalyticsProps {
  weatherData: any;
}

const WeatherAnalytics: React.FC<WeatherAnalyticsProps> = ({ weatherData }) => {
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>('temp');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'hourly' | 'daily'>('daily');

  useEffect(() => {
    if (weatherData) {
      try {
        // Parse CSV data if it's a string
        if (typeof weatherData === 'string') {
          Papa.parse(weatherData, {
            header: true,
            dynamicTyping: true,
            complete: (results) => {
              if (results.data && results.data.length > 0) {
                setParsedData(results.data);
              }
            },
            error: (error) => {
              console.error('CSV parsing error:', error);
            }
          });
        } else {
          // If data is already parsed, use it directly
          setParsedData(weatherData.days || []);
        }
      } catch (error) {
        console.error('Data processing error:', error);
      }
    }
  }, [weatherData]);

  // Early return if no data
  if (!parsedData || parsedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 text-green-600 animate-spin" />
      </div>
    );
  }

  const metrics = [
    { id: 'temp', label: 'Temperature', icon: Thermometer, unit: '°C', color: '#ef4444' },
    { id: 'humidity', label: 'Humidity', icon: Droplets, unit: '%', color: '#3b82f6' },
    { id: 'windspeed', label: 'Wind Speed', icon: Wind, unit: 'km/h', color: '#6b7280' },
    { id: 'precip', label: 'Precipitation', icon: Cloud, unit: 'mm', color: '#2563eb' },
    { id: 'dniradiation', label: 'Solar Radiation', icon: Sun, unit: 'W/m²', color: '#f59e0b' },
    { id: 'soiltemp01', label: 'Soil Temperature', icon: Thermometer, unit: '°C', color: '#d97706' },
    { id: 'soilmoisture01', label: 'Soil Moisture', icon: Waves, unit: '%', color: '#059669' },
    { id: 'et0', label: 'Evapotranspiration', icon: Leaf, unit: 'mm', color: '#2563eb' },
    { id: 'pressure', label: 'Pressure', icon: Gauge, unit: 'mb', color: '#7c3aed' }
  ];

  const renderMetricCard = (metric: typeof metrics[0]) => {
    const value = parsedData[0][metric.id];
    if (value === undefined) return null;

    return (
      <div key={metric.id} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <metric.icon className="h-6 w-6" style={{ color: metric.color }} />
          <span className="text-sm text-gray-500 dark:text-gray-400">{metric.unit}</span>
        </div>
        <div className="text-2xl font-bold" style={{ color: metric.color }}>
          {typeof value === 'number' ? value.toFixed(1) : value}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300">{metric.label}</div>
      </div>
    );
  };

  const getMetricData = (metricId: string) => {
    const metric = metrics.find(m => m.id === metricId);
    if (!metric) return {};

    return {
      x: parsedData.map(d => d.datetime || d.date),
      y: parsedData.map(d => d[metricId] || 0),
      type: 'scatter',
      mode: 'lines+markers',
      name: metric.label,
      line: { color: metric.color, shape: 'spline' },
      marker: { size: 6 }
    };
  };

  const renderWindRose = () => {
    const windDirections = parsedData.map(d => d.winddir);
    const windSpeeds = parsedData.map(d => d.windspeed);

    return {
      type: 'scatterpolar',
      r: windSpeeds,
      theta: windDirections,
      mode: 'markers',
      marker: {
        color: windSpeeds,
        colorscale: 'Viridis',
        size: 8,
        showscale: true
      },
      name: 'Wind Data'
    };
  };

  // Data availability checks
  const hasWindData = parsedData.some(d => d.windspeed !== undefined && d.winddir !== undefined);
  const hasSoilData = parsedData.some(d => d.soiltemp01 !== undefined || d.soilmoisture01 !== undefined);
  const hasRadiationData = parsedData.some(d => d.dniradiation !== undefined || d.et0 !== undefined);
  const hasTemperatureHumidityData = parsedData.some(d => d.temp !== undefined && d.humidity !== undefined);

  return (
    <div className="h-full overflow-y-auto pb-8">
      {/* Current Weather Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {metrics.slice(0, 5).map(metric => renderMetricCard(metric))}
      </div>

      {/* Advanced Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {metrics.slice(5).map(metric => renderMetricCard(metric))}
      </div>

      {/* Time Frame Selection */}
      <div className="flex gap-4 mb-6 sticky top-0 bg-gray-50 dark:bg-gray-800 p-4 z-10 rounded-lg">
        <button
          onClick={() => setSelectedTimeframe('daily')}
          className={`px-4 py-2 rounded-lg ${
            selectedTimeframe === 'daily'
              ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'
              : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          Daily Analysis
        </button>
        <button
          onClick={() => setSelectedTimeframe('hourly')}
          className={`px-4 py-2 rounded-lg ${
            selectedTimeframe === 'hourly'
              ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'
              : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          Hourly Analysis
        </button>
      </div>

      {/* Metric Selection */}
      <div className="flex flex-wrap gap-2 mb-6 sticky top-20 bg-gray-50 dark:bg-gray-800 p-4 z-10 rounded-lg">
        {metrics.map(metric => (
          <button
            key={metric.id}
            onClick={() => setSelectedMetric(metric.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              selectedMetric === metric.id
                ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <metric.icon className="h-5 w-5" />
            <span>{metric.label}</span>
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="space-y-6">
        {/* Main Time Series Chart */}
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
          <Plot
            data={[getMetricData(selectedMetric)]}
            layout={{
              title: `${metrics.find(m => m.id === selectedMetric)?.label} Trend`,
              height: 400,
              margin: { t: 30, r: 30, l: 50, b: 30 },
              xaxis: { title: 'Date', gridcolor: '#f3f4f6' },
              yaxis: { 
                title: `${metrics.find(m => m.id === selectedMetric)?.label} (${metrics.find(m => m.id === selectedMetric)?.unit})`,
                gridcolor: '#f3f4f6'
              },
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'transparent',
              showlegend: false,
              font: { color: document.documentElement.classList.contains('dark') ? '#fff' : '#000' }
            }}
            config={{ responsive: true, displayModeBar: false }}
            className="w-full"
          />
        </div>

        {/* Advanced Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Wind Rose */}
          {hasWindData && (
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Wind Rose Diagram</h3>
              <Plot
                data={[renderWindRose()]}
                layout={{
                  height: 400,
                  polar: {
                    radialaxis: { title: 'Wind Speed (km/h)' }
                  },
                  showlegend: false,
                  paper_bgcolor: 'transparent',
                  font: { color: document.documentElement.classList.contains('dark') ? '#fff' : '#000' }
                }}
                config={{ responsive: true, displayModeBar: false }}
              />
            </div>
          )}

          {/* Soil Conditions */}
          {hasSoilData && (
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Soil Conditions</h3>
              <Plot
                data={[
                  {
                    x: parsedData.map(d => d.datetime || d.date),
                    y: parsedData.map(d => d.soiltemp01 || 0),
                    name: 'Soil Temperature',
                    type: 'scatter',
                    mode: 'lines',
                    line: { color: '#d97706' }
                  },
                  {
                    x: parsedData.map(d => d.datetime || d.date),
                    y: parsedData.map(d => d.soilmoisture01 || 0),
                    name: 'Soil Moisture',
                    type: 'scatter',
                    mode: 'lines',
                    yaxis: 'y2',
                    line: { color: '#059669' }
                  }
                ]}
                layout={{
                  height: 400,
                  margin: { t: 20, r: 50, l: 50, b: 30 },
                  xaxis: { title: 'Date' },
                  yaxis: { title: 'Temperature (°C)', side: 'left' },
                  yaxis2: {
                    title: 'Moisture (%)',
                    overlaying: 'y',
                    side: 'right'
                  },
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'transparent',
                  showlegend: true,
                  legend: { orientation: 'h', y: -0.2 },
                  font: { color: document.documentElement.classList.contains('dark') ? '#fff' : '#000' }
                }}
                config={{ responsive: true, displayModeBar: false }}
              />
            </div>
          )}

          {/* Solar Radiation & Evapotranspiration */}
          {hasRadiationData && (
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Solar Radiation & Evapotranspiration</h3>
              <Plot
                data={[
                  {
                    x: parsedData.map(d => d.datetime || d.date),
                    y: parsedData.map(d => d.dniradiation || 0),
                    name: 'Solar Radiation',
                    type: 'scatter',
                    mode: 'lines',
                    line: { color: '#f59e0b' }
                  },
                  {
                    x: parsedData.map(d => d.datetime || d.date),
                    y: parsedData.map(d => d.et0 || 0),
                    name: 'Evapotranspiration',
                    type: 'scatter',
                    mode: 'lines',
                    yaxis: 'y2',
                    line: { color: '#2563eb' }
                  }
                ]}
                layout={{
                  height: 400,
                  margin: { t: 20, r: 50, l: 50, b: 30 },
                  xaxis: { title: 'Date' },
                  yaxis: { title: 'Solar Radiation (W/m²)', side: 'left' },
                  yaxis2: {
                    title: 'Evapotranspiration (mm)',
                    overlaying: 'y',
                    side: 'right'
                  },
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'transparent',
                  showlegend: true,
                  legend: { orientation: 'h', y: -0.2 },
                  font: { color: document.documentElement.classList.contains('dark') ? '#fff' : '#000' }
                }}
                config={{ responsive: true, displayModeBar: false }}
              />
            </div>
          )}

          {/* Temperature & Humidity Relationship */}
          {hasTemperatureHumidityData && (
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Temperature-Humidity Relationship</h3>
              <Plot
                data={[{
                  x: parsedData.map(d => d.temp || 0),
                  y: parsedData.map(d => d.humidity || 0),
                  mode: 'markers',
                  type: 'scatter',
                  marker: {
                    color: parsedData.map(d => d.dew || 0),
                    colorscale: 'Viridis',
                    showscale: true,
                    colorbar: { title: 'Dew Point (°C)' }
                  }
                }]}
                layout={{
                  height: 400,
                  margin: { t: 20, r: 30, l: 50, b: 30 },
                  xaxis: { title: 'Temperature (°C)' },
                  yaxis: { title: 'Humidity (%)' },
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'transparent',
                  font: { color: document.documentElement.classList.contains('dark') ? '#fff' : '#000' }
                }}
                config={{ responsive: true, displayModeBar: false }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherAnalytics;