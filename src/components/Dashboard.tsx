// import React from 'react';
// import CropHealthWidget from './CropHealthWidget';
// import RecommendationsWidget from './RecommendationsWidget';
// import MapWidget from './MapWidget';

// const Dashboard = () => {
//   return (
//     <div className="max-w-7xl mx-auto">
//       <header className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900">Welcome back, Farmer</h1>
//         <p className="text-gray-600 mt-2">Here's your farm's overview for today</p>
//       </header>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <CropHealthWidget />
//         <RecommendationsWidget />
//         <div className="md:col-span-2">
//           <MapWidget />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;


// import React from 'react';
// import CropHealthWidget from './CropHealthWidget';
// import RecommendationsWidget from './RecommendationsWidget';
// import MapWidget from './MapWidget';
// import { useAuth } from '../contexts/AuthContext';

// const Dashboard = () => {
//   const { user } = useAuth();

//   return (
//     <div className="max-w-7xl mx-auto">
//       <header className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900">
//           Welcome back, {user?.name}
//         </h1>
//         <p className="text-gray-600 mt-2">Here's your farm's overview for today</p>
//       </header>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <CropHealthWidget />
//         <RecommendationsWidget />
//         <div className="md:col-span-2">
//           <MapWidget />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

// import React from 'react';
// import CropHealthWidget from './CropHealthWidget';
// import RecommendationsWidget from './RecommendationsWidget';
// import MapWidget from './MapWidget';
// import { useAuth } from '../contexts/AuthContext';

// const Dashboard = () => {
//   const { user } = useAuth();

//   return (
//     <div className="pl-72 max-w-7xl mx-auto">
//       {/* Added padding-left to accommodate the sidebar */}
//       <header className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900">
//           Welcome back, {user?.name}
//         </h1>
//         <p className="text-gray-600 mt-2">Here's your farm's overview for today</p>
//       </header>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <CropHealthWidget />
//         <RecommendationsWidget />
//         <div className="md:col-span-2">
//           <MapWidget />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

// import React from 'react';
// import CropHealthWidget from './CropHealthWidget';
// import RecommendationsWidget from './RecommendationsWidget';
// import MapWidget from './MapWidget';
// import { useAuth } from '../contexts/AuthContext';

// const Dashboard = () => {
//   const { user } = useAuth();

//   return (
//     <div className="max-w-7xl mx-auto">
//       {/* Removed padding-left */}
//       <header className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900">
//           Welcome back, {user?.name}
//         </h1>
//         <p className="text-gray-600 mt-2">Here's your farm's overview for today</p>
//       </header>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <CropHealthWidget />
//         <RecommendationsWidget />
//         <div className="md:col-span-2">
//           <MapWidget />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

import React from 'react';
import CropHealthWidget from './CropHealthWidget';
import RecommendationsWidget from './RecommendationsWidget';
import MapWidget from './MapWidget';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Removed padding-left */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Here's your farm's overview for today
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CropHealthWidget />
        <RecommendationsWidget />
        <div className="md:col-span-2">
          <MapWidget />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
