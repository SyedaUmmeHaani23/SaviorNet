// SMS service for sending fallback alerts when internet is unavailable

import { getUserLanguage } from './offlineManager';

interface SMSConfig {
  enabled: boolean;
  phoneNumber: string;
  useSecondaryMethod: boolean;  // Use alternative methods when Twilio is unavailable
}

/**
 * Get or create an SMS configuration for the user
 */
export async function getSMSConfig(): Promise<SMSConfig> {
  // In a real app, this would be stored in localForage
  // For demo, we'll return a default config
  return {
    enabled: true,
    phoneNumber: '', // This would be populated from user settings
    useSecondaryMethod: true
  };
}

/**
 * Update SMS configuration
 */
export async function updateSMSConfig(config: SMSConfig): Promise<void> {
  console.log('[SMS] Updating SMS configuration:', config);
  // In a real app, this would save to localForage
}

/**
 * Send an SOS request via SMS when internet is unavailable
 * This requires Twilio integration on the server
 */
export async function sendSOSViaSMS(sosData: {
  sosType: string;
  location: { lat: number; lng: number };
  additionalInfo?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const config = await getSMSConfig();
    
    if (!config.enabled || !config.phoneNumber) {
      return { 
        success: false, 
        message: 'SMS fallback is not enabled or no phone number provided'
      };
    }
    
    // In a production app, this would use a service worker to
    // queue the SMS request when internet becomes available
    console.log('[SMS] Preparing SOS SMS fallback with data:', sosData);
    
    // Format the SMS message with critical details only (to keep SMS short)
    const message = `SOS ALERT: ${sosType} emergency at location ${sosData.location.lat.toFixed(6)},${sosData.location.lng.toFixed(6)}. ${sosData.additionalInfo || ''}`;
    
    // This would make an API call to your server which would use Twilio
    // Simulating successful SMS dispatch for demo
    return { 
      success: true, 
      message: 'SOS request queued for SMS delivery when connection available'
    };
  } catch (error) {
    console.error('[SMS] Error sending SOS via SMS:', error);
    return { 
      success: false, 
      message: `Failed to send SMS: ${error}`
    };
  }
}

/**
 * Send an alert notification via SMS
 * Used when internet is unstable but cellular network is available
 */
export async function sendAlertViaSMS(alert: {
  title: string;
  message: string;
  severity: string;
  region: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const config = await getSMSConfig();
    
    if (!config.enabled || !config.phoneNumber) {
      return { 
        success: false, 
        message: 'SMS alerts are not enabled or no phone number provided'
      };
    }
    
    // Get the user's preferred language
    const language = await getUserLanguage();
    
    // In production, this would translate the message if needed
    // For demo, we'll skip actual translation
    
    // Format a concise SMS message with the alert information
    const message = `DISASTER ALERT: ${alert.title} - ${alert.severity.toUpperCase()} severity in ${alert.region}. ${alert.message}`;
    
    console.log(`[SMS] Would send alert SMS in ${language}: ${message}`);
    
    // This would make an API call to your server which would use Twilio
    // Simulating successful SMS dispatch for demo
    return { 
      success: true, 
      message: 'Alert notification queued for SMS delivery'
    };
  } catch (error) {
    console.error('[SMS] Error sending alert via SMS:', error);
    return { 
      success: false, 
      message: `Failed to send SMS alert: ${error}`
    };
  }
}

/**
 * Request to register a phone number for SMS alerts
 */
export async function registerPhoneForSMS(phoneNumber: string): Promise<{ success: boolean; message: string }> {
  try {
    // Validate phone number (basic check)
    if (!phoneNumber || phoneNumber.length < 10) {
      return {
        success: false,
        message: 'Please provide a valid phone number'
      };
    }
    
    // In a real app, this would verify the phone number via verification code
    // For demo, we'll just update the config
    const config = await getSMSConfig();
    await updateSMSConfig({
      ...config,
      phoneNumber,
      enabled: true
    });
    
    return {
      success: true,
      message: 'Phone number registered for SMS alerts'
    };
  } catch (error) {
    console.error('[SMS] Error registering phone number:', error);
    return {
      success: false,
      message: `Failed to register phone number: ${error}`
    };
  }
}