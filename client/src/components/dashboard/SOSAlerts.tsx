import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { useDisaster } from '@/context/DisasterContext';
import { formatDistanceToNow } from 'date-fns';

const SOSAlerts: React.FC = () => {
  const { victims, availableTeams, assignTeam } = useDisaster();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  const activeVictims = victims.filter(victim => 
    victim.status === 'pending' || victim.status === 'assigned'
  );

  // Handle data refresh
  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate fetch delay (would be real fetch in production)
    setTimeout(() => {
      setLastUpdated(new Date());
      setRefreshing(false);
    }, 1000);
  };
  
  const handleAssignTeam = (victimId: number) => {
    if (availableTeams.length === 0) {
      alert('No available teams');
      return;
    }
    
    // For simplicity, just assign the first available team
    assignTeam(victimId, availableTeams[0].id);
  };
  
  const getBorderColor = (sosType: string) => {
    switch (sosType.toLowerCase()) {
      case 'flood':
        return 'border-red-500';
      case 'earthquake':
        return 'border-amber-500';
      case 'medical':
        return 'border-green-500';
      default:
        return 'border-red-500';
    }
  };
  
  const getTypeColor = (sosType: string) => {
    switch (sosType.toLowerCase()) {
      case 'flood':
        return 'text-red-600';
      case 'earthquake':
        return 'text-amber-600';
      case 'medical':
        return 'text-green-600';
      default:
        return 'text-red-600';
    }
  };
  
  return (
    <div className={`bg-white rounded-lg shadow ${activeVictims.length > 0 ? 'sos-pulse-border' : ''}`}>
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold">Active SOS Alerts</h3>
          {activeVictims.length > 0 && (
            <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" /> {activeVictims.length}
            </span>
          )}
        </div>
        <button
          className={`p-2 text-gray-500 hover:text-gray-700 rounded-full ${refreshing ? 'bg-gray-100' : ''}`}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="p-4 max-h-[500px] overflow-y-auto">
        {activeVictims.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center justify-center space-y-2">
            <div className="w-14 h-14 bg-green-100 text-green-500 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8" />
            </div>
            <p className="text-gray-700 font-medium">All Clear!</p>
            <p className="text-gray-500 text-sm">No active SOS alerts at this time</p>
          </div>
        ) : (
          activeVictims.map(victim => (
            <div 
              key={victim.id} 
              className={`border-l-4 ${getBorderColor(victim.sosType)} 
                ${victim.status === 'pending' ? 'sos-pulse-bg' : ''}
                bg-white p-4 rounded shadow mb-4 fade-in`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">Victim #{victim.id}</h4>
                  <p className="text-sm text-gray-600">
                    {victim.location ? `Lat: ${victim.location.lat.toFixed(4)}, Lng: ${victim.location.lng.toFixed(4)}` : 'Location unknown'}
                  </p>
                  <p className="text-sm">
                    <span className={`${getTypeColor(victim.sosType)} font-medium`}>SOS Type:</span> {victim.sosType}
                  </p>
                  <div className="flex items-center text-gray-500 text-xs mt-1">
                    <Clock className="h-4 w-4 mr-1" />
                    {victim.timestamp ? formatDistanceToNow(new Date(victim.timestamp), { addSuffix: true }) : 'Unknown time'}
                  </div>
                </div>
                {victim.status === 'pending' ? (
                  <button 
                    className="bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded text-sm font-medium"
                    onClick={() => handleAssignTeam(victim.id)}
                    disabled={availableTeams.length === 0}
                  >
                    Dispatch Rescue
                  </button>
                ) : (
                  <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm">
                    Team #{victim.assignedTeamId}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <span className="last-updated">
            <Clock className="h-3 w-3" /> SOS List Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </span>
        </div>
        <button 
          className="w-full py-2 bg-secondary hover:bg-secondary-dark text-white rounded-lg font-medium"
          onClick={() => window.location.href = '/victims'}
        >
          View All Alerts
        </button>
      </div>
    </div>
  );
};

export default SOSAlerts;
