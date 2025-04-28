import React from 'react';
import { Link, useLocation } from 'wouter';
import { Home, BarChart2, Cog, Users, Activity, GitBranch } from 'lucide-react';

const Sidebar: React.FC = () => {
  const [location] = useLocation();
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  return (
    <aside className="w-64 h-screen bg-neutral-dark text-white fixed left-0 top-0 overflow-y-auto">
      <div className="p-5 flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <h1 className="text-2xl font-bold">SaviorNet</h1>
      </div>
      
      <nav className="mt-8">
        <Link href="/">
          <a className={`flex items-center space-x-3 px-5 py-3 ${
            isActive('/') ? 'bg-gray-800 border-l-4 border-primary' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          }`}>
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
          </a>
        </Link>
        
        <Link href="/predictions">
          <a className={`flex items-center space-x-3 px-5 py-3 ${
            isActive('/predictions') ? 'bg-gray-800 border-l-4 border-primary' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          }`}>
            <BarChart2 className="h-5 w-5" />
            <span>AI Predictions</span>
          </a>
        </Link>
        
        <Link href="/rescue-teams">
          <a className={`flex items-center space-x-3 px-5 py-3 ${
            isActive('/rescue-teams') ? 'bg-gray-800 border-l-4 border-primary' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          }`}>
            <GitBranch className="h-5 w-5" />
            <span>Rescue Teams</span>
          </a>
        </Link>
        
        <Link href="/victims">
          <a className={`flex items-center space-x-3 px-5 py-3 ${
            isActive('/victims') ? 'bg-gray-800 border-l-4 border-primary' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          }`}>
            <Users className="h-5 w-5" />
            <span>Victims</span>
          </a>
        </Link>
        
        <Link href="/analytics">
          <a className={`flex items-center space-x-3 px-5 py-3 ${
            isActive('/analytics') ? 'bg-gray-800 border-l-4 border-primary' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          }`}>
            <Activity className="h-5 w-5" />
            <span>Analytics</span>
          </a>
        </Link>
        
        <Link href="/settings">
          <a className={`flex items-center space-x-3 px-5 py-3 ${
            isActive('/settings') ? 'bg-gray-800 border-l-4 border-primary' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          }`}>
            <Cog className="h-5 w-5" />
            <span>Settings</span>
          </a>
        </Link>
      </nav>
      
      <div className="absolute bottom-0 w-full p-5 border-t border-gray-800">
        <div className="flex items-center space-x-3">
          <img 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=144&h=144&q=80" 
            alt="Admin profile" 
            className="h-10 w-10 rounded-full"
          />
          <div>
            <p className="text-sm font-medium">Dr. Aditya Singh</p>
            <p className="text-xs text-gray-400">Rescue Coordinator</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
