import React from 'react';
import { Link, useLocation } from 'wouter';
import { Home, AlertTriangle, User } from 'lucide-react';

const BottomNavigation: React.FC = () => {
  const [location] = useLocation();
  
  return (
    <nav className="fixed bottom-0 w-full bg-white shadow-lg border-t border-gray-200">
      <div className="flex justify-around">
        <Link href="/">
          <a className={`flex flex-col items-center py-2 px-3 ${location === '/' ? 'text-primary' : 'text-gray-600'}`}>
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </a>
        </Link>
        
        <Link href="/alerts">
          <a className={`flex flex-col items-center py-2 px-3 ${location === '/alerts' ? 'text-primary' : 'text-gray-600'}`}>
            <AlertTriangle className="h-6 w-6" />
            <span className="text-xs mt-1">Alerts</span>
          </a>
        </Link>
        
        <Link href="/profile">
          <a className={`flex flex-col items-center py-2 px-3 ${location === '/profile' ? 'text-primary' : 'text-gray-600'}`}>
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Profile</span>
          </a>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNavigation;
