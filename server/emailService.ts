import { MailService } from '@sendgrid/mail';
import { Alert } from '@shared/schema';

// Initialize SendGrid if API key is available
let mailService: MailService | null = null;

if (process.env.SENDGRID_API_KEY) {
  mailService = new MailService();
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('SendGrid email service initialized');
} else {
  console.log('SendGrid API key not found, email notifications will not be sent');
}

/**
 * Send an email alert notification using SendGrid
 */
export async function sendAlertEmail(
  alert: Alert,
  recipients: string[]
): Promise<{ success: boolean, error?: string }> {
  if (!mailService) {
    return { 
      success: false, 
      error: 'Email service not initialized (missing SENDGRID_API_KEY)'
    };
  }

  if (!recipients || recipients.length === 0) {
    return { 
      success: false, 
      error: 'No recipients provided'
    };
  }

  try {
    const severityEmoji = 
      alert.severity === 'critical' ? '🚨' : 
      alert.severity === 'warning' ? '⚠️' : 
      alert.severity === 'watch' ? '👁️' : 
      '📊';

    // Create HTML content with better formatting
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="background-color: ${alert.severity === 'critical' ? '#f44336' : '#ff9800'}; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0;">${severityEmoji} ${alert.title}</h1>
          <p style="color: white; margin: 10px 0 0 0;">Severity: ${alert.severity.toUpperCase()}</p>
        </div>
        
        <div style="padding: 0 10px;">
          <p style="font-size: 16px; line-height: 1.5;">${alert.message}</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Region:</strong> ${alert.region}</p>
            <p style="margin: 10px 0 0 0;"><strong>Time:</strong> ${new Date(alert.createdAt || new Date()).toLocaleString()}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #757575; font-size: 14px;">This is an automated alert from SaviorNet Disaster Management System. Please follow official guidance for your area.</p>
          </div>
        </div>
      </div>
    `;

    const textContent = `
${severityEmoji} ${alert.title}
Severity: ${alert.severity.toUpperCase()}

${alert.message}

Region: ${alert.region}
Time: ${new Date(alert.createdAt || new Date()).toLocaleString()}

This is an automated alert from SaviorNet Disaster Management System. Please follow official guidance for your area.
    `;

    await mailService.send({
      to: recipients,
      from: 'alerts@saviornet.org', // This would be your verified sender in SendGrid
      subject: `${severityEmoji} SaviorNet Alert: ${alert.title}`,
      text: textContent,
      html: htmlContent,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send alert email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Send an SOS notification to emergency services
 */
export async function sendSOSNotification(
  sosData: { 
    sosType: string; 
    location: { lat: number; lng: number };
    additionalInfo?: string;
  },
  recipient: string
): Promise<{ success: boolean, error?: string }> {
  if (!mailService) {
    return { 
      success: false, 
      error: 'Email service not initialized (missing SENDGRID_API_KEY)'
    };
  }

  try {
    // Create HTML content with location map and details
    const mapUrl = `https://www.google.com/maps?q=${sosData.location.lat},${sosData.location.lng}`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="background-color: #d32f2f; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0;">🆘 Emergency SOS Alert</h1>
          <p style="color: white; margin: 10px 0 0 0;">Type: ${sosData.sosType}</p>
        </div>
        
        <div style="padding: 0 10px;">
          <p style="font-size: 16px; line-height: 1.5;"><strong>Emergency assistance required immediately.</strong></p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Location Coordinates:</strong> ${sosData.location.lat}, ${sosData.location.lng}</p>
            <p style="margin: 10px 0;"><strong>View on Map:</strong> <a href="${mapUrl}" target="_blank">${mapUrl}</a></p>
            ${sosData.additionalInfo ? `<p style="margin: 10px 0 0 0;"><strong>Additional Information:</strong> ${sosData.additionalInfo}</p>` : ''}
            <p style="margin: 10px 0 0 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <a href="${mapUrl}" target="_blank" style="display: block; text-align: center;">
              <img src="https://maps.googleapis.com/maps/api/staticmap?center=${sosData.location.lat},${sosData.location.lng}&zoom=14&size=600x300&markers=color:red%7C${sosData.location.lat},${sosData.location.lng}&key=YOUR_API_KEY" alt="Location Map" style="max-width: 100%; height: auto; border-radius: 5px;">
            </a>
            <p style="text-align: center; color: #757575; font-size: 12px; margin-top: 5px;">Map image for location reference</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #757575; font-size: 14px;">This is an automated SOS alert from SaviorNet Disaster Management System. Please respond immediately.</p>
          </div>
        </div>
      </div>
    `;

    const textContent = `
🆘 EMERGENCY SOS ALERT
Type: ${sosData.sosType}

Emergency assistance required immediately.

Location Coordinates: ${sosData.location.lat}, ${sosData.location.lng}
View on Map: ${mapUrl}
${sosData.additionalInfo ? `Additional Information: ${sosData.additionalInfo}` : ''}
Time: ${new Date().toLocaleString()}

This is an automated SOS alert from SaviorNet Disaster Management System. Please respond immediately.
    `;

    await mailService.send({
      to: recipient,
      from: 'emergency@saviornet.org', // This would be your verified sender in SendGrid
      subject: `🆘 URGENT: SOS Alert - ${sosData.sosType} Emergency`,
      text: textContent,
      html: htmlContent,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send SOS notification email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}