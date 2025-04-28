import React from 'react';
import { Search, Bell } from 'lucide-react';
import OverviewCards from '@/components/dashboard/OverviewCards';
import EmergencyMap from '@/components/dashboard/EmergencyMap';
import SOSAlerts from '@/components/dashboard/SOSAlerts';
import AIPredictions from '@/components/dashboard/AIPredictions';
import { useDisaster } from '@/context/DisasterContext';

const Home: React.FC = () => {
  const { activeAlerts, isLoading } = useDisaster();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <>
      {/* Header with alerts count and search */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-dark">Rescue Coordination Dashboard</h1>
          <p className="text-gray-600">Monitor and manage disaster responses in real-time</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
            />
          </div>
          <div className="relative">
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {activeAlerts.length}
            </span>
            <button className="p-2 bg-white rounded-lg shadow">
              <Bell className="h-6 w-6 text-neutral" />
            </button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <OverviewCards />

      {/* Main Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Emergency Map */}
        <EmergencyMap />

        {/* Active SOS Alerts Panel */}
        <SOSAlerts />
      </div>

      {/* AI Prediction Section */}
      <AIPredictions />
    </>
  );
};

export default Home;
