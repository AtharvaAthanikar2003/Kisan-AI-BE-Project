import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import LoginPage from './components/LoginPage';
import PredictionPage from './components/PredictionPage';
import AIAssistant from './components/AIAssistant';
import NewsPage from './components/NewsPage';
import WeatherPage from './components/Weather/WeatherPage';
import AlertsPage from './components/AlertsPage';
import AnalyticsPage from './components/Analytics/AnalyticsPage';
import FarmOperations from './components/FarmManagement/FarmOperations';
import Finance from './components/FarmManagement/Finance';
import Logistics from './components/FarmManagement/Logistics';
import Workforce from './components/FarmManagement/Workforce';
import Reports from './components/FarmManagement/Reports';
import Inventory from './components/FarmManagement/Inventory';
import FarmMap from './components/FarmMap/FarmMap';
import CVPrediction from './components/CVPrediction';
import ObjectDetection from './components/ObjectDetection';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

function AppContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'weather':
        return <WeatherPage />;
      case 'prediction':
        return <PredictionPage />;
      case 'cvprediction':
        return <CVPrediction />;
      case 'objectdetection':
        return <ObjectDetection />;
      case 'assistant':
        return <AIAssistant />;
      case 'news':
        return <NewsPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'map':
        return <FarmMap />;
      case 'operations':
        return <FarmOperations />;
      case 'finance':
        return <Finance />;
      case 'logistics':
        return <Logistics />;
      case 'workforce':
        return <Workforce />;
      case 'reports':
        return <Reports />;
      case 'inventory':
        return <Inventory />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile menu button */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-green-600 text-white"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {/* Main Content */}
      <main className={`transition-all duration-300 ${isSidebarOpen ? 'lg:ml-72' : 'ml-0'} p-4`}>
        <div className="max-w-[2000px] mx-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;