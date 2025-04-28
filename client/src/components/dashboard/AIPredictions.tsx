import React, { useState } from 'react';
import { Droplet, Activity, Flame, Info } from 'lucide-react';
import { useDisaster } from '@/context/DisasterContext';
import { formatDistanceToNow } from 'date-fns';

const AIPredictions: React.FC = () => {
  const { predictions, runPrediction } = useDisaster();
  const [isRunningPrediction, setIsRunningPrediction] = useState(false);
  const [disasterType, setDisasterType] = useState('flood');
  const [region, setRegion] = useState('Krishna River Basin');
  
  const handleRunPrediction = async () => {
    setIsRunningPrediction(true);
    
    try {
      await runPrediction({ disasterType, region });
    } catch (error) {
      console.error('Error running prediction:', error);
    } finally {
      setIsRunningPrediction(false);
    }
  };
  
  const getPredictionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'flood':
        return <Droplet className="h-8 w-8 text-blue-500 mr-3" />;
      case 'earthquake':
        return <Activity className="h-8 w-8 text-yellow-500 mr-3" />;
      case 'wildfire':
      case 'fire':
        return <Flame className="h-8 w-8 text-orange-500 mr-3" />;
      default:
        return <Info className="h-8 w-8 text-gray-500 mr-3" />;
    }
  };
  
  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">HIGH</span>;
      case 'medium':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">MEDIUM</span>;
      case 'low':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">LOW</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">UNKNOWN</span>;
    }
  };
  
  return (
    <div className="mt-8 bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold">AI Disaster Predictions</h3>
        <p className="text-gray-600">Machine learning predictions based on weather, seismic, and historical data</p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {predictions.slice(0, 3).map(prediction => (
            <div key={prediction.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {getPredictionIcon(prediction.disasterType)}
                  <h4 className="font-semibold">
                    {prediction.disasterType.charAt(0).toUpperCase() + prediction.disasterType.slice(1)} Risk
                  </h4>
                </div>
                {getSeverityBadge(prediction.severity)}
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Risk Level</span>
                  <span className="font-medium">{Math.round(prediction.riskLevel * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      prediction.severity === 'high' ? 'bg-red-500' : 
                      prediction.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} 
                    style={{ width: `${prediction.riskLevel * 100}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-sm text-gray-600">{prediction.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  Updated {formatDistanceToNow(new Date(prediction.updatedAt), { addSuffix: true })}
                </span>
                <button className="text-secondary text-sm font-medium">View Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 border-t border-gray-200 flex justify-end">
        <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg mr-2">Export Report</button>
        <button 
          className={`px-4 py-2 bg-secondary text-white rounded-lg ${isRunningPrediction ? 'opacity-50' : ''}`}
          onClick={handleRunPrediction}
          disabled={isRunningPrediction}
        >
          {isRunningPrediction ? 'Processing...' : 'Run New Prediction'}
        </button>
      </div>
    </div>
  );
};

export default AIPredictions;
