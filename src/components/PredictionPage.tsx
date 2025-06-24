import React, { useState } from 'react';
import { Brain, Loader, AlertCircle, Droplets, Beaker } from 'lucide-react';
import { GradioClient, PredictionResult } from '../lib/gradioClient';

type PredictionTab = 'crop' | 'fertilizer' | 'rainfall';

const PredictionPage = () => {
  const [activeTab, setActiveTab] = useState<PredictionTab>('crop');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  // Crop prediction states
  const [cropForm, setCropForm] = useState({
    nitrogen: '40',
    phosphorus: '30',
    potassium: '35',
    temperature: '25',
    humidity: '65',
    ph: '6.5',
    rainfall: '200',
  });

  // Fertilizer prediction states
  const [fertilizerForm, setFertilizerForm] = useState({
    soilType: '',
    cropType: '',
    temperature: '25',
    humidity: '65',
    nitrogen: '40',
    phosphorous: '30',
    potassium: '35',
  });

  // Rainfall prediction states
  const [rainfallForm, setRainfallForm] = useState({
    subdivision: '',
    year: new Date().getFullYear().toString(),
    may: '0',
    jun: '0',
    jul: '0',
    aug: '0',
    sep: '0',
  });

  // Options for dropdowns
  const soilTypes = ["Loamy", "Sandy", "Clayey", "Black", "Red"];
  const cropTypes = [
    "Sugarcane", "Cotton", "Millets", "Paddy", "Pulses", "Wheat", "Tobacco",
    "Barley", "Oil seeds", "Ground Nuts", "Maize"
  ];
  const subdivisions = [
    "ANDAMAN & NICOBAR ISLANDS", "ARUNACHAL PRADESH", "ASSAM & MEGHALAYA",
    "NAGA MANI MIZO TRIPURA", "SUB HIMALAYAN WEST BENGAL & SIKKIM",
    "GANGETIC WEST BENGAL", "ORISSA", "JHARKHAND", "BIHAR",
    "EAST UTTAR PRADESH", "WEST UTTAR PRADESH", "UTTARAKHAND",
    "HARYANA DELHI & CHANDIGARH", "PUNJAB", "HIMACHAL PRADESH",
    "JAMMU & KASHMIR", "WEST RAJASTHAN", "EAST RAJASTHAN",
    "WEST MADHYA PRADESH", "EAST MADHYA PRADESH", "GUJARAT REGION",
    "SAURASHTRA & KUTCH", "KONKAN & GOA", "MADHYA MAHARASHTRA",
    "MATATHWADA", "VIDARBHA", "CHHATTISGARH", "COASTAL ANDHRA PRADESH",
    "TELANGANA", "RAYALSEEMA", "TAMIL NADU", "COASTAL KARNATAKA",
    "NORTH INTERIOR KARNATAKA", "SOUTH INTERIOR KARNATAKA", "KERALA",
    "LAKSHADWEEP"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const gradioClient = GradioClient.getInstance();
      let inputs;

      switch (activeTab) {
        case 'crop':
          inputs = {
            nitrogen: parseFloat(cropForm.nitrogen),
            phosphorus: parseFloat(cropForm.phosphorus),
            potassium: parseFloat(cropForm.potassium),
            temperature: parseFloat(cropForm.temperature),
            humidity: parseFloat(cropForm.humidity),
            ph: parseFloat(cropForm.ph),
            rainfall: parseFloat(cropForm.rainfall)
          };
          break;
        case 'fertilizer':
          inputs = {
            soilType: fertilizerForm.soilType,
            cropType: fertilizerForm.cropType,
            temperature: parseFloat(fertilizerForm.temperature),
            humidity: parseFloat(fertilizerForm.humidity),
            nitrogen: parseFloat(fertilizerForm.nitrogen),
            phosphorous: parseFloat(fertilizerForm.phosphorous),
            potassium: parseFloat(fertilizerForm.potassium)
          };
          break;
        case 'rainfall':
          inputs = {
            subdivision: rainfallForm.subdivision,
            year: parseInt(rainfallForm.year),
            may: parseFloat(rainfallForm.may),
            jun: parseFloat(rainfallForm.jun),
            jul: parseFloat(rainfallForm.jul),
            aug: parseFloat(rainfallForm.aug),
            sep: parseFloat(rainfallForm.sep)
          };
          break;
      }

      const result = await gradioClient.predict(inputs, activeTab);
      if (result.error) {
        throw new Error(result.error);
      }
      setPrediction(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const renderTabs = () => (
    <div className="flex space-x-4 mb-8">
      <button
        onClick={() => setActiveTab('crop')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          activeTab === 'crop'
            ? 'bg-green-50 text-green-600'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <Brain className="h-5 w-5" />
        <span>Crop Prediction</span>
      </button>
      <button
        onClick={() => setActiveTab('fertilizer')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          activeTab === 'fertilizer'
            ? 'bg-green-50 text-green-600'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <Beaker className="h-5 w-5" />
        <span>Fertilizer Prediction</span>
      </button>
      <button
        onClick={() => setActiveTab('rainfall')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          activeTab === 'rainfall'
            ? 'bg-green-50 text-green-600'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <Droplets className="h-5 w-5" />
        <span>Rainfall Prediction</span>
      </button>
    </div>
  );

  const renderActiveForm = () => {
    switch (activeTab) {
      case 'crop':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nitrogen (N) in mg/kg
              </label>
              <input
                type="number"
                value={cropForm.nitrogen}
                onChange={(e) => setCropForm(prev => ({ ...prev, nitrogen: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phosphorus (P) in mg/kg
              </label>
              <input
                type="number"
                value={cropForm.phosphorus}
                onChange={(e) => setCropForm(prev => ({ ...prev, phosphorus: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Potassium (K) in mg/kg
              </label>
              <input
                type="number"
                value={cropForm.potassium}
                onChange={(e) => setCropForm(prev => ({ ...prev, potassium: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperature (°C)
              </label>
              <input
                type="number"
                value={cropForm.temperature}
                onChange={(e) => setCropForm(prev => ({ ...prev, temperature: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Humidity (%)
              </label>
              <input
                type="number"
                value={cropForm.humidity}
                onChange={(e) => setCropForm(prev => ({ ...prev, humidity: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                pH Level
              </label>
              <input
                type="number"
                value={cropForm.ph}
                onChange={(e) => setCropForm(prev => ({ ...prev, ph: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rainfall (mm)
              </label>
              <input
                type="number"
                value={cropForm.rainfall}
                onChange={(e) => setCropForm(prev => ({ ...prev, rainfall: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        );

      case 'fertilizer':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Soil Type
              </label>
              <select
                value={fertilizerForm.soilType}
                onChange={(e) => setFertilizerForm(prev => ({ ...prev, soilType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select Soil Type</option>
                {soilTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Crop Type
              </label>
              <select
                value={fertilizerForm.cropType}
                onChange={(e) => setFertilizerForm(prev => ({ ...prev, cropType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select Crop Type</option>
                {cropTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperature (°C)
              </label>
              <input
                type="number"
                value={fertilizerForm.temperature}
                onChange={(e) => setFertilizerForm(prev => ({ ...prev, temperature: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Humidity (%)
              </label>
              <input
                type="number"
                value={fertilizerForm.humidity}
                onChange={(e) => setFertilizerForm(prev => ({ ...prev, humidity: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nitrogen Content
              </label>
              <input
                type="number"
                value={fertilizerForm.nitrogen}
                onChange={(e) => setFertilizerForm(prev => ({ ...prev, nitrogen: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phosphorous Content
              </label>
              <input
                type="number"
                value={fertilizerForm.phosphorous}
                onChange={(e) => setFertilizerForm(prev => ({ ...prev, phosphorous: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Potassium Content
              </label>
              <input
                type="number"
                value={fertilizerForm.potassium}
                onChange={(e) => setFertilizerForm(prev => ({ ...prev, potassium: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        );

      case 'rainfall':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subdivision
              </label>
              <select
                value={rainfallForm.subdivision}
                onChange={(e) => setRainfallForm(prev => ({ ...prev, subdivision: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select Subdivision</option>
                {subdivisions.map(subdivision => (
                  <option key={subdivision} value={subdivision}>{subdivision}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <input
                type="number"
                value={rainfallForm.year}
                onChange={(e) => setRainfallForm(prev => ({ ...prev, year: e.target.value }))}
                min={1900}
                max={2100}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                May Rainfall (mm)
              </label>
              <input
                type="number"
                value={rainfallForm.may}
                onChange={(e) => setRainfallForm(prev => ({ ...prev, may: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                June Rainfall (mm)
              </label>
              <input
                type="number"
                value={rainfallForm.jun}
                onChange={(e) => setRainfallForm(prev => ({ ...prev, jun: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                July Rainfall (mm)
              </label>
              <input
                type="number"
                value={rainfallForm.jul}
                onChange={(e) => setRainfallForm(prev => ({ ...prev, jul: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                August Rainfall (mm)
              </label>
              <input
                type="number"
                value={rainfallForm.aug}
                onChange={(e) => setRainfallForm(prev => ({ ...prev, aug: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                September Rainfall (mm)
              </label>
              <input
                type="number"
                value={rainfallForm.sep}
                onChange={(e) => setRainfallForm(prev => ({ ...prev, sep: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <Brain className="h-8 w-8 text-green-600" />
        <h1 className="text-3xl font-bold text-gray-900  dark:text-white">AI Predictions</h1>
      </div>

      {renderTabs()}

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          {error && (
            <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {renderActiveForm()}

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    {activeTab === 'crop' && <Brain className="h-5 w-5" />}
                    {activeTab === 'fertilizer' && <Beaker className="h-5 w-5" />}
                    {activeTab === 'rainfall' && <Droplets className="h-5 w-5" />}
                    <span>Get Prediction</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {prediction && !prediction.error && (
            <div className="mt-8 p-6 bg-green-50 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-4">Prediction Results</h3>
              <div className="prose prose-green max-w-none">
                <p className="text-green-700">
                  <strong>
                    {activeTab === 'crop' && 'Recommended Crop: '}
                    {activeTab === 'fertilizer' && 'Recommended Fertilizer: '}
                    {activeTab === 'rainfall' && 'Predicted Rainfall: '}
                  </strong>
                  {prediction.data[0]}
                  {activeTab === 'rainfall' && ' mm'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictionPage;