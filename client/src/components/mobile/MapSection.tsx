import React, { useState, useEffect } from 'react';
import { MapPin, Eye } from 'lucide-react';
import { Shelter } from '@shared/schema';
import { findNearestShelters, getCurrentLocation } from '@/lib/mapUtils';

interface MapSectionProps {
  shelters: Shelter[];
}

const MapSection: React.FC<MapSectionProps> = ({ shelters }) => {
  const [nearestShelters, setNearestShelters] = useState<(Shelter & { distance: number })[]>([]);
  
  useEffect(() => {
    const fetchNearestShelters = async () => {
      try {
        const location = await getCurrentLocation();
        const nearest = findNearestShelters(location.lat, location.lng, shelters);
        setNearestShelters(nearest);
      } catch (error) {
        console.error('Error finding nearest shelters:', error);
      }
    };
    
    if (shelters.length > 0) {
      fetchNearestShelters();
    }
  }, [shelters]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">Nearest Safe Zones</h2>
      <div className="map-container rounded-lg shadow-md relative mb-4">
        {/* Map container - in production would render Google Maps */}
        <div className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow">
          <Eye className="h-6 w-6 text-neutral-dark" />
        </div>
      </div>
      
      {/* Shelter List */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h3 className="font-semibold mb-2">Available Shelters</h3>
        
        {nearestShelters.length === 0 ? (
          <p className="text-gray-500 py-3">No shelters available in your area</p>
        ) : (
          nearestShelters.map(shelter => (
            <div key={shelter.id} className="border-b border-gray-200 py-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{shelter.name}</p>
                  <p className="text-sm text-gray-600">
                    {shelter.distance.toFixed(1)} km away • Capacity: {shelter.currentOccupancy}/{shelter.capacity}
                  </p>
                </div>
                <button className="bg-secondary text-white px-3 py-1 rounded text-sm">
                  Directions
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MapSection;
