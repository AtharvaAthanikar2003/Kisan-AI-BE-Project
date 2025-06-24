import React, { useState, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { BarChart, LineChart, PieChart, ScatterChart, Filter, Activity, Box, Grid, Hexagon } from 'lucide-react';
import { DataPoint } from './types';

interface DataVisualizerProps {
  data: DataPoint[];
  columns: string[];
}

type ChartType = 'line' | 'bar' | 'scatter' | 'pie' | 'box' | 'histogram' | 'heatmap' | 'bubble';

const DataVisualizer: React.FC<DataVisualizerProps> = ({ data, columns }) => {
  const [chartType, setChartType] = useState<ChartType>('line');
  const [xAxis, setXAxis] = useState(columns[0] || '');
  const [yAxis, setYAxis] = useState(columns[1] || '');
  const [zAxis, setZAxis] = useState(columns[2] || ''); // For 3D charts
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [aggregation, setAggregation] = useState<'sum' | 'avg' | 'count' | 'none'>('none');

  const filteredData = useMemo(() => {
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return String(item[key]).toLowerCase().includes(value.toLowerCase());
      });
    });
  }, [data, filters]);

  const aggregateData = (data: DataPoint[]) => {
    if (aggregation === 'none') return data;

    const grouped = data.reduce((acc, item) => {
      const key = String(item[xAxis]);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(Number(item[yAxis]) || 0);
      return acc;
    }, {} as Record<string, number[]>);

    return Object.entries(grouped).map(([key, values]) => {
      let value = 0;
      switch (aggregation) {
        case 'sum':
          value = values.reduce((a, b) => a + b, 0);
          break;
        case 'avg':
          value = values.reduce((a, b) => a + b, 0) / values.length;
          break;
        case 'count':
          value = values.length;
          break;
      }
      return { [xAxis]: key, [yAxis]: value };
    });
  };

  const getPlotData = () => {
    const aggregatedData = aggregateData(filteredData);
    const x = aggregatedData.map(item => item[xAxis]);
    const y = aggregatedData.map(item => item[yAxis]);
    const z = aggregatedData.map(item => item[zAxis]);

    switch (chartType) {
      case 'line':
        return [{
          x,
          y,
          type: 'scatter',
          mode: 'lines+markers',
          marker: { color: '#16a34a' }
        }];
      case 'bar':
        return [{
          x,
          y,
          type: 'bar',
          marker: { color: '#16a34a' }
        }];
      case 'scatter':
        return [{
          x,
          y,
          type: 'scatter',
          mode: 'markers',
          marker: { 
            color: '#16a34a',
            size: z.map(val => (Number(val) || 1) * 10) // Use z-axis for marker size
          }
        }];
      case 'pie':
        return [{
          values: y,
          labels: x,
          type: 'pie',
          marker: {
            colors: ['#16a34a', '#22c55e', '#4ade80', '#86efac']
          }
        }];
      case 'box':
        return [{
          y,
          type: 'box',
          boxpoints: 'outliers',
          marker: { color: '#16a34a' }
        }];
      case 'histogram':
        return [{
          x: y,
          type: 'histogram',
          marker: { color: '#16a34a' }
        }];
      case 'heatmap':
        return [{
          z: [y],
          type: 'heatmap',
          colorscale: 'Greens'
        }];
      case 'bubble':
        return [{
          x,
          y,
          mode: 'markers',
          marker: {
            size: z.map(val => (Number(val) || 1) * 10),
            color: z,
            colorscale: 'Greens',
            showscale: true
          }
        }];
      default:
        return [];
    }
  };

  const chartButtons = [
    { type: 'line', icon: LineChart, label: 'Line Chart' },
    { type: 'bar', icon: BarChart, label: 'Bar Chart' },
    { type: 'scatter', icon: ScatterChart, label: 'Scatter Plot' },
    { type: 'pie', icon: PieChart, label: 'Pie Chart' },
    { type: 'box', icon: Box, label: 'Box Plot' },
    { type: 'histogram', icon: Activity, label: 'Histogram' },
    { type: 'heatmap', icon: Grid, label: 'Heat Map' },
    { type: 'bubble', icon: Hexagon, label: 'Bubble Chart' }
  ];

  return (
    <div className="space-y-6">
      {/* Chart Type Selection */}
      <div className="flex flex-wrap gap-4">
        {chartButtons.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => setChartType(type as ChartType)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              chartType === type
                ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Axis and Aggregation Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            X-Axis
          </label>
          <select
            value={xAxis}
            onChange={(e) => setXAxis(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
          >
            {columns.map(column => (
              <option key={column} value={column}>{column}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Y-Axis
          </label>
          <select
            value={yAxis}
            onChange={(e) => setYAxis(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
          >
            {columns.map(column => (
              <option key={column} value={column}>{column}</option>
            ))}
          </select>
        </div>
        {(chartType === 'bubble' || chartType === 'scatter') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Z-Axis (Size)
            </label>
            <select
              value={zAxis}
              onChange={(e) => setZAxis(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            >
              {columns.map(column => (
                <option key={column} value={column}>{column}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Aggregation Options */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Aggregation:</label>
        <select
          value={aggregation}
          onChange={(e) => setAggregation(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="none">None</option>
          <option value="sum">Sum</option>
          <option value="avg">Average</option>
          <option value="count">Count</option>
        </select>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map(column => (
            <div key={column}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {column}
              </label>
              <input
                type="text"
                value={filters[column] || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  [column]: e.target.value
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder={`Filter ${column}...`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm p-4">
        <Plot
          data={getPlotData()}
          layout={{
            title: `${yAxis} vs ${xAxis}`,
            xaxis: { title: xAxis },
            yaxis: { title: yAxis },
            height: 500,
            margin: { t: 50 },
            showlegend: true,
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: { color: document.documentElement.classList.contains('dark') ? '#fff' : '#000' }
          }}
          config={{ responsive: true }}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default DataVisualizer;