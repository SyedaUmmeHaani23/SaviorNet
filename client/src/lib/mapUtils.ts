/**
 * Simplified map utility functions
 * In a real application, these would interface with Google Maps API
 */

// Calculate distance between two points in kilometers
export function calculateDistance(
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number {
  const R = 6371; // Earth radius in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Generate a random location within a radius of a given point
export function randomLocationNearby(
  centerLat: number, 
  centerLng: number, 
  radiusKm: number = 5
): { lat: number; lng: number } {
  const r = radiusKm * Math.sqrt(Math.random()) / 111.32;
  const theta = Math.random() * 2 * Math.PI;
  
  const lat = centerLat + r * Math.cos(theta);
  const lng = centerLng + r * Math.sin(theta) / Math.cos(centerLat * Math.PI / 180);
  
  return { lat, lng };
}

// Find the nearest shelter to a given location
export function findNearestShelters(
  userLat: number,
  userLng: number,
  shelters: { id: number; name: string; location: { lat: number; lng: number }; capacity: number; currentOccupancy: number }[],
  limit: number = 3
) {
  return shelters
    .map(shelter => ({
      ...shelter,
      distance: calculateDistance(userLat, userLng, shelter.location.lat, shelter.location.lng)
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

// Find the nearest rescue team to a given location
export function findNearestRescueTeam(
  lat: number,
  lng: number,
  teams: { id: number; name: string; location: { lat: number; lng: number }; status: string }[]
) {
  const availableTeams = teams.filter(team => team.status === 'available' && team.location);
  
  if (availableTeams.length === 0) return null;
  
  return availableTeams
    .map(team => ({
      ...team,
      distance: calculateDistance(lat, lng, team.location.lat, team.location.lng)
    }))
    .sort((a, b) => a.distance - b.distance)[0];
}

// Get current user location (geolocation)
export function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
    } else {
      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        error => {
          console.error('Error getting location:', error);
          // Fallback to default location (Vijayawada, India)
          resolve({ lat: 16.5062, lng: 80.6480 });
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  });
}

// Define different map styles for different disaster types
export const mapStyles = {
  default: [],
  flood: [
    { elementType: 'geometry', stylers: [{ color: '#e9f5f8' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#5b7f9a' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#ffffff' }] }
  ],
  earthquake: [
    { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ccc' }] }
  ],
  wildfire: [
    { elementType: 'geometry', stylers: [{ color: '#fff2e6' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#b2d8a7' }] }
  ]
};
