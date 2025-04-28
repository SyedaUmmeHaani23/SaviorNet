import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
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
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { 
  cacheAlerts, 
  cacheShelters, 
  cacheRescueTeams, 
  cacheVictims,
  getCachedAlerts,
  getCachedShelters,
  getCachedRescueTeams,
  getCachedVictims,
  storePendingSOS,
  getPendingSOSRequests,
  clearPendingSOS,
  setupOfflineDetection,
  isOnline,
  getOfflineSettings
} from '@/lib/offlineManager';
import { runDisasterPrediction } from '@/lib/tensorflow';
import { translateAlert, getTextToSpeechUrl, translateText, getCommonPhrase } from '@/lib/translationService';
import { sendSOSViaSMS, sendAlertViaSMS } from '@/lib/smsService';

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
  isOfflineMode: boolean;
  // Actions
  sendSOS: (sosData: { sosType: string; location: { lat: number; lng: number }; additionalInfo?: string }) => void;
  assignTeam: (victimId: number, teamId: number) => void;
  updateTeamLocation: (teamId: number, location: { lat: number; lng: number }) => void;
  markVictimRescued: (victimId: number) => void;
  runPrediction: (data: { disasterType: string; region: string }) => Promise<DisasterPrediction | null>;
  translateAlertMessage: (message: string, language?: string) => Promise<string>;
  getAudioForMessage: (message: string) => Promise<string | null>;
  sendSMSAlert: (phone: string, messageText: string) => Promise<boolean>;
}

const DisasterContext = createContext<DisasterContextType | undefined>(undefined);

export const DisasterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [predictions, setPredictions] = useState<DisasterPrediction[]>([]);
  const [rescueTeams, setRescueTeams] = useState<RescueTeam[]>([]);
  const [victims, setVictims] = useState<Victim[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<any[]>([]);
  
  const { toast } = useToast();
  const isUserOnline = useOnlineStatus();

  // Set up offline detection
  useEffect(() => {
    setupOfflineDetection({
      onOffline: () => {
        setIsOfflineMode(true);
        toast({
          title: "Offline Mode Activated",
          description: "You're now offline. SaviorNet will continue working with cached data.",
          variant: "default"
        });
      },
      onOnline: async () => {
        setIsOfflineMode(false);
        // Send any pending SOS messages that were captured while offline
        const pendingSOS = await getPendingSOSRequests();
        if (pendingSOS.length > 0) {
          toast({
            title: "Connection Restored",
            description: `Sending ${pendingSOS.length} pending SOS requests...`,
            variant: "default"
          });
          
          for (const sos of pendingSOS) {
            try {
              sendMessage({
                type: 'sos',
                payload: sos
              });
              await clearPendingSOS(sos.timestamp);
            } catch (error) {
              console.error('Failed to send pending SOS:', error);
            }
          }
        } else {
          toast({
            title: "Connection Restored",
            description: "You're back online. Data will now be synchronized.",
            variant: "default"
          });
        }
        
        // Refresh data
        fetchInitialData();
      }
    });
  }, []);

  // Track offline mode based on network status
  useEffect(() => {
    setIsOfflineMode(!isUserOnline);
  }, [isUserOnline]);

  // Handle WebSocket messages with translation support
  const handleWebSocketMessage = async (message: any) => {
    console.log('Received WebSocket message:', message);
    
    switch (message.type) {
      case 'initial_data':
        setPredictions(message.payload.predictions);
        setAlerts(message.payload.activeAlerts);
        setRescueTeams(message.payload.teams);
        setVictims(message.payload.victims);
        setShelters(message.payload.shelters);
        setIsLoading(false);
        
        // Cache data for offline use
        const offlineSettings = await getOfflineSettings();
        if (offlineSettings.enabled) {
          if (offlineSettings.cacheAlerts) await cacheAlerts(message.payload.activeAlerts);
          if (offlineSettings.cacheShelters) await cacheShelters(message.payload.shelters);
          if (offlineSettings.cacheTeams) await cacheRescueTeams(message.payload.teams);
          await cacheVictims(message.payload.victims);
        }
        break;
        
      case 'new_alert':
        setAlerts(prev => [...prev, message.payload]);
        
        // Translate the alert for the user
        const translatedAlert = await translateAlert(message.payload);
        
        // Get text-to-speech URL if available
        const audioUrl = await getTextToSpeechUrl(translatedAlert.message);
        
        toast({
          title: translatedAlert.title,
          description: translatedAlert.message,
          variant: "destructive",
          // Play audio if available (in actual implementation this would be a component with audio)
          // action: audioUrl ? <AudioPlayer src={audioUrl} /> : undefined
        });
        
        // Cache the new alert
        cacheAlerts([...alerts, message.payload]);
        break;
        
      case 'alert_deactivated':
        setAlerts(prev => prev.map(alert => 
          alert.id === message.payload.id ? message.payload : alert
        ));
        
        // Update cached alerts
        const updatedAlerts = alerts.map(alert => 
          alert.id === message.payload.id ? message.payload : alert
        );
        cacheAlerts(updatedAlerts);
        break;
        
      case 'new_prediction':
        setPredictions(prev => [...prev, message.payload]);
        break;
        
      case 'new_sos':
        setVictims(prev => [...prev, message.payload]);
        
        // Translate SOS notification
        const sosType = await translateText(message.payload.sosType);
        
        toast({
          title: await translateText("New SOS Alert"),
          description: `SOS received for ${sosType} incident`,
          variant: "destructive"
        });
        
        // Cache victim data
        cacheVictims([...victims, message.payload]);
        break;
        
      case 'team_assigned':
        setVictims(prev => prev.map(victim => 
          victim.id === message.payload.victim.id ? message.payload.victim : victim
        ));
        setRescueTeams(prev => prev.map(team => 
          team.id === message.payload.team.id ? message.payload.team : team
        ));
        
        // Translate team assignment notification
        toast({
          title: await translateText("Team Assigned"),
          description: await translateText("Rescue team has been dispatched to the location"),
        });
        
        // Update cached data
        const updatedVictims = victims.map(victim => 
          victim.id === message.payload.victim.id ? message.payload.victim : victim
        );
        
        const updatedTeams = rescueTeams.map(team => 
          team.id === message.payload.team.id ? message.payload.team : team
        );
        
        cacheVictims(updatedVictims);
        cacheRescueTeams(updatedTeams);
        break;
        
      case 'team_location_updated':
        setRescueTeams(prev => prev.map(team => 
          team.id === message.payload.id ? message.payload : team
        ));
        
        // Update cached rescue teams
        const teamsAfterLocationUpdate = rescueTeams.map(team => 
          team.id === message.payload.id ? message.payload : team
        );
        
        cacheRescueTeams(teamsAfterLocationUpdate);
        break;
        
      case 'victim_rescued':
        setVictims(prev => prev.map(victim => 
          victim.id === message.payload.victim.id ? message.payload.victim : victim
        ));
        setRescueTeams(prev => prev.map(team => 
          team.id === message.payload.team?.id ? message.payload.team : team
        ));
        
        // Translate rescue notification
        toast({
          title: await translateText("Victim Rescued"),
          description: await translateText("Rescue operation completed successfully"),
          variant: "default"
        });
        
        // Update cached data
        const victimsAfterRescue = victims.map(victim => 
          victim.id === message.payload.victim.id ? message.payload.victim : victim
        );
        
        const teamsAfterRescue = rescueTeams.map(team => 
          team.id === message.payload.team?.id ? message.payload.team : team
        );
        
        cacheVictims(victimsAfterRescue);
        cacheRescueTeams(teamsAfterRescue);
        break;
    }
  };
  
  const { isConnected, sendMessage } = useWebSocket({ 
    onMessage: handleWebSocketMessage,
    reconnectInterval: 10000 // More aggressive reconnection for emergency system
  });

  // Initial data fetching with offline fallback
  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      // First try to fetch from API if online
      if (isOnline()) {
        try {
          const [alertsRes, teamsRes, sheltersRes, predictionsRes, victimsRes] = await Promise.all([
            fetch('/api/alerts?active=true'),
            fetch('/api/rescue-teams'),
            fetch('/api/shelters'),
            fetch('/api/predictions'),
            fetch('/api/victims')
          ]);
          
          // Process responses and cache for offline use
          if (alertsRes.ok) {
            const alertsData = await alertsRes.json();
            setAlerts(alertsData);
            await cacheAlerts(alertsData);
          }
          
          if (teamsRes.ok) {
            const teamsData = await teamsRes.json();
            setRescueTeams(teamsData);
            await cacheRescueTeams(teamsData);
          }
          
          if (sheltersRes.ok) {
            const sheltersData = await sheltersRes.json();
            setShelters(sheltersData);
            await cacheShelters(sheltersData);
          }
          
          if (predictionsRes.ok) {
            const predictionsData = await predictionsRes.json();
            setPredictions(predictionsData);
          }
          
          if (victimsRes.ok) {
            const victimsData = await victimsRes.json();
            setVictims(victimsData);
            await cacheVictims(victimsData);
          }
          
          setIsOfflineMode(false);
          return; // Successfully fetched online data, no need for cached data
        } catch (error) {
          console.warn('Failed to fetch online data, falling back to cache:', error);
          // Fall through to use cached data
        }
      }
      
      // If offline or online fetch failed, use cached data
      const [cachedAlerts, cachedTeams, cachedShelters, cachedVictims] = await Promise.all([
        getCachedAlerts(),
        getCachedRescueTeams(),
        getCachedShelters(),
        getCachedVictims()
      ]);
      
      if (cachedAlerts) {
        setAlerts(cachedAlerts);
        console.log('[Offline] Using cached alerts');
      }
      
      if (cachedTeams) {
        setRescueTeams(cachedTeams);
        console.log('[Offline] Using cached rescue teams');
      }
      
      if (cachedShelters) {
        setShelters(cachedShelters);
        console.log('[Offline] Using cached shelters');
      }
      
      if (cachedVictims) {
        setVictims(cachedVictims);
        console.log('[Offline] Using cached victims');
      }
      
      // If we're using cached data, set offline mode
      if (cachedAlerts || cachedTeams || cachedShelters || cachedVictims) {
        setIsOfflineMode(true);
        toast({
          title: "Offline Mode",
          description: "Using cached data. Some features may be limited.",
          variant: "default"
        });
      } else if (!isOnline()) {
        // No cached data available and offline
        toast({
          title: "No Data Available",
          description: "You're offline and no cached data is available.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
      toast({
        title: "Connection Error",
        description: "Failed to fetch data. Please check your connection.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Load data on component mount
  useEffect(() => {
    if (!isConnected) {
      fetchInitialData();
    }
  }, [isConnected, fetchInitialData]);

  // Derived data
  const activeAlerts = alerts.filter(alert => alert.isActive);
  const availableTeams = rescueTeams.filter(team => team.status === 'available');
  const pendingVictims = victims.filter(victim => victim.status === 'pending');

  // Enhanced actions with offline support
  const sendSOS = async (sosData: { sosType: string; location: { lat: number; lng: number }; additionalInfo?: string }) => {
    // Add timestamp for offline queue tracking
    const sosWithTimestamp = {
      ...sosData,
      timestamp: new Date().toISOString()
    };
    
    // First try WebSocket if connected
    if (isConnected && isOnline()) {
      sendMessage({
        type: 'sos',
        payload: sosWithTimestamp
      });
      
      toast({
        title: getCommonPhrase('SOS_RECEIVED'),
        description: getCommonPhrase('HELP_ON_WAY'),
        variant: "default"
      });
      
      return;
    }
    
    // If offline, store for later sending and try SMS fallback
    await storePendingSOS(sosWithTimestamp);
    
    // Try SMS fallback if WebSocket is unavailable
    const smsResult = await sendSOSViaSMS(sosData);
    
    if (smsResult.success) {
      toast({
        title: "SOS Sent via SMS",
        description: getCommonPhrase('HELP_ON_WAY'),
        variant: "default"
      });
    } else {
      toast({
        title: "SOS Stored",
        description: "Your SOS will be sent when connection is restored. Please seek shelter immediately.",
        variant: "destructive"
      });
    }
  };

  const assignTeam = (victimId: number, teamId: number) => {
    if (!isOfflineMode && isConnected) {
      sendMessage({
        type: 'team_assignment',
        payload: { victimId, teamId }
      });
    } else {
      // In offline mode, we make optimistic updates locally
      // These will sync when we're back online
      const victim = victims.find(v => v.id === victimId);
      const team = rescueTeams.find(t => t.id === teamId);
      
      if (victim && team) {
        // Update local state optimistically
        const updatedVictim = { ...victim, status: 'assigned', assignedTeamId: teamId };
        const updatedTeam = { ...team, status: 'busy' };
        
        setVictims(prev => prev.map(v => v.id === victimId ? updatedVictim : v));
        setRescueTeams(prev => prev.map(t => t.id === teamId ? updatedTeam : t));
        
        // Cache updates
        cacheVictims(victims.map(v => v.id === victimId ? updatedVictim : v));
        cacheRescueTeams(rescueTeams.map(t => t.id === teamId ? updatedTeam : t));
        
        // Store the pending action for later sync
        setPendingMessages(prev => [...prev, {
          type: 'team_assignment',
          payload: { victimId, teamId },
          timestamp: Date.now()
        }]);
        
        toast({
          title: "Team Assigned (Offline)",
          description: "This change will sync when you're back online.",
          variant: "default"
        });
      }
    }
  };

  const updateTeamLocation = (teamId: number, location: { lat: number; lng: number }) => {
    if (!isOfflineMode && isConnected) {
      sendMessage({
        type: 'team_location_update',
        payload: { teamId, location }
      });
    } else {
      // Optimistic update for offline mode
      const team = rescueTeams.find(t => t.id === teamId);
      
      if (team) {
        const updatedTeam = { ...team, location };
        setRescueTeams(prev => prev.map(t => t.id === teamId ? updatedTeam : t));
        
        // Cache the update
        cacheRescueTeams(rescueTeams.map(t => t.id === teamId ? updatedTeam : t));
        
        // Queue for later sync
        setPendingMessages(prev => [...prev, {
          type: 'team_location_update',
          payload: { teamId, location },
          timestamp: Date.now()
        }]);
      }
    }
  };

  const markVictimRescued = (victimId: number) => {
    if (!isOfflineMode && isConnected) {
      sendMessage({
        type: 'victim_rescued',
        payload: { victimId }
      });
    } else {
      // Optimistic update for offline mode
      const victim = victims.find(v => v.id === victimId);
      
      if (victim && victim.assignedTeamId) {
        const team = rescueTeams.find(t => t.id === victim.assignedTeamId);
        
        if (team) {
          // Update victim and team status
          const updatedVictim = { ...victim, status: 'rescued' };
          const updatedTeam = { ...team, status: 'available' };
          
          setVictims(prev => prev.map(v => v.id === victimId ? updatedVictim : v));
          setRescueTeams(prev => prev.map(t => t.id === team.id ? updatedTeam : t));
          
          // Cache updates
          cacheVictims(victims.map(v => v.id === victimId ? updatedVictim : v));
          cacheRescueTeams(rescueTeams.map(t => t.id === team.id ? updatedTeam : t));
          
          // Queue for later sync
          setPendingMessages(prev => [...prev, {
            type: 'victim_rescued',
            payload: { victimId },
            timestamp: Date.now()
          }]);
          
          toast({
            title: "Victim Marked as Rescued (Offline)",
            description: "This update will sync when you're back online.",
            variant: "default"
          });
        }
      }
    }
  };

  // Enhanced prediction with offline support using our new tensorflow service
  const runPrediction = async (data: { disasterType: string; region: string }): Promise<DisasterPrediction | null> => {
    try {
      // Use the enhanced tensorflow service with offline capability
      const prediction = await runDisasterPrediction(data.disasterType, {
        region: data.region,
        timestamp: new Date().toISOString()
      });
      
      if (prediction) {
        // Add to state
        setPredictions(prev => [...prev, prediction]);
        
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
  
  // Translation helper function
  const translateAlertMessage = async (message: string, language?: string): Promise<string> => {
    return await translateText(message, language);
  };
  
  // Text-to-speech helper function
  const getAudioForMessage = async (message: string): Promise<string | null> => {
    return await getTextToSpeechUrl(message);
  };
  
  // SMS alert helper function
  const sendSMSAlert = async (phone: string, messageText: string): Promise<boolean> => {
    const result = await sendAlertViaSMS({
      title: "Emergency Alert",
      message: messageText,
      severity: "high",
      region: "Your Area"
    });
    
    return result.success;
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
