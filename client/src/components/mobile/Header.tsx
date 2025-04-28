import React from 'react';
import { Bell, Wifi, WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useDisaster } from '@/context/DisasterContext';

const Header: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { activeAlerts } = useDisaster();
  
  return (
    <header className="bg-white shadow-md">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h1 className="text-2xl font-bold text-neutral-dark">SaviorNet</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            {activeAlerts.length > 0 && (
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
            )}
            <Bell className="h-6 w-6 text-neutral" />
          </div>
          <div className="relative">
            {!isOnline && (
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
            )}
            {isOnline ? (
              <Wifi className="h-6 w-6 text-neutral" />
            ) : (
              <WifiOff className="h-6 w-6 text-neutral" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
