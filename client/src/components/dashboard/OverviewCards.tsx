import React from 'react';
import { Link } from 'wouter';
import { Radio, Users, Zap, ChevronRight } from 'lucide-react';
import { useDisaster } from '@/context/DisasterContext';

const OverviewCards: React.FC = () => {
  const { 
    pendingVictims, 
    victims, 
    rescueTeams, 
    availableTeams,
    predictions
  } = useDisaster();
  
  // High risk predictions
  const highRiskPredictions = predictions.filter(p => p.severity === 'high');
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Active SOS Alerts */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Active SOS Alerts</h3>
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            {victims.length}
          </span>
        </div>
        <div className="flex items-center">
          <Radio className="h-12 w-12 text-red-500 mr-4" />
          <div>
            <div className="text-3xl font-bold">{pendingVictims.length}</div>
            <p className="text-gray-600">Unassigned</p>
          </div>
        </div>
        <div className="mt-4">
          <Link href="/victims">
            <a className="text-secondary text-sm font-medium flex items-center">
              View all alerts
              <ChevronRight className="h-4 w-4 ml-1" />
            </a>
          </Link>
        </div>
      </div>
      
      {/* Rescue Teams */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Rescue Teams</h3>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            {rescueTeams.length}
          </span>
        </div>
        <div className="flex items-center">
          <Users className="h-12 w-12 text-green-500 mr-4" />
          <div>
            <div className="text-3xl font-bold">{availableTeams.length}</div>
            <p className="text-gray-600">Available</p>
          </div>
        </div>
        <div className="mt-4">
          <Link href="/rescue-teams">
            <a className="text-secondary text-sm font-medium flex items-center">
              View all teams
              <ChevronRight className="h-4 w-4 ml-1" />
            </a>
          </Link>
        </div>
      </div>
      
      {/* AI Predictions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">AI Predictions</h3>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            {predictions.length}
          </span>
        </div>
        <div className="flex items-center">
          <Zap className="h-12 w-12 text-yellow-500 mr-4" />
          <div>
            <div className="text-3xl font-bold">{highRiskPredictions.length}</div>
            <p className="text-gray-600">High Risk</p>
          </div>
        </div>
        <div className="mt-4">
          <Link href="/predictions">
            <a className="text-secondary text-sm font-medium flex items-center">
              View predictions
              <ChevronRight className="h-4 w-4 ml-1" />
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OverviewCards;
