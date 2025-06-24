// import React, { useState } from 'react';
// import { Map as MapIcon, Layers, Wind, Thermometer, Droplets, Cloud, Sun } from 'lucide-react';

// const FarmMap = () => {
//   const [selectedLayer, setSelectedLayer] = useState('temperature-2m');

//   const layers = [
//     { id: 'temperature-2m', icon: Thermometer, label: 'Temperature', param: 'temperature-2m' },
//     { id: 'wind', icon: Wind, label: 'Wind', param: 'wind' },
//     { id: 'precipitation', icon: Droplets, label: 'Precipitation', param: 'precipitation' },
//     { id: 'clouds', icon: Cloud, label: 'Clouds', param: 'clouds' },
//     { id: 'pressure', icon: Layers, label: 'Pressure', param: 'pressure' },
//     { id: 'satellite', icon: Sun, label: 'Satellite', param: 'satellite' }
//   ];

//   const getVentuskyUrl = (layer: string) => {
//     return `https://embed.ventusky.com/chagtm/?p=18.52;73.85;7&l=${layer}&pin=18.52;73.85;dot;Pune`;
//   };

//   return (
//     <div className="max-w-7xl mx-auto p-6">
//       <div className="flex items-center gap-3 mb-8">
//         <MapIcon className="h-8 w-8 text-green-600" />
//         <h1 className="text-3xl font-bold text-gray-900">Farm Map</h1>
//       </div>

//       <div className="bg-white rounded-xl shadow-sm">
//         <div className="p-6">
//           {/* Layer Controls */}
//           <div className="mb-6">
//             <h2 className="text-lg font-semibold text-gray-800 mb-4">Map Layers</h2>
//             <div className="flex flex-wrap gap-3">
//               {layers.map(layer => (
//                 <button
//                   key={layer.id}
//                   onClick={() => setSelectedLayer(layer.param)}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
//                     selectedLayer === layer.param
//                       ? 'bg-green-50 text-green-600'
//                       : 'text-gray-600 hover:bg-gray-50'
//                   }`}
//                 >
//                   <layer.icon className="h-5 w-5" />
//                   <span>{layer.label}</span>
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Map Container */}
//           <div className="relative rounded-lg overflow-hidden bg-gray-100" style={{ height: '70vh' }}>
//             <div className="absolute inset-0" style={{
//               display: 'block',
//               position: 'relative',
//               maxWidth: '177.778vh',
//               margin: 'auto',
//               height: '100%'
//             }}>
//               <div style={{
//                 display: 'block',
//                 position: 'relative',
//                 width: '100%',
//                 height: '100%',
//                 boxSizing: 'content-box',
//                 margin: 0,
//                 padding: 0
//               }}>
//                 <iframe
//                   src={getVentuskyUrl(selectedLayer)}
//                   style={{
//                     display: 'block',
//                     position: 'absolute',
//                     left: 0,
//                     top: 0,
//                     width: '100%',
//                     height: '100%',
//                     margin: 0,
//                     padding: 0,
//                     border: 0
//                   }}
//                   loading="lazy"
//                   title="Ventusky Weather Map"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Legend */}
//           <div className="mt-6 p-4 bg-gray-50 rounded-lg">
//             <h3 className="text-sm font-medium text-gray-700 mb-3">Map Legend</h3>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               <div className="flex items-center gap-2">
//                 <Wind className="h-4 w-4 text-blue-500" />
//                 <span className="text-sm text-gray-600">Wind Speed (km/h)</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Thermometer className="h-4 w-4 text-red-500" />
//                 <span className="text-sm text-gray-600">Temperature (°C)</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Droplets className="h-4 w-4 text-blue-500" />
//                 <span className="text-sm text-gray-600">Precipitation (mm)</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Cloud className="h-4 w-4 text-gray-500" />
//                 <span className="text-sm text-gray-600">Cloud Cover (%)</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FarmMap;

//Windly

import React, { useState } from 'react';
import { Map as MapIcon, Layers, Wind, Thermometer, Droplets, Cloud, Sun } from 'lucide-react';

const FarmMap = () => {
  const [selectedLayer, setSelectedLayer] = useState('wind');

  const layers = [
    { id: 'wind', icon: Wind, label: 'Wind', param: 'wind' },
    { id: 'temp', icon: Thermometer, label: 'Temperature', param: 'temp' },
    { id: 'rain', icon: Droplets, label: 'Rain', param: 'rain' },
    { id: 'clouds', icon: Cloud, label: 'Clouds', param: 'clouds' },
    { id: 'pressure', icon: Layers, label: 'Pressure', param: 'pressure' },
    { id: 'satellite', icon: Sun, label: 'Satellite', param: 'satellite' },
  ];

  const getWindyUrl = (layer: string) => {
    return 'https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=default&metricTemp=default&metricWind=default&zoom=5&overlay=${layer}&product=ecmwf&level=surface&lat=18.521&lon=73.85';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <MapIcon className="h-8 w-8 text-green-600" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Farm Map</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          {/* Layer Controls */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Map Layers</h2>
            <div className="flex flex-wrap gap-3">
              {layers.map(layer => (
                <button
                key={layer.id}
                onClick={() => setSelectedLayer(layer.param)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedLayer === layer.param
                    ? 'bg-green-50 text-green-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <layer.icon className="h-5 w-5" />
                <span>{layer.label}</span>
              </button>
              
              ))}
            </div>
          </div>

          {/* Map Container */}
          <div className="relative rounded-lg overflow-hidden bg-gray-100" style={{ height: '70vh' }}>
            <iframe
              src={getWindyUrl(selectedLayer)}
              width="100%"
              height="100%"
              frameBorder="0"
              title="Windy Weather Map"
              className="absolute inset-0"
            />
          </div>

          {/* Legend */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Map Legend</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-600">Wind Speed (km/h)</span>
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-red-500" />
                <span className="text-sm text-gray-600">Temperature (°C)</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-600">Precipitation (mm)</span>
              </div>
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Cloud Cover (%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmMap;  