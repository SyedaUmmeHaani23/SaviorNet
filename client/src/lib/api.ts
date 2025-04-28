import { apiRequest } from './queryClient';

// Shelters
export const fetchShelters = async () => {
  const response = await fetch('/api/shelters');
  if (!response.ok) throw new Error('Failed to fetch shelters');
  return response.json();
};

// Rescue Teams
export const fetchRescueTeams = async () => {
  const response = await fetch('/api/rescue-teams');
  if (!response.ok) throw new Error('Failed to fetch rescue teams');
  return response.json();
};

export const updateTeamStatus = async (teamId: number, status: string) => {
  return apiRequest('PATCH', `/api/rescue-teams/${teamId}/status`, { status });
};

export const updateTeamLocation = async (teamId: number, location: { lat: number; lng: number }) => {
  return apiRequest('PATCH', `/api/rescue-teams/${teamId}/location`, { location });
};

// Victims
export const fetchVictims = async () => {
  const response = await fetch('/api/victims');
  if (!response.ok) throw new Error('Failed to fetch victims');
  return response.json();
};

export const createVictim = async (victimData: any) => {
  return apiRequest('POST', '/api/victims', victimData);
};

// Disaster Predictions
export const fetchPredictions = async () => {
  const response = await fetch('/api/predictions');
  if (!response.ok) throw new Error('Failed to fetch predictions');
  return response.json();
};

export const createPrediction = async (predictionData: any) => {
  return apiRequest('POST', '/api/predictions', predictionData);
};

export const simulatePrediction = async (data: { disasterType: string; region: string }) => {
  return apiRequest('POST', '/api/simulate/prediction', data);
};

// Alerts
export const fetchAlerts = async (active?: boolean) => {
  const url = active !== undefined ? `/api/alerts?active=${active}` : '/api/alerts';
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch alerts');
  return response.json();
};

export const createAlert = async (alertData: any) => {
  return apiRequest('POST', '/api/alerts', alertData);
};

export const deactivateAlert = async (alertId: number) => {
  return apiRequest('PATCH', `/api/alerts/${alertId}/deactivate`, {});
};
