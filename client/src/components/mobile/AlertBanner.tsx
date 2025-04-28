import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert } from '@shared/schema';
import { useLocation } from 'wouter';

interface AlertBannerProps {
  alert: Alert;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ alert }) => {
  const [, setLocation] = useLocation();
  
  const handleViewAlert = () => {
    setLocation('/alerts');
  };
  
  return (
    <div className="bg-red-600 text-white p-4 flex items-center justify-between">
      <div className="flex items-center">
        <AlertTriangle className="h-6 w-6 mr-2" />
        <div>
          <p className="font-semibold">{alert.title}</p>
          <p className="text-sm">{alert.message}</p>
        </div>
      </div>
      <button 
        className="bg-white text-red-600 px-3 py-1 rounded-full text-sm font-semibold"
        onClick={handleViewAlert}
      >
        View
      </button>
    </div>
  );
};

export default AlertBanner;
