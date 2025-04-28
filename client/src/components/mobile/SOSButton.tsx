import React, { useState } from 'react';
import { Radio } from 'lucide-react';
import { getCurrentLocation } from '@/lib/mapUtils';
import { useToast } from '@/hooks/use-toast';

interface SOSButtonProps {
  onSOS: (data: { sosType: string; location: { lat: number; lng: number }; additionalInfo?: string }) => void;
}

const SOSButton: React.FC<SOSButtonProps> = ({ onSOS }) => {
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { toast } = useToast();

  const handleSOSClick = async () => {
    if (isSending || isSent) return;
    
    setIsSending(true);
    
    try {
      // Get user's location
      const location = await getCurrentLocation();
      
      // Send SOS signal
      onSOS({
        sosType: 'flood', // Default type, could be made selectable
        location,
        additionalInfo: 'Emergency assistance needed'
      });
      
      // Set UI state
      setIsSent(true);
      setTimeout(() => {
        setIsSent(false);
      }, 5000);
      
    } catch (error) {
      console.error('Failed to send SOS:', error);
      toast({
        title: 'SOS Error',
        description: 'Failed to send SOS. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <button 
      className={`alert-pulse w-full py-4 rounded-xl text-white text-xl font-bold shadow-lg mb-4 flex items-center justify-center ${
        isSent ? 'bg-green-600' : isSending ? 'bg-gray-500' : 'bg-primary'
      }`}
      onClick={handleSOSClick}
      disabled={isSending || isSent}
    >
      {isSent ? (
        "SOS SENT - HELP ON THE WAY"
      ) : (
        <>
          <Radio className="h-6 w-6 mr-2" />
          EMERGENCY SOS
        </>
      )}
    </button>
  );
};

export default SOSButton;
