import React, { useState } from 'react';
import { Droplet, Activity, Flame, Info, Clock, Download, Mail, FileText } from 'lucide-react';
import { useDisaster } from '@/context/DisasterContext';
import { formatDistanceToNow } from 'date-fns';

const AIPredictions: React.FC = () => {
  const { predictions, runPrediction } = useDisaster();
  const [isRunningPrediction, setIsRunningPrediction] = useState(false);
  const [disasterType, setDisasterType] = useState('flood');
  const [region, setRegion] = useState('Krishna River Basin');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [exportType, setExportType] = useState<'none' | 'pdf' | 'csv'>('none');
  
  const handleRunPrediction = async () => {
    setIsRunningPrediction(true);
    
    try {
      await runPrediction({ disasterType, region });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error running prediction:', error);
    } finally {
      setIsRunningPrediction(false);
    }
  };
  
  const handleExport = (type: 'pdf' | 'csv') => {
    setExportType(type);
    // In a real app, this would trigger a download
    setTimeout(() => {
      setExportType('none');
      alert(`Exported disaster predictions as ${type.toUpperCase()}`);
    }, 1500);
  };
  
  const handleEmailReport = () => {
    // In a real app, this would send an email using SendGrid
    alert('Disaster prediction report sent to emergency team via SendGrid');
  };
  
  const getPredictionIcon = (type: string) => {
    const iconSize = "h-8 w-8 mr-3";
    
    switch (type.toLowerCase()) {
      case 'flood':
        return (
          <div className="flex items-center">
            <span className="text-xl mr-2">🌊</span>
            <Droplet className={`${iconSize} text-blue-500`} />
          </div>
        );
      case 'earthquake':
        return (
          <div className="flex items-center">
            <span className="text-xl mr-2">🌎</span>
            <Activity className={`${iconSize} text-yellow-500`} />
          </div>
        );
      case 'wildfire':
      case 'fire':
        return (
          <div className="flex items-center">
            <span className="text-xl mr-2">🔥</span>
            <Flame className={`${iconSize} text-orange-500`} />
          </div>
        );
      default:
        return <Info className={`${iconSize} text-gray-500`} />;
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
  
  const getCardBackground = (type: string, severity: string) => {
    if (severity.toLowerCase() === 'high') {
      return 'disaster-card-high';
    }
    
    switch (type.toLowerCase()) {
      case 'flood':
        return 'disaster-card-flood';
      case 'earthquake':
        return 'disaster-card-earthquake';
      case 'wildfire':
      case 'fire':
        return 'disaster-card-wildfire';
      default:
        return '';
    }
  };
  
  return (
    <div className="mt-8 bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">AI Disaster Predictions</h3>
            <p className="text-gray-600">Machine learning predictions based on weather, seismic, and historical data</p>
          </div>
          <span className="last-updated">
            <Clock className="h-3 w-3" /> Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {predictions.slice(0, 3).map(prediction => (
            <div 
              key={prediction.id} 
              className={`disaster-card fade-in ${getCardBackground(prediction.disasterType, prediction.severity)}`}
            >
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
                <button className="text-secondary text-sm font-medium hover:underline">View Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 border-t border-gray-200 flex flex-wrap justify-between items-center">
        <div className="flex space-x-2 mb-2 md:mb-0">
          <button 
            className={`px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg flex items-center text-sm ${exportType === 'pdf' ? 'opacity-50' : ''}`}
            onClick={() => handleExport('pdf')}
            disabled={exportType !== 'none'}
          >
            <FileText className="h-4 w-4 mr-1" />
            {exportType === 'pdf' ? 'Exporting PDF...' : 'Export PDF Report'}
          </button>
          <button 
            className={`px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg flex items-center text-sm ${exportType === 'csv' ? 'opacity-50' : ''}`}
            onClick={() => handleExport('csv')}
            disabled={exportType !== 'none'}
          >
            <Download className="h-4 w-4 mr-1" />
            {exportType === 'csv' ? 'Exporting CSV...' : 'Export CSV'}
          </button>
          <button 
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg flex items-center text-sm"
            onClick={handleEmailReport}
          >
            <Mail className="h-4 w-4 mr-1" />
            Send Email Report
          </button>
        </div>
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
