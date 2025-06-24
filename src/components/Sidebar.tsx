// import React from 'react';
// import { 
//   Leaf, Cloud, BarChart3, Map, MessageSquare, Bell, LogOut, Brain, 
//   Newspaper, Tractor, DollarSign, Truck, Users, LineChart, Warehouse, 
//   Sun, Moon, Camera, Eye 
// } from 'lucide-react';
// import { useAuth } from '../contexts/AuthContext';
// import { useTheme } from '../contexts/ThemeContext';

// interface SidebarProps {
//   currentPage: string;
//   setCurrentPage: (page: string) => void;
//   isOpen: boolean;
//   setIsOpen: (isOpen: boolean) => void;
// }

// const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isOpen, setIsOpen }) => {
//   const { user, logout } = useAuth();
//   const { theme, setTheme } = useTheme();

//   const menuItems = [
//     { icon: Leaf, label: 'Dashboard', id: 'dashboard' },
//     { icon: Cloud, label: 'Weather', id: 'weather' },
//     { icon: BarChart3, label: 'Analytics', id: 'analytics' },
//     { icon: Brain, label: 'Prediction', id: 'prediction' },
//     { icon: Camera, label: 'Disease Detection', id: 'cvprediction' },
//     { icon: Eye, label: 'Object Detection', id: 'objectdetection' },
//     { icon: Map, label: 'Farm Map', id: 'map' },
//     { icon: MessageSquare, label: 'AI Assistant', id: 'assistant' },
//     { icon: Newspaper, label: 'News', id: 'news' },
//     { icon: Bell, label: 'Alerts', id: 'alerts' },
//     { icon: Tractor, label: 'Farm Operations', id: 'operations', description: 'Track daily farming activities' },
//     { icon: DollarSign, label: 'Finance', id: 'finance', description: 'Manage expenses and revenue' },
//     { icon: Truck, label: 'Logistics', id: 'logistics', description: 'Track transportation and delivery' },
//     { icon: Users, label: 'Workforce', id: 'workforce', description: 'Manage farm workers and tasks' },
//     { icon: LineChart, label: 'Reports', id: 'reports', description: 'View analytics and insights' },
//     { icon: Warehouse, label: 'Inventory', id: 'inventory', description: 'Manage supplies and storage' }
//   ];

//   const themeOptions = [
//     { value: 'light', icon: Sun, label: 'Light Theme' },
//     { value: 'dark', icon: Moon, label: 'Dark Theme' }
//   ];

//   const mainMenuItems = menuItems.slice(0, 10);
//   const farmManagementItems = menuItems.slice(10);

//   return (
//     <aside
//       className={`
//         fixed inset-y-0 left-0 z-40
//         bg-primary
//         shadow-lg
//         w-72 pr-4
//         transform transition-transform duration-300
//         ${isOpen ? 'translate-x-0' : '-translate-x-72'}
//       `}
//     >
//       {/* Sidebar Content */}
//       <div className="flex flex-col h-full">
//         <div className="flex items-center justify-between p-4 bg-secondary">
//           <div className="flex items-center gap-2">
//             <Leaf className="h-8 w-8 text-green-600" />
//             <h1 className="text-2xl font-bold text-primary">Kisan AI</h1>
//           </div>
//         </div>

//         <div className="flex-1 p-4 overflow-y-auto">
//           {/* Theme Toggle and Logout */}
//           <div className="flex justify-between gap-2 mb-4">
//             {/* Logout Button */}
//             <button
//               onClick={logout}
//               className="w-full flex items-center gap-4 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
//             >
//               <LogOut className="h-5 w-5" />
//               <span>Log out</span>
//             </button>

//             {/* Theme Toggle */}
//             <div className="flex gap-2">
//               {themeOptions.map(({ value, icon: Icon, label }) => (
//                 <button
//                   key={value}
//                   onClick={() => setTheme(value as 'light' | 'dark')}
//                   className={`p-2 rounded-lg transition-colors ${
//                     theme === value ? 'bg-green-100 text-green-600' : 'hover:bg-secondary'
//                   }`}
//                   title={label}
//                 >
//                   <Icon className="h-5 w-5" />
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* User Info */}
//           {user && (
//             <div className="mb-6 p-4 bg-secondary rounded-lg">
//               <p className="text-sm text-secondary">Welcome,</p>
//               <p className="font-medium text-primary">{user.name}</p>
//             </div>
//           )}

//           {/* Navigation */}
//           <nav className="space-y-8">
//             {/* Main Menu */}
//             <div>
//               <h2 className="px-4 text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
//                 Main Menu
//               </h2>
//               <ul className="space-y-1">
//                 {mainMenuItems.map((item) => (
//                   <li key={item.id}>
//                     <button
//                       onClick={() => setCurrentPage(item.id)}
//                       className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
//                         currentPage === item.id
//                           ? 'bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400'
//                           : 'text-primary hover:bg-secondary'
//                       }`}
//                     >
//                       <item.icon className="h-5 w-5" />
//                       <span>{item.label}</span>
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </div>

//             {/* Farm Management */}
//             <div>
//               <h2 className="px-4 text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
//                 Farm Management
//               </h2>
//               <ul className="space-y-1">
//                 {farmManagementItems.map((item) => (
//                   <li key={item.id}>
//                     <button
//                       onClick={() => setCurrentPage(item.id)}
//                       className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors group ${
//                         currentPage === item.id
//                           ? 'bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400'
//                           : 'text-primary hover:bg-secondary'
//                       }`}
//                     >
//                       <item.icon className="h-5 w-5" />
//                       <div className="flex-1 text-left">
//                         <span>{item.label}</span>
//                         {item.description && (
//                           <p className="text-xs text-secondary group-hover:text-secondary transition-colors">
//                             {item.description}
//                           </p>
//                         )}
//                       </div>
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </nav>
//         </div>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;

import React, { useState } from 'react';
import { 
  Leaf, Cloud, BarChart3, Map, MessageSquare, Bell, LogOut, Brain, 
  Newspaper, Tractor, DollarSign, Truck, Users, LineChart, Warehouse, 
  Sun, Moon, Camera, Eye 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  
  // State to toggle visibility of Farm Management section
  const [isFarmManagementVisible, setIsFarmManagementVisible] = useState(false);

  const menuItems = [
    { icon: Leaf, label: 'Dashboard', id: 'dashboard' },
    { icon: Cloud, label: 'Weather', id: 'weather' },
    { icon: BarChart3, label: 'Analytics', id: 'analytics' },
    // { icon: Brain, label: 'Prediction', id: 'prediction' },
    { icon: Camera, label: 'Disease Detection', id: 'cvprediction' },
    // { icon: Eye, label: 'Object Detection', id: 'objectdetection' },
    { icon: Map, label: 'Farm Map', id: 'map' },
    { icon: MessageSquare, label: 'AI Assistant', id: 'assistant' },
    { icon: Newspaper, label: 'News', id: 'news' },
    { icon: Bell, label: 'Alerts', id: 'alerts' },
    { icon: Tractor, label: 'Farm Operations', id: 'operations', description: 'Track daily farming activities' },
    { icon: DollarSign, label: 'Finance', id: 'finance', description: 'Manage expenses and revenue' },
    { icon: Truck, label: 'Logistics', id: 'logistics', description: 'Track transportation and delivery' },
    { icon: Users, label: 'Workforce', id: 'workforce', description: 'Manage farm workers and tasks' },
    { icon: LineChart, label: 'Reports', id: 'reports', description: 'View analytics and insights' },
    { icon: Warehouse, label: 'Inventory', id: 'inventory', description: 'Manage supplies and storage' }
  ];

  const themeOptions = [
    { value: 'light', icon: Sun, label: 'Light Theme' },
    { value: 'dark', icon: Moon, label: 'Dark Theme' }
  ];

  const mainMenuItems = menuItems.slice(0, 10);
  const farmManagementItems = menuItems.slice(10);

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40
        bg-primary
        shadow-lg
        w-72 pr-4
        transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-72'}
      `}
    >
      {/* Sidebar Content */}
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 bg-secondary">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold text-primary">Kisan AI</h1>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          {/* Theme Toggle and Logout */}
          <div className="flex justify-between gap-2 mb-4">
            {/* Logout Button */}
            <button
              onClick={logout}
              className="w-full flex items-center gap-4 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Log out</span>
            </button>

            {/* Theme Toggle */}
            <div className="flex gap-2">
              {themeOptions.map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value as 'light' | 'dark')}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === value ? 'bg-green-100 text-green-600' : 'hover:bg-secondary'
                  }`}
                  title={label}
                >
                  <Icon className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="mb-6 p-4 bg-secondary rounded-lg">
              <p className="text-sm text-secondary">Welcome,</p>
              <p className="font-medium text-primary">{user.name}</p>
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-8">
            {/* Main Menu */}
            <div>
              <h2 className="px-4 text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
                Main Menu
              </h2>
              <ul className="space-y-1">
                {mainMenuItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setCurrentPage(item.id)}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                        currentPage === item.id
                          ? 'bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400'
                          : 'text-primary hover:bg-secondary'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Farm Management */}
            <div>
              {/* Button to toggle visibility of Farm Management */}
              <button
                onClick={() => setIsFarmManagementVisible(!isFarmManagementVisible)}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors text-primary hover:bg-secondary"
              >
                <span>Farm Management</span>
              </button>

              {isFarmManagementVisible && (
                <div>
                  <h2 className="px-4 text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
                    Farm Management
                  </h2>
                  <ul className="space-y-1">
                    {farmManagementItems.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => setCurrentPage(item.id)}
                          className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors group ${
                            currentPage === item.id
                              ? 'bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400'
                              : 'text-primary hover:bg-secondary'
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          <div className="flex-1 text-left">
                            <span>{item.label}</span>
                            {item.description && (
                              <p className="text-xs text-secondary group-hover:text-secondary transition-colors">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
