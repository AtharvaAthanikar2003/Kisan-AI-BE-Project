import React, { useState, useEffect } from 'react';
import { Sprout, Droplets, Bug, AlertCircle, Loader, ArrowRight } from 'lucide-react';
import CropHealthAPI, { CropHealthData } from '../lib/cropHealthApi';

const CropHealthWidget = () => {
  const [cropHealth, setCropHealth] = useState<CropHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCropHealth = async () => {
      try {
        setLoading(true);
        const data = await CropHealthAPI.getCropHealthData();
        setCropHealth(data);
      } catch (err) {
        console.error('Error fetching crop health data:', err);
        setError('Failed to load crop health data');
      } finally {
        setLoading(false);
      }
    };

    fetchCropHealth();
    
    // Refresh data every 30 minutes
    const interval = setInterval(fetchCropHealth, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Crop Health</h2>
          <Sprout className="h-6 w-6 text-green-500" />
        </div>
        <div className="flex items-center justify-center h-40">
          <Loader className="h-8 w-8 text-green-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !cropHealth) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Crop Health</h2>
          <Sprout className="h-6 w-6 text-green-500" />
        </div>
        <div className="flex items-center justify-center h-40 text-red-500">
          <AlertCircle className="h-6 w-6 mr-2" />
          <span>{error || 'Failed to load crop health data'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Crop Health</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{cropHealth.crop_name}</p>
        </div>
        <Sprout className="h-6 w-6 text-green-500" />
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Droplets className="h-4 w-4 text-blue-500 mr-2" />
              <span className="text-gray-600 dark:text-gray-300">Soil Moisture</span>
            </div>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {cropHealth.soil_moisture}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div 
              className="bg-blue-500 h-2 rounded-full" 
              style={{ width: `${cropHealth.soil_moisture}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Sprout className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-gray-600 dark:text-gray-300">Growth Stage</span>
            </div>
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {cropHealth.growth_stage}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${cropHealth.growth_percentage}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Bug className="h-4 w-4 text-yellow-500 mr-2" />
              <span className="text-gray-600 dark:text-gray-300">Pest Risk</span>
            </div>
            <span className={`font-semibold ${
              cropHealth.pest_risk === 'low' ? 'text-green-600 dark:text-green-400' :
              cropHealth.pest_risk === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
              'text-red-600 dark:text-red-400'
            }`}>
              {cropHealth.pest_risk.charAt(0).toUpperCase() + cropHealth.pest_risk.slice(1)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div 
              className={`h-2 rounded-full ${getRiskColor(cropHealth.pest_risk)}`}
              style={{ width: `${cropHealth.pest_risk_percentage}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-gray-600 dark:text-gray-300">Disease Risk</span>
            </div>
            <span className={`font-semibold ${
              cropHealth.disease_risk === 'low' ? 'text-green-600 dark:text-green-400' :
              cropHealth.disease_risk === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
              'text-red-600 dark:text-red-400'
            }`}>
              {cropHealth.disease_risk.charAt(0).toUpperCase() + cropHealth.disease_risk.slice(1)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div 
              className={`h-2 rounded-full ${getRiskColor(cropHealth.disease_risk)}`}
              style={{ width: `${cropHealth.disease_risk_percentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {new Date(cropHealth.last_updated).toLocaleTimeString()}
          </span>
          <button className="flex items-center text-sm text-green-600 hover:text-green-700 font-medium dark:text-green-400 dark:hover:text-green-300">
            View detailed report
            <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CropHealthWidget;