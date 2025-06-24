import React from 'react';
import { Cloud } from 'lucide-react';
import WeatherWidget from './WeatherWidget';

const WeatherPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <Cloud className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Weather Forecast</h1>
      </div>

      <WeatherWidget />
    </div>
  );
};

export default WeatherPage;