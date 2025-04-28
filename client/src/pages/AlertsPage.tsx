import React, { useState } from 'react';
import { AlertTriangle, Filter, ArrowLeft, Info, CheckCircle } from 'lucide-react';
import { useDisaster } from '@/context/DisasterContext';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const getAlertSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'critical':
      return 'bg-red-500 text-white';
    case 'warning':
      return 'bg-amber-500 text-white';
    case 'info':
      return 'bg-blue-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

const AlertsPage: React.FC = () => {
  const { alerts, activeAlerts } = useDisaster();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter alerts
  const filteredActiveAlerts = activeAlerts.filter(alert => 
    alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alert.region.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredInactiveAlerts = alerts
    .filter(alert => !alert.isActive)
    .filter(alert => 
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.region.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="px-4 py-4 bg-white shadow-md">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLocation('/')}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Alerts & Warnings</h1>
        </div>
      </div>
      
      <div className="p-4">
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            Stay informed with the latest disaster alerts and follow the recommended safety measures.
          </AlertDescription>
        </Alert>
        
        <div className="mb-4 relative">
          <Input
            placeholder="Search by title, message, or region..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        
        <Tabs defaultValue="active" className="w-full mb-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active" className="flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Active Alerts ({activeAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="inactive">
              <CheckCircle className="h-4 w-4 mr-2" />
              Past Alerts ({alerts.filter(a => !a.isActive).length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            {filteredActiveAlerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? 
                  `No active alerts found matching "${searchQuery}"` : 
                  'No active alerts at this time'
                }
              </div>
            ) : (
              <div className="space-y-4">
                {filteredActiveAlerts.map(alert => (
                  <Card key={alert.id} className="overflow-hidden">
                    <div className={`h-2 ${getAlertSeverityColor(alert.severity)}`} />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                          {alert.title}
                        </CardTitle>
                        <Badge className={getAlertSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <CardDescription>
                        {alert.region} • {alert.createdAt ? formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true }) : ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{alert.message}</p>
                      
                      <div className="mt-4 bg-blue-50 p-3 rounded-md flex items-start">
                        <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="text-xs text-blue-700">
                          <p className="font-medium mb-1">Safety Instructions:</p>
                          <ul className="list-disc pl-4 space-y-1">
                            <li>Stay away from low-lying areas</li>
                            <li>Follow evacuation orders immediately</li>
                            <li>Keep emergency supplies ready</li>
                            <li>Stay tuned for further updates</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4 flex justify-between">
                      <Button variant="outline" size="sm">
                        View on Map
                      </Button>
                      <Button size="sm">
                        Evacuation Info
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="inactive">
            {filteredInactiveAlerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? 
                  `No past alerts found matching "${searchQuery}"` : 
                  'No past alerts available'
                }
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInactiveAlerts.map(alert => (
                  <Card key={alert.id} className="bg-gray-50">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg text-gray-700">{alert.title}</CardTitle>
                        <Badge variant="outline">RESOLVED</Badge>
                      </div>
                      <CardDescription>
                        {alert.region} • {alert.createdAt ? formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true }) : ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      <Button variant="outline" size="sm" className="ml-auto">
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AlertsPage;
