import localForage from 'localforage';
import { Alert, Shelter, RescueTeam, Victim } from '@shared/schema';

// Initialize localForage instances for different data types
const alertsCache = localForage.createInstance({ name: 'alerts' });
const sheltersCache = localForage.createInstance({ name: 'shelters' });
const teamsCache = localForage.createInstance({ name: 'rescueTeams' });
const victimsCache = localForage.createInstance({ name: 'victims' });
const userDataCache = localForage.createInstance({ name: 'userData' });

// Define cache expiry times
const CACHE_EXPIRY = {
  ALERTS: 1 * 60 * 60 * 1000, // 1 hour for alerts
  SHELTERS: 7 * 24 * 60 * 60 * 1000, // 7 days for shelters (static data)
  TEAMS: 4 * 60 * 60 * 1000, // 4 hours for rescue teams
  VICTIMS: 30 * 60 * 1000, // 30 minutes for victims (frequent updates)
  USER_PREFERENCE: 30 * 24 * 60 * 60 * 1000, // 30 days for user preferences
}

// Interface for cached items with expiry timestamps
interface CachedItem<T> {
  data: T;
  timestamp: number;
}

/**
 * Check if the device is online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Cache data with an expiry timestamp
 */
async function cacheData<T>(cache: LocalForage, key: string, data: T): Promise<void> {
  const item: CachedItem<T> = {
    data,
    timestamp: Date.now()
  };
  await cache.setItem(key, item);
}

/**
 * Retrieve data from cache if it's not expired
 */
async function getFromCache<T>(cache: LocalForage, key: string, expiryTime: number): Promise<T | null> {
  try {
    const item = await cache.getItem<CachedItem<T>>(key);
    
    if (!item) return null;
    
    // Check if cache is expired
    if (Date.now() - item.timestamp > expiryTime) {
      return null;
    }
    
    return item.data;
  } catch (error) {
    console.error('Error retrieving from cache:', error);
    return null;
  }
}

/**
 * Cache active alerts for offline access
 */
export async function cacheAlerts(alerts: Alert[]): Promise<void> {
  console.log('[Offline] Caching alerts for offline access');
  await cacheData(alertsCache, 'activeAlerts', alerts);
}

/**
 * Get alerts from cache if online fetch fails
 */
export async function getCachedAlerts(): Promise<Alert[] | null> {
  return getFromCache<Alert[]>(alertsCache, 'activeAlerts', CACHE_EXPIRY.ALERTS);
}

/**
 * Cache shelter locations for offline access
 * This data is essential for finding safety during disasters
 */
export async function cacheShelters(shelters: Shelter[]): Promise<void> {
  console.log('[Offline] Caching shelter locations for offline access');
  await cacheData(sheltersCache, 'shelters', shelters);
}

/**
 * Get shelters from cache - critical for offline operation
 */
export async function getCachedShelters(): Promise<Shelter[] | null> {
  return getFromCache<Shelter[]>(sheltersCache, 'shelters', CACHE_EXPIRY.SHELTERS);
}

/**
 * Cache rescue teams for offline access
 */
export async function cacheRescueTeams(teams: RescueTeam[]): Promise<void> {
  console.log('[Offline] Caching rescue teams for offline access');
  await cacheData(teamsCache, 'rescueTeams', teams);
}

/**
 * Get rescue teams from cache
 */
export async function getCachedRescueTeams(): Promise<RescueTeam[] | null> {
  return getFromCache<RescueTeam[]>(teamsCache, 'rescueTeams', CACHE_EXPIRY.TEAMS);
}

/**
 * Cache pending SOS victims for offline access
 */
export async function cacheVictims(victims: Victim[]): Promise<void> {
  console.log('[Offline] Caching victim data for offline access');
  await cacheData(victimsCache, 'victims', victims);
}

/**
 * Get victims from cache
 */
export async function getCachedVictims(): Promise<Victim[] | null> {
  return getFromCache<Victim[]>(victimsCache, 'victims', CACHE_EXPIRY.VICTIMS);
}

/**
 * Store pending SOS requests that couldn't be sent while offline
 */
export async function storePendingSOS(sosData: any): Promise<void> {
  try {
    // Get existing pending requests
    const existing = await userDataCache.getItem<any[]>('pendingSOS') || [];
    
    // Add new request with timestamp
    const updatedPending = [
      ...existing,
      {
        ...sosData,
        timestamp: Date.now(),
        attempts: 0
      }
    ];
    
    await userDataCache.setItem('pendingSOS', updatedPending);
    console.log('[Offline] Stored pending SOS request for later sending');
  } catch (error) {
    console.error('Error storing pending SOS:', error);
  }
}

/**
 * Get all pending SOS requests to be sent when online
 */
export async function getPendingSOSRequests(): Promise<any[]> {
  try {
    return await userDataCache.getItem<any[]>('pendingSOS') || [];
  } catch (error) {
    console.error('Error getting pending SOS requests:', error);
    return [];
  }
}

/**
 * Mark SOS request as sent and remove from pending list
 */
export async function clearPendingSOS(timestamp: number): Promise<void> {
  try {
    const pending = await getPendingSOSRequests();
    const updated = pending.filter(req => req.timestamp !== timestamp);
    await userDataCache.setItem('pendingSOS', updated);
  } catch (error) {
    console.error('Error clearing pending SOS:', error);
  }
}

/**
 * Update attempt count for pending SOS request
 */
export async function updateSOSAttempt(timestamp: number): Promise<void> {
  try {
    const pending = await getPendingSOSRequests();
    const updated = pending.map(req => {
      if (req.timestamp === timestamp) {
        return { ...req, attempts: req.attempts + 1 };
      }
      return req;
    });
    await userDataCache.setItem('pendingSOS', updated);
  } catch (error) {
    console.error('Error updating SOS attempt count:', error);
  }
}

/**
 * Clear all cached data (used for logout or reset)
 */
export async function clearAllCaches(): Promise<void> {
  try {
    await Promise.all([
      alertsCache.clear(),
      sheltersCache.clear(),
      teamsCache.clear(),
      victimsCache.clear(),
      // Don't clear user data cache to keep pending SOS requests
    ]);
    console.log('[Offline] All caches cleared');
  } catch (error) {
    console.error('Error clearing caches:', error);
  }
}

/**
 * Get the user's preferred language for notifications
 */
export async function getUserLanguage(): Promise<string> {
  try {
    const preferences = await userDataCache.getItem<{language: string}>('userPreferences');
    return preferences?.language || navigator.language || 'en';
  } catch (error) {
    console.error('Error getting user language:', error);
    return 'en';
  }
}

/**
 * Set the user's preferred language for notifications
 */
export async function setUserLanguage(language: string): Promise<void> {
  try {
    const preferences = await userDataCache.getItem<{[key: string]: any}>('userPreferences') || {};
    await userDataCache.setItem('userPreferences', {
      ...preferences,
      language
    });
  } catch (error) {
    console.error('Error setting user language:', error);
  }
}

/**
 * Configure offline mode settings
 */
export async function configureOfflineMode(settings: {
  enabled: boolean;
  cacheAlerts: boolean;
  cacheShelters: boolean;
  cacheTeams: boolean;
  lowBandwidthMode: boolean;
}): Promise<void> {
  try {
    await userDataCache.setItem('offlineSettings', settings);
  } catch (error) {
    console.error('Error saving offline settings:', error);
  }
}

/**
 * Get offline mode settings
 */
export async function getOfflineSettings(): Promise<{
  enabled: boolean;
  cacheAlerts: boolean;
  cacheShelters: boolean;
  cacheTeams: boolean;
  lowBandwidthMode: boolean;
}> {
  try {
    const settings = await userDataCache.getItem<any>('offlineSettings');
    return settings || {
      enabled: true,
      cacheAlerts: true,
      cacheShelters: true,
      cacheTeams: true,
      lowBandwidthMode: false
    };
  } catch (error) {
    console.error('Error getting offline settings:', error);
    return {
      enabled: true,
      cacheAlerts: true,
      cacheShelters: true,
      cacheTeams: true,
      lowBandwidthMode: false
    };
  }
}

// Setup events to detect online/offline status
export function setupOfflineDetection(callbacks: {
  onOffline?: () => void;
  onOnline?: () => void;
}): void {
  window.addEventListener('online', () => {
    console.log('[Offline] Device is now online');
    callbacks.onOnline?.();
  });
  
  window.addEventListener('offline', () => {
    console.log('[Offline] Device is now offline');
    callbacks.onOffline?.();
  });
}