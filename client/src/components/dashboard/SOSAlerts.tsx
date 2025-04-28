import React from 'react';
import { Clock } from 'lucide-react';
import { useDisaster } from '@/context/DisasterContext';
import { formatDistanceToNow } from 'date-fns';

const SOSAlerts: React.FC = () => {
  const { victims, availableTeams, assignTeam } = useDisaster();
  
  const activeVictims = victims.filter(victim => 
    victim.status === 'pending' || victim.status === 'assigned'
  );
  
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
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Active SOS Alerts</h3>
      </div>
      <div className="p-4 max-h-[500px] overflow-y-auto">
        {activeVictims.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No active SOS alerts
          </div>
        ) : (
          activeVictims.map(victim => (
            <div 
              key={victim.id} 
              className={`border-l-4 ${getBorderColor(victim.sosType)} bg-white p-4 rounded shadow mb-4`}
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
                    Assign
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
