import React, { useState } from 'react';
import { BarChart2, PlusCircle, AlertCircle, Droplet, Zap, Flame } from 'lucide-react';
import { useDisaster } from '@/context/DisasterContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';

const AIPredictionsPage: React.FC = () => {
  const { predictions, runPrediction } = useDisaster();
  const [newPrediction, setNewPrediction] = useState({
    disasterType: 'flood',
    region: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPrediction({
      ...newPrediction,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (value: string) => {
    setNewPrediction({
      ...newPrediction,
      disasterType: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrediction.region) return;

    setIsSubmitting(true);
    try {
      await runPrediction(newPrediction);
      setNewPrediction({ ...newPrediction, region: '' });
    } catch (error) {
      console.error('Failed to run prediction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDisasterIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'flood':
        return <Droplet className="h-6 w-6 text-blue-500" />;
      case 'earthquake':
        return <Zap className="h-6 w-6 text-yellow-500" />;
      case 'wildfire':
      case 'fire':
        return <Flame className="h-6 w-6 text-orange-500" />;
      default:
        return <AlertCircle className="h-6 w-6 text-red-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'text-red-500 bg-red-50';
      case 'medium':
        return 'text-yellow-500 bg-yellow-50';
      case 'low':
        return 'text-green-500 bg-green-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-dark flex items-center">
            <BarChart2 className="mr-2 h-6 w-6" />
            AI Disaster Predictions
          </h1>
          <p className="text-gray-600">
            Machine learning-based predictions for natural disasters
          </p>
        </div>
        <Button onClick={() => document.getElementById('new-prediction-form')?.scrollIntoView({ behavior: 'smooth' })}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Prediction
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {predictions.map((prediction) => (
          <Card key={prediction.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {getDisasterIcon(prediction.disasterType)}
                  <CardTitle className="ml-2">
                    {prediction.disasterType.charAt(0).toUpperCase() + prediction.disasterType.slice(1)}
                  </CardTitle>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(prediction.severity)}`}>
                  {prediction.severity.toUpperCase()}
                </span>
              </div>
              <CardDescription>{prediction.region}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
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
              <p className="text-sm">{prediction.description}</p>
              {prediction.predictedTimeframe && (
                <p className="text-sm mt-2">
                  <span className="font-medium">Timeframe:</span> {prediction.predictedTimeframe}
                </p>
              )}
            </CardContent>
            <CardFooter className="text-xs text-gray-500 justify-between">
              <span>Created {formatDistanceToNow(new Date(prediction.createdAt), { addSuffix: true })}</span>
              <Button variant="link" size="sm">
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card id="new-prediction-form" className="mt-6">
        <CardHeader>
          <CardTitle>Run New AI Prediction</CardTitle>
          <CardDescription>
            Generate a new disaster prediction using our AI model
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Disaster Type</label>
              <Select 
                value={newPrediction.disasterType}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select disaster type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flood">Flood</SelectItem>
                  <SelectItem value="earthquake">Earthquake</SelectItem>
                  <SelectItem value="wildfire">Wildfire</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Region</label>
              <Input
                name="region"
                value={newPrediction.region}
                onChange={handleInputChange}
                placeholder="Enter region name"
                required
              />
            </div>
            <Button type="submit" disabled={isSubmitting || !newPrediction.region}>
              {isSubmitting ? 'Processing...' : 'Run Prediction'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIPredictionsPage;
