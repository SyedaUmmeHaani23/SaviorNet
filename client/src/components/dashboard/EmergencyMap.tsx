import React, { useEffect, useState } from 'react';
import { Filter, RefreshCw } from 'lucide-react';
import { useDisaster } from '@/context/DisasterContext';

const EmergencyMap: React.FC = () => {
  const { victims, rescueTeams, shelters } = useDisaster();
  const [refreshing, setRefreshing] = useState(false);
  
  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate map refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  return (
    <div className="lg:col-span-2 bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Emergency Response Map</h3>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-gray-100 rounded text-sm flex items-center">
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </button>
            <button 
              className={`px-3 py-1 bg-gray-100 rounded text-sm flex items-center ${refreshing ? 'opacity-50' : ''}`}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="map-container h-96 rounded-lg relative">
          {/* Map would be rendered here using Google Maps API */}
          <div className="absolute top-3 right-3 bg-white p-2 rounded shadow z-10">
            <div className="flex items-center space-x-2 text-sm mb-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span>SOS Alert ({victims.filter(v => v.status === 'pending').length})</span>
            </div>
            <div className="flex items-center space-x-2 text-sm mb-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span>Rescue Team ({rescueTeams.length})</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span>Safe Zone ({shelters.length})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyMap;
