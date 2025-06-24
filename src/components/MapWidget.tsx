import React, { useState, useCallback, useRef } from 'react';
import Map, { 
  NavigationControl, 
  Source, 
  Layer,
  MapRef,
  ViewStateChangeEvent,
  MapLayerMouseEvent
} from 'react-map-gl';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Layers, Crop, Droplets, Thermometer, Wind, Bug, Sprout, X, Plus, BarChart, PieChart, TrendingUp, ArrowRight } from 'lucide-react';
import Plot from 'react-plotly.js';

// Get Mapbox token from environment variables
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

if (!MAPBOX_TOKEN) {
  throw new Error('Mapbox token is required. Please add VITE_MAPBOX_TOKEN to your .env file.');
}

interface FarmField {
  id: string;
  name: string;
  crop: string;
  area: string;
  moisture: string;
  health: 'good' | 'attention' | 'critical';
  coordinates: [number, number][];
}

const initialFarmFields: FarmField[] = [
  {
    id: '1',
    name: 'North Field',
    crop: 'Wheat',
    area: '5.2 ha',
    moisture: '65%',
    health: 'good',
    coordinates: [
      [73.8467, 18.5104],
      [73.8567, 18.5104],
      [73.8567, 18.5204],
      [73.8467, 18.5204],
      [73.8467, 18.5104]
    ]
  },
  {
    id: '2',
    name: 'South Field',
    crop: 'Corn',
    area: '3.8 ha',
    moisture: '58%',
    health: 'attention',
    coordinates: [
      [73.8467, 18.5004],
      [73.8567, 18.5004],
      [73.8567, 18.5104],
      [73.8467, 18.5104],
      [73.8467, 18.5004]
    ]
  },
  {
    id: '3',
    name: 'East Field',
    crop: 'Soybeans',
    area: '4.5 ha',
    moisture: '45%',
    health: 'critical',
    coordinates: [
      [73.8567, 18.5104],
      [73.8667, 18.5104],
      [73.8667, 18.5204],
      [73.8567, 18.5204],
      [73.8567, 18.5104]
    ]
  },
  {
    id: '4',
    name: 'West Field',
    crop: 'Rice',
    area: '6.0 ha',
    moisture: '72%',
    health: 'good',
    coordinates: [
      [73.8367, 18.5104],
      [73.8467, 18.5104],
      [73.8467, 18.5204],
      [73.8367, 18.5204],
      [73.8367, 18.5104]
    ]
  }
];

const MapWidget = () => {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState({
    latitude: 18.5204,
    longitude: 73.8567,
    zoom: 12
  });
  const [activeLayer, setActiveLayer] = useState<string>('satellite');
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawPoints, setDrawPoints] = useState<[number, number][]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [farmFields, setFarmFields] = useState<FarmField[]>(initialFarmFields);
  const [newField, setNewField] = useState({
    name: '',
    crop: '',
    area: '',
    moisture: '',
    health: 'good' as const
  });

  const fieldFeatureCollection = {
    type: 'FeatureCollection',
    features: farmFields.map(field => ({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [field.coordinates]
      },
      properties: {
        id: field.id,
        name: field.name,
        crop: field.crop,
        health: field.health
      }
    }))
  };

  const handleMapMove = useCallback((event: ViewStateChangeEvent) => {
    setViewState(event.viewState);
  }, []);

  const handleMapClick = useCallback((event: MapLayerMouseEvent) => {
    if (isDrawing) {
      const [lng, lat] = event.lngLat.toArray();
      setDrawPoints(prev => [...prev, [lng, lat]]);
    } else {
      const feature = event.features?.[0];
      if (feature) {
        setSelectedField(feature.properties.id);
      }
    }
  }, [isDrawing]);

  const startDrawing = () => {
    setIsDrawing(true);
    setDrawPoints([]);
    setSelectedField(null);
  };

  const finishDrawing = () => {
    if (drawPoints.length >= 3) {
      const closedPolygon = [...drawPoints, drawPoints[0]];
      setShowAddModal(true);
      setNewField(prev => ({
        ...prev,
        area: calculateArea(closedPolygon).toFixed(1) + ' ha'
      }));
    }
    setIsDrawing(false);
  };

  const calculateArea = (coordinates: [number, number][]): number => {
    const latLngs = coordinates.map(([lng, lat]) => ({ lat, lng }));
    let area = 0;
    for (let i = 0; i < latLngs.length - 1; i++) {
      area += (latLngs[i].lng * latLngs[i + 1].lat) - (latLngs[i + 1].lng * latLngs[i].lat);
    }
    return Math.abs(area) * 10000;
  };

  const handleAddField = () => {
    const newFieldData: FarmField = {
      id: (farmFields.length + 1).toString(),
      coordinates: drawPoints,
      ...newField
    };
    setFarmFields(prev => [...prev, newFieldData]);
    setShowAddModal(false);
    setDrawPoints([]);
    setNewField({
      name: '',
      crop: '',
      area: '',
      moisture: '',
      health: 'good'
    });
  };

  const calculateAnalytics = () => {
    const totalArea = farmFields.reduce((sum, field) => {
      return sum + parseFloat(field.area.split(' ')[0]);
    }, 0);

    const cropDistribution = farmFields.reduce((acc, field) => {
      acc[field.crop] = (acc[field.crop] || 0) + parseFloat(field.area.split(' ')[0]);
      return acc;
    }, {} as Record<string, number>);

    const healthDistribution = farmFields.reduce((acc, field) => {
      acc[field.health] = (acc[field.health] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgMoisture = farmFields.reduce((sum, field) => {
      return sum + parseFloat(field.moisture.replace('%', ''));
    }, 0) / farmFields.length;

    return {
      totalArea,
      cropDistribution,
      healthDistribution,
      avgMoisture
    };
  };

  const getLayerStyle = (type: string): string => {
    switch (type) {
      case 'satellite':
        return 'mapbox://styles/mapbox/satellite-streets-v12';
      case 'terrain':
        return 'mapbox://styles/mapbox/outdoors-v12';
      case 'soil':
        return 'mapbox://styles/mapbox/streets-v12';
      default:
        return 'mapbox://styles/mapbox/satellite-streets-v12';
    }
  };

  const getHealthColor = (health: string): string => {
    switch (health) {
      case 'good':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'attention':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const layerOptions = [
    { id: 'satellite', icon: Layers, label: 'Satellite View' },
    { id: 'terrain', icon: MapPin, label: 'Terrain View' },
    { id: 'soil', icon: Sprout, label: 'Soil Map' }
  ];

  const renderAnalytics = () => {
    const analytics = calculateAnalytics();

    const cropData = {
      values: Object.values(analytics.cropDistribution),
      labels: Object.keys(analytics.cropDistribution),
      type: 'pie',
      name: 'Crop Distribution',
      marker: {
        colors: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444']
      }
    };

    const healthData = {
      x: Object.keys(analytics.healthDistribution),
      y: Object.values(analytics.healthDistribution),
      type: 'bar',
      name: 'Field Health',
      marker: {
        color: ['#10B981', '#F59E0B', '#EF4444']
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Field Analytics</h2>
            <button
              onClick={() => setShowAnalytics(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-400">Total Area</h3>
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-500">{analytics.totalArea.toFixed(1)} ha</p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400">Avg. Moisture</h3>
                <Droplets className="h-5 w-5 text-blue-600 dark:text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-500">{analytics.avgMoisture.toFixed(1)}%</p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Total Fields</h3>
                <Crop className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">{farmFields.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Crop Distribution</h3>
              <Plot
                data={[cropData]}
                layout={{
                  height: 300,
                  margin: { t: 0, r: 0, l: 0, b: 0 },
                  showlegend: true,
                  legend: { orientation: 'h', y: -0.2 },
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'transparent',
                  font: { color: document.documentElement.classList.contains('dark') ? '#fff' : '#000' }
                }}
                config={{ responsive: true, displayModeBar: false }}
              />
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Field Health Status</h3>
              <Plot
                data={[healthData]}
                layout={{
                  height: 300,
                  margin: { t: 0, r: 0, l: 40, b: 40 },
                  xaxis: { title: 'Health Status' },
                  yaxis: { title: 'Number of Fields' },
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'transparent',
                  font: { color: document.documentElement.classList.contains('dark') ? '#fff' : '#000' }
                }}
                config={{ responsive: true, displayModeBar: false }}
              />
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Field Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Field Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Crop
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Area
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Moisture
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Health
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {farmFields.map(field => (
                    <tr key={field.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {field.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {field.crop}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {field.area}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {field.moisture}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getHealthColor(field.health)}`}>
                          {field.health}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Agricultural Fields</h2>
        <div className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-green-600" />
          <span className="text-sm text-gray-600 dark:text-gray-300">Pune Region</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-4">
          <h3 className="font-medium text-gray-700 dark:text-gray-300">Map Layers</h3>
          <div className="space-y-2">
            {layerOptions.map(option => (
              <button
                key={option.id}
                onClick={() => setActiveLayer(option.id)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  activeLayer === option.id
                    ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <option.icon className="h-5 w-5" />
                <span>{option.label}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Field Metrics</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Crop className="h-4 w-4" />
                <span>Crop Types: {farmFields.length}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Droplets className="h-4 w-4" />
                <span>Avg. Moisture: 60%</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Thermometer className="h-4 w-4" />
                <span>Soil Temp: 24°C</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Wind className="h-4 w-4" />
                <span>Wind: 12 km/h</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Bug className="h-4 w-4" />
                <span>Pest Risk: Low</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-3 space-y-4">
          {isDrawing && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-blue-700 dark:text-blue-300">
                Click on the map to draw field boundaries. Click at least 3 points to create a field.
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={finishDrawing}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Finish Drawing
                </button>
                <button
                  onClick={() => {
                    setIsDrawing(false);
                    setDrawPoints([]);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="aspect-[16/9] rounded-lg overflow-hidden">
            <Map
              ref={mapRef}
              mapboxAccessToken={MAPBOX_TOKEN}
              {...viewState}
              onMove={handleMapMove}
              style={{ width: '100%', height: '100%' }}
              mapStyle={getLayerStyle(activeLayer)}
              interactiveLayerIds={['field-fills']}
              onClick={handleMapClick}
              cursor={isDrawing ? 'crosshair' : 'pointer'}
            >
              <NavigationControl position="top-right" />
              
              <Source id="fields" type="geojson" data={fieldFeatureCollection}>
                <Layer
                  id="field-fills"
                  type="fill"
                  paint={{
                    'fill-color': [
                      'match',
                      ['get', 'health'],
                      'good', '#10B981',
                      'attention', '#FBBF24',
                      'critical', '#EF4444',
                      '#9CA3AF'
                    ],
                    'fill-opacity': 0.5
                  }}
                />
                <Layer
                  id="field-borders"
                  type="line"
                  paint={{
                    'line-color': '#000000',
                    'line-width': 2
                  }}
                />
              </Source>

              {drawPoints.length > 0 && (
                <Source
                  id="drawing"
                  type="geojson"
                  data={{
                    type: 'Feature',
                    geometry: {
                      type: 'LineString',
                      coordinates: drawPoints
                    },
                    properties: {}
                  }}
                >
                  <Layer
                    id="drawing-line"
                    type="line"
                    paint={{
                      'line-color': '#2563EB',
                      'line-width': 2,
                      'line-dasharray': [2, 1]
                    }}
                  />
                  <Layer
                    id="drawing-points"
                    type="circle"
                    paint={{
                      'circle-radius': 5,
                      'circle-color': '#2563EB'
                    }}
                  />
                </Source>
              )}
            </Map>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {farmFields.map(field => (
              <div
                key={field.id}
                className={`p-4 rounded-lg border transition-colors ${
                  selectedField === field.id
                    ? 'border-green-500 bg-green-50 dark:border-green-600 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <h4 className="font-medium text-gray-800 dark:text-white mb-2">{field.name}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Crop:</span>
                    <span className="font-medium dark:text-gray-200">{field.crop}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Area:</span>
                    <span className="font-medium dark:text-gray-200">{field.area}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Moisture:</span>
                    <span className="font-medium dark:text-gray-200">{field.moisture}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Health:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(field.health)}`}>
                      {field.health}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={startDrawing}
          disabled={isDrawing}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <div className="flex items-center justify-center gap-2">
            <Plus className="h-5 w-5" />
            Draw New Field
          </div>
        </button>
        <button 
          onClick={() => setShowAnalytics(true)}
          className="flex-1 border border-green-600 text-green-600 py-2 px-4 rounded-lg hover:bg-green-50 transition-colors dark:text-green-400 dark:border-green-500 dark:hover:bg-green-900/20"
        >
          <div className="flex items-center justify-center gap-2">
            <BarChart className="h-5 w-5" />
            View Analytics
          </div>
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Field</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setDrawPoints([]);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleAddField(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Field Name
                </label>
                <input
                  type="text"
                  required
                  value={newField.name}
                  onChange={(e) => setNewField(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter field name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Crop Type
                </label>
                <input
                  type="text"
                  required
                  value={newField.crop}
                  onChange={(e) => setNewField(prev => ({ ...prev, crop: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter crop type"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Area
                </label>
                <input
                  type="text"
                  required
                  value={newField.area}
                  onChange={(e) => setNewField(prev => ({ ...prev, area: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter area in hectares"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Moisture Level
                </label>
                <input
                  type="text"
                  required
                  value={newField.moisture}
                  onChange={(e) => setNewField(prev => ({ ...prev, moisture: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter moisture percentage"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Health Status
                </label>
                <select
                  value={newField.health}
                  onChange={(e) => setNewField(prev => ({ ...prev, health: e.target.value as 'good' | 'attention' | 'critical' }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="good">Good</option>
                  <option value="attention">Needs Attention</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setDrawPoints([]);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAnalytics && renderAnalytics()}
    </div>
  );
};

export default MapWidget;