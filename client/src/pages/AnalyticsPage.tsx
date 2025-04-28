import React from 'react';
import { Activity, PieChart, BarChart2, TrendingUp, Users, Radio, Clock } from 'lucide-react';
import { useDisaster } from '@/context/DisasterContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

const AnalyticsPage: React.FC = () => {
  const { victims, predictions, rescueTeams, shelters } = useDisaster();
  
  // Calculate analytics data
  const pendingVictims = victims.filter(v => v.status === 'pending').length;
  const assignedVictims = victims.filter(v => v.status === 'assigned').length;
  const rescuedVictims = victims.filter(v => v.status === 'rescued').length;
  
  const availableTeams = rescueTeams.filter(t => t.status === 'available').length;
  const busyTeams = rescueTeams.filter(t => t.status === 'busy').length;
  const offlineTeams = rescueTeams.filter(t => t.status === 'offline').length;
  
  const highRiskPredictions = predictions.filter(p => p.severity === 'high').length;
  const mediumRiskPredictions = predictions.filter(p => p.severity === 'medium').length;
  const lowRiskPredictions = predictions.filter(p => p.severity === 'low').length;
  
  // Prepare data for charts
  const victimStatusData = [
    { name: 'Pending', value: pendingVictims, color: '#E53E3E' },
    { name: 'In Progress', value: assignedVictims, color: '#DD6B20' },
    { name: 'Rescued', value: rescuedVictims, color: '#38A169' }
  ];
  
  const teamStatusData = [
    { name: 'Available', value: availableTeams, color: '#38A169' },
    { name: 'Busy', value: busyTeams, color: '#E53E3E' },
    { name: 'Offline', value: offlineTeams, color: '#718096' }
  ];
  
  const predictionSeverityData = [
    { name: 'High', value: highRiskPredictions, color: '#E53E3E' },
    { name: 'Medium', value: mediumRiskPredictions, color: '#DD6B20' },
    { name: 'Low', value: lowRiskPredictions, color: '#38A169' }
  ];
  
  const disasterTypeData = [
    { 
      name: 'Flood', 
      predictions: predictions.filter(p => p.disasterType === 'flood').length,
      victims: victims.filter(v => v.sosType === 'flood').length
    },
    { 
      name: 'Earthquake', 
      predictions: predictions.filter(p => p.disasterType === 'earthquake').length,
      victims: victims.filter(v => v.sosType === 'earthquake').length
    },
    { 
      name: 'Fire', 
      predictions: predictions.filter(p => 
        p.disasterType === 'fire' || p.disasterType === 'wildfire'
      ).length,
      victims: victims.filter(v => 
        v.sosType === 'fire' || v.sosType === 'wildfire'
      ).length
    },
    { 
      name: 'Medical', 
      predictions: 0, // Typically medical is not predicted
      victims: victims.filter(v => v.sosType === 'medical').length
    }
  ];
  
  // Calculate shelter occupancy
  const shelterCapacity = shelters.reduce((acc, shelter) => acc + shelter.capacity, 0);
  const currentOccupancy = shelters.reduce((acc, shelter) => acc + shelter.currentOccupancy, 0);
  const occupancyPercentage = shelterCapacity > 0 ? Math.round((currentOccupancy / shelterCapacity) * 100) : 0;
  
  // Calculate rescue efficiency
  const rescueEfficiency = victims.length > 0 ? 
    Math.round((rescuedVictims / victims.length) * 100) : 0;
    
  // Calculate response time (mock data as we don't track actual time to rescue)
  const averageResponseTime = '37 minutes';
  
  // Time to complete charts
  const timeToCompleteData = [
    { name: 'Flood', time: 45 },
    { name: 'Earthquake', time: 60 },
    { name: 'Fire', time: 38 },
    { name: 'Medical', time: 25 }
  ];
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-dark flex items-center">
            <Activity className="mr-2 h-6 w-6" />
            Disaster Response Analytics
          </h1>
          <p className="text-gray-600">Monitor and analyze disaster response performance</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total SOS Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Radio className="h-8 w-8 text-red-500 mr-3" />
              <div className="text-3xl font-bold">{victims.length}</div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {pendingVictims} pending • {assignedVictims} in progress • {rescuedVictims} rescued
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Rescue Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-500 mr-3" />
              <div className="text-3xl font-bold">{rescueTeams.length}</div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {availableTeams} available • {busyTeams} busy • {offlineTeams} offline
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Rescue Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-500 mr-3" />
              <div className="text-3xl font-bold">{rescueEfficiency}%</div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {rescuedVictims} rescued out of {victims.length} total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Avg. Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500 mr-3" />
              <div className="text-3xl font-bold">{averageResponseTime}</div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              From SOS signal to rescue completion
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="victims">Victims</TabsTrigger>
          <TabsTrigger value="teams">Rescue Teams</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Disaster Types</CardTitle>
                <CardDescription>Comparison of predictions vs. actual incidents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={disasterTypeData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="predictions" fill="#3182CE" name="Predictions" />
                      <Bar dataKey="victims" fill="#E53E3E" name="Actual Incidents" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Shelter Occupancy</CardTitle>
                <CardDescription>Current occupancy vs. total capacity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-[300px]">
                  <div className="relative w-44 h-44">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle 
                        className="text-gray-200" 
                        strokeWidth="10" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="40" 
                        cx="50" 
                        cy="50" 
                      />
                      <circle 
                        className="text-primary" 
                        strokeWidth="10" 
                        strokeLinecap="round" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="40" 
                        cx="50" 
                        cy="50" 
                        strokeDasharray={`${2 * Math.PI * 40 * (occupancyPercentage / 100)} ${2 * Math.PI * 40}`} 
                        strokeDashoffset="0" 
                      />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                      <div className="text-3xl font-bold">{occupancyPercentage}%</div>
                      <div className="text-sm">Occupied</div>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">
                      {currentOccupancy} / {shelterCapacity} people housed in shelters
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Average Time to Complete Rescue</CardTitle>
                <CardDescription>By disaster type (in minutes)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={timeToCompleteData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="time" fill="#DD6B20" name="Minutes" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Disaster Impact Risk Areas</CardTitle>
                <CardDescription>Distribution of high-risk regions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <div className="map-container w-full h-full rounded-lg" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="victims">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Victim Status Distribution</CardTitle>
                <CardDescription>Breakdown of current victim statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={victimStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {victimStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Response Time Histogram</CardTitle>
                <CardDescription>Distribution of rescue response times</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { time: '0-15 min', count: 5 },
                        { time: '15-30 min', count: 12 },
                        { time: '30-45 min', count: 8 },
                        { time: '45-60 min', count: 3 },
                        { time: '60+ min', count: 2 }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3182CE" name="Number of Rescues" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="teams">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Status</CardTitle>
                <CardDescription>Current availability of rescue teams</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={teamStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {teamStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Team Specialization</CardTitle>
                <CardDescription>Breakdown of team specialties</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { 
                          specialty: 'Flood', 
                          count: rescueTeams.filter(t => t.specialization === 'flood').length 
                        },
                        { 
                          specialty: 'Earthquake', 
                          count: rescueTeams.filter(t => t.specialization === 'earthquake').length 
                        },
                        { 
                          specialty: 'Fire', 
                          count: rescueTeams.filter(
                            t => t.specialization === 'fire' || t.specialization === 'wildfire'
                          ).length 
                        },
                        { 
                          specialty: 'Medical', 
                          count: rescueTeams.filter(t => t.specialization === 'medical').length 
                        }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="specialty" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#DD6B20" name="Number of Teams" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="predictions">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Prediction Accuracy</CardTitle>
                <CardDescription>How well predictions matched actual events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { category: 'Successful', value: 8 },
                        { category: 'Partial', value: 3 },
                        { category: 'Incorrect', value: 1 }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3182CE" name="Predictions" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Prediction Severity</CardTitle>
                <CardDescription>Distribution of prediction risk levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={predictionSeverityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {predictionSeverityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
