import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Alert, 
  DisasterPrediction, 
  RescueTeam, 
  Victim, 
  Shelter 
} from '@shared/schema';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface DisasterContextType {
  alerts: Alert[];
  activeAlerts: Alert[];
  predictions: DisasterPrediction[];
  rescueTeams: RescueTeam[];
  availableTeams: RescueTeam[];
  victims: Victim[];
  pendingVictims: Victim[];
  shelters: Shelter[];
  isLoading: boolean;
  isWebSocketConnected: boolean;
  // Actions
  sendSOS: (sosData: { sosType: string; location: { lat: number; lng: number }; additionalInfo?: string }) => void;
  assignTeam: (victimId: number, teamId: number) => void;
  updateTeamLocation: (teamId: number, location: { lat: number; lng: number }) => void;
  markVictimRescued: (victimId: number) => void;
  runPrediction: (data: { disasterType: string; region: string }) => Promise<DisasterPrediction | null>;
}

const DisasterContext = createContext<DisasterContextType | undefined>(undefined);

export const DisasterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [predictions, setPredictions] = useState<DisasterPrediction[]>([]);
  const [rescueTeams, setRescueTeams] = useState<RescueTeam[]>([]);
  const [victims, setVictims] = useState<Victim[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();

  // Set up WebSocket
  const handleWebSocketMessage = (message: any) => {
    console.log('Received WebSocket message:', message);
    
    switch (message.type) {
      case 'initial_data':
        setPredictions(message.payload.predictions);
        setAlerts(message.payload.activeAlerts);
        setRescueTeams(message.payload.teams);
        setVictims(message.payload.victims);
        setShelters(message.payload.shelters);
        setIsLoading(false);
        break;
        
      case 'new_alert':
        setAlerts(prev => [...prev, message.payload]);
        toast({
          title: "New Alert",
          description: message.payload.message,
          variant: "destructive"
        });
        break;
        
      case 'alert_deactivated':
        setAlerts(prev => prev.map(alert => 
          alert.id === message.payload.id ? message.payload : alert
        ));
        break;
        
      case 'new_prediction':
        setPredictions(prev => [...prev, message.payload]);
        break;
        
      case 'new_sos':
        setVictims(prev => [...prev, message.payload]);
        toast({
          title: "New SOS Alert",
          description: `SOS received for ${message.payload.sosType} incident`,
          variant: "destructive"
        });
        break;
        
      case 'team_assigned':
        setVictims(prev => prev.map(victim => 
          victim.id === message.payload.victim.id ? message.payload.victim : victim
        ));
        setRescueTeams(prev => prev.map(team => 
          team.id === message.payload.team.id ? message.payload.team : team
        ));
        toast({
          title: "Team Assigned",
          description: `Rescue team has been dispatched to the location`,
        });
        break;
        
      case 'team_location_updated':
        setRescueTeams(prev => prev.map(team => 
          team.id === message.payload.id ? message.payload : team
        ));
        break;
        
      case 'victim_rescued':
        setVictims(prev => prev.map(victim => 
          victim.id === message.payload.victim.id ? message.payload.victim : victim
        ));
        setRescueTeams(prev => prev.map(team => 
          team.id === message.payload.team?.id ? message.payload.team : team
        ));
        toast({
          title: "Victim Rescued",
          description: `Rescue operation completed successfully`,
          variant: "default"
        });
        break;
    }
  };
  
  const { isConnected, sendMessage } = useWebSocket({ onMessage: handleWebSocketMessage });

  // Initial data fetching
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [alertsRes, teamsRes, sheltersRes, predictionsRes, victimsRes] = await Promise.all([
          fetch('/api/alerts?active=true'),
          fetch('/api/rescue-teams'),
          fetch('/api/shelters'),
          fetch('/api/predictions'),
          fetch('/api/victims')
        ]);
        
        if (alertsRes.ok) setAlerts(await alertsRes.json());
        if (teamsRes.ok) setRescueTeams(await teamsRes.json());
        if (sheltersRes.ok) setShelters(await sheltersRes.json());
        if (predictionsRes.ok) setPredictions(await predictionsRes.json());
        if (victimsRes.ok) setVictims(await victimsRes.json());
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        toast({
          title: "Connection Error",
          description: "Failed to fetch initial data. Please refresh the page.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (!isConnected) {
      fetchInitialData();
    }
  }, [isConnected, toast]);

  // Derived data
  const activeAlerts = alerts.filter(alert => alert.isActive);
  const availableTeams = rescueTeams.filter(team => team.status === 'available');
  const pendingVictims = victims.filter(victim => victim.status === 'pending');

  // Actions
  const sendSOS = (sosData: { sosType: string; location: { lat: number; lng: number }; additionalInfo?: string }) => {
    sendMessage({
      type: 'sos',
      payload: sosData
    });
    
    toast({
      title: "SOS Sent",
      description: "Your emergency signal has been sent. Help is on the way.",
      variant: "default"
    });
  };

  const assignTeam = (victimId: number, teamId: number) => {
    sendMessage({
      type: 'team_assignment',
      payload: { victimId, teamId }
    });
  };

  const updateTeamLocation = (teamId: number, location: { lat: number; lng: number }) => {
    sendMessage({
      type: 'team_location_update',
      payload: { teamId, location }
    });
  };

  const markVictimRescued = (victimId: number) => {
    sendMessage({
      type: 'victim_rescued',
      payload: { victimId }
    });
  };

  const runPrediction = async (data: { disasterType: string; region: string }): Promise<DisasterPrediction | null> => {
    try {
      const response = await apiRequest('POST', '/api/simulate/prediction', data);
      if (response.ok) {
        const prediction = await response.json();
        return prediction;
      }
      return null;
    } catch (error) {
      console.error('Failed to run prediction:', error);
      toast({
        title: "Prediction Error",
        description: "Failed to generate disaster prediction.",
        variant: "destructive"
      });
      return null;
    }
  };

  return (
    <DisasterContext.Provider value={{
      alerts,
      activeAlerts,
      predictions,
      rescueTeams,
      availableTeams,
      victims,
      pendingVictims,
      shelters,
      isLoading,
      isWebSocketConnected: isConnected,
      sendSOS,
      assignTeam,
      updateTeamLocation,
      markVictimRescued,
      runPrediction
    }}>
      {children}
    </DisasterContext.Provider>
  );
};

export const useDisaster = () => {
  const context = useContext(DisasterContext);
  if (context === undefined) {
    throw new Error('useDisaster must be used within a DisasterProvider');
  }
  return context;
};
