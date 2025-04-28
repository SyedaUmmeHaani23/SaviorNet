import React, { useEffect, useState } from 'react';
import { Filter, RefreshCw, MapPin, Clock, Users, Home, AlertTriangle } from 'lucide-react';
import { useDisaster } from '@/context/DisasterContext';
import { formatDistanceToNow } from 'date-fns';

type FilterType = 'all' | 'victims' | 'teams' | 'shelters';

const EmergencyMap: React.FC = () => {
  const { victims, rescueTeams, shelters } = useDisaster();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedMarker, setSelectedMarker] = useState<{type: string; id: number} | null>(null);
  
  const pendingVictims = victims.filter(v => v.status === 'pending');
  
  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate map refresh
    setTimeout(() => {
      setRefreshing(false);
      setLastUpdated(new Date());
    }, 1000);
  };

  // Function to handle marker click simulation
  const handleMarkerClick = (type: string, id: number) => {
    setSelectedMarker({ type, id });
  };
  
  // Close popup when clicking outside
  const handleMapClick = () => {
    setSelectedMarker(null);
  };
  
  // Function to get the appropriate marker details based on the filter
  const getVisibleItems = () => {
    let items = [];
    
    if (activeFilter === 'all' || activeFilter === 'victims') {
      items.push(...pendingVictims.map(v => ({
        id: v.id,
        type: 'victim',
        location: v.location,
        status: v.status,
        sosType: v.sosType
      })));
    }
    
    if (activeFilter === 'all' || activeFilter === 'teams') {
      items.push(...rescueTeams.map(t => ({
        id: t.id,
        type: 'team',
        location: t.location,
        name: t.name,
        specialization: t.specialization,
        status: t.status
      })));
    }
    
    if (activeFilter === 'all' || activeFilter === 'shelters') {
      items.push(...shelters.map(s => ({
        id: s.id,
        type: 'shelter',
        location: s.location,
        name: s.name,
        capacity: s.capacity,
        occupancy: s.currentOccupancy
      })));
    }
    
    return items;
  };
  
  // Demo markers - in a real implementation these would be calculated from the map viewport
  const demoMarkers = [
    { top: '30%', left: '45%', type: 'victim', id: 1 },
    { top: '40%', left: '55%', type: 'team', id: 1 },
    { top: '50%', left: '35%', type: 'shelter', id: 1 },
    { top: '60%', left: '65%', type: 'team', id: 2 },
    { top: '25%', left: '25%', type: 'shelter', id: 2 },
  ];
  
  return (
    <div className="lg:col-span-2 bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Emergency Response Map</h3>
          <div className="flex space-x-2">
            <button 
              className={`px-3 py-1 rounded text-sm flex items-center ${refreshing ? 'opacity-50' : ''}`}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Map
            </button>
          </div>
        </div>
      </div>
      
      {/* Map filters */}
      <div className="px-6 py-3 border-b border-gray-200">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button 
            className={`map-filter-button ${activeFilter === 'all' ? 'map-filter-button-active' : 'map-filter-button-inactive'}`}
            onClick={() => setActiveFilter('all')}
          >
            <span className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" /> Show All
            </span>
          </button>
          <button 
            className={`map-filter-button ${activeFilter === 'victims' ? 'map-filter-button-active' : 'map-filter-button-inactive'}`}
            onClick={() => setActiveFilter('victims')}
          >
            <span className="flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" /> Only Victims ({pendingVictims.length})
            </span>
          </button>
          <button 
            className={`map-filter-button ${activeFilter === 'teams' ? 'map-filter-button-active' : 'map-filter-button-inactive'}`}
            onClick={() => setActiveFilter('teams')}
          >
            <span className="flex items-center">
              <Users className="h-3 w-3 mr-1" /> Only Teams ({rescueTeams.length})
            </span>
          </button>
          <button 
            className={`map-filter-button ${activeFilter === 'shelters' ? 'map-filter-button-active' : 'map-filter-button-inactive'}`}
            onClick={() => setActiveFilter('shelters')}
          >
            <span className="flex items-center">
              <Home className="h-3 w-3 mr-1" /> Safe Zones ({shelters.length})
            </span>
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="map-container h-96 rounded-lg relative" onClick={handleMapClick}>
          {/* Map would be rendered here using Google Maps API */}
          
          {/* Demo markers */}
          {demoMarkers.map((marker, index) => {
            // Skip markers based on active filter
            if (activeFilter !== 'all' && activeFilter !== marker.type + 's') {
              return null;
            }
            
            let markerClass = '';
            let markerContent = null;
            
            switch (marker.type) {
              case 'victim':
                markerClass = 'map-marker map-marker-sos w-6 h-6';
                markerContent = <AlertTriangle className="h-3 w-3" />;
                break;
              case 'team':
                markerClass = 'map-marker map-marker-team w-6 h-6';
                markerContent = <Users className="h-3 w-3" />;
                break;
              case 'shelter':
                markerClass = 'map-marker map-marker-safe w-6 h-6';
                markerContent = <Home className="h-3 w-3" />;
                break;
            }
            
            return (
              <div 
                key={`${marker.type}-${marker.id}`}
                className={markerClass}
                style={{ 
                  position: 'absolute', 
                  top: marker.top, 
                  left: marker.left, 
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  zIndex: selectedMarker?.id === marker.id ? 30 : 20
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkerClick(marker.type, marker.id);
                }}
              >
                {markerContent}
              </div>
            );
          })}
          
          {/* Marker info popup */}
          {selectedMarker && (
            <div 
              className="absolute bg-white p-3 rounded-lg shadow-lg z-50 fade-in"
              style={{ 
                bottom: '10%', 
                left: '50%', 
                transform: 'translateX(-50%)',
                width: '260px',
                border: selectedMarker.type === 'victim' ? '1px solid #FF4C4C' : 
                       selectedMarker.type === 'team' ? '1px solid #0066CC' : 
                       '1px solid #00B894'
              }}
            >
              {selectedMarker.type === 'victim' && (
                <>
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Victim #{selectedMarker.id}</h4>
                      <p className="text-xs text-gray-500">Needs evacuation</p>
                    </div>
                  </div>
                  <div className="text-sm mb-2">
                    <p><span className="font-medium">SOS Type:</span> Flood</p>
                    <p><span className="font-medium">Status:</span> Waiting for rescue</p>
                  </div>
                  <button 
                    className="w-full py-1 bg-primary text-white rounded text-sm font-medium"
                  >
                    Dispatch Rescue Team
                  </button>
                </>
              )}
              
              {selectedMarker.type === 'team' && (
                <>
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                      <Users className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Team #{selectedMarker.id}: {selectedMarker.id === 1 ? 'Alpha' : 'Beta'}</h4>
                      <p className="text-xs text-gray-500">2 members, available</p>
                    </div>
                  </div>
                  <div className="text-sm mb-2">
                    <p><span className="font-medium">Specialization:</span> {selectedMarker.id === 1 ? 'Flood' : 'Earthquake'} Rescue</p>
                    <p><span className="font-medium">Contact:</span> +91-98765-4321{selectedMarker.id}</p>
                  </div>
                  <button 
                    className="w-full py-1 bg-secondary text-white rounded text-sm font-medium"
                  >
                    Contact Team
                  </button>
                </>
              )}
              
              {selectedMarker.type === 'shelter' && (
                <>
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                      <Home className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">{selectedMarker.id === 1 ? 'Government High School' : 'Community Center'}</h4>
                      <p className="text-xs text-gray-500">Safe evacuation zone</p>
                    </div>
                  </div>
                  <div className="text-sm mb-2">
                    <p><span className="font-medium">Capacity:</span> {selectedMarker.id === 1 ? '200' : '150'} people</p>
                    <p><span className="font-medium">Occupancy:</span> {selectedMarker.id === 1 ? '45' : '32'} people</p>
                    <p><span className="font-medium">Amenities:</span> Water, Food, Medical</p>
                  </div>
                  <button 
                    className="w-full py-1 bg-accent text-white rounded text-sm font-medium"
                  >
                    View Shelter Details
                  </button>
                </>
              )}
            </div>
          )}
          
          {/* Map legend */}
          <div className="absolute top-3 right-3 bg-white p-2 rounded shadow z-10">
            <div className="flex items-center space-x-2 text-sm mb-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span>SOS Alert ({pendingVictims.length})</span>
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
        
        {/* Last updated timestamp */}
        <div className="mt-2 flex justify-end">
          <span className="last-updated">
            <Clock className="h-3 w-3" /> Map Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EmergencyMap;
