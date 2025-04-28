import React, { useState } from 'react';
import { Cog, Shield, Bell, MapPin, Users, Save, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SettingsPage: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [autoAssignTeams, setAutoAssignTeams] = useState(true);
  const [riskThreshold, setRiskThreshold] = useState([60]);
  const [darkMode, setDarkMode] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [apiBase, setApiBase] = useState('https://api.saviornet.org');
  const [weatherApiKey, setWeatherApiKey] = useState('');
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  
  const { toast } = useToast();
  
  const handleSaveSettings = (section: string) => {
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Settings saved",
        description: `Your ${section} settings have been updated successfully.`,
      });
    }, 1000);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-dark flex items-center">
            <Cog className="mr-2 h-6 w-6" />
            Settings
          </h1>
          <p className="text-gray-600">Configure system preferences and API connections</p>
        </div>
      </div>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="teams">Rescue Teams</TabsTrigger>
          <TabsTrigger value="api">API & Integration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Preferences</CardTitle>
                <CardDescription>Adjust general system settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle between light and dark theme
                    </p>
                  </div>
                  <Switch
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Offline Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable functionality when internet is unavailable
                    </p>
                  </div>
                  <Switch
                    checked={offlineMode}
                    onCheckedChange={setOfflineMode}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="te">Telugu</SelectItem>
                      <SelectItem value="ta">Tamil</SelectItem>
                      <SelectItem value="kn">Kannada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Time Format</Label>
                  <Select defaultValue="24h">
                    <SelectTrigger>
                      <SelectValue placeholder="Select time format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12-Hour (AM/PM)</SelectItem>
                      <SelectItem value="24h">24-Hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Distance Unit</Label>
                  <Select defaultValue="km">
                    <SelectTrigger>
                      <SelectValue placeholder="Select distance unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="km">Kilometers</SelectItem>
                      <SelectItem value="mi">Miles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleSaveSettings('general')}
                  disabled={saving}
                  className="ml-auto"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Update your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input defaultValue="Dr. Aditya Singh" />
                </div>
                
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue="aditya.singh@ndrf.gov.in" />
                </div>
                
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input defaultValue="+91 98765 43210" />
                </div>
                
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select defaultValue="coordinator">
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coordinator">Rescue Coordinator</SelectItem>
                      <SelectItem value="team_leader">Team Leader</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="analyst">Disaster Analyst</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Change Password</Label>
                  <Input type="password" placeholder="Enter new password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="mr-2">
                  Cancel
                </Button>
                <Button onClick={() => handleSaveSettings('account')}>
                  Update Profile
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Bell className="mr-2 h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>Configure how you receive alerts and notifications</CardDescription>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications on your device
                  </p>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                  disabled={!notificationsEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">SMS Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive critical alerts via SMS when offline
                  </p>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  disabled={!notificationsEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive daily summary reports via email
                  </p>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  disabled={!notificationsEnabled}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Alert Priority Level</Label>
                <Select defaultValue="all" disabled={!notificationsEnabled}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select alert level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Alerts</SelectItem>
                    <SelectItem value="critical">Critical Only</SelectItem>
                    <SelectItem value="high">High and Critical</SelectItem>
                    <SelectItem value="custom">Custom Setting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Notification Frequency</Label>
                  <span className="text-xs text-muted-foreground">
                    {notificationsEnabled ? 'Real-time' : 'Disabled'}
                  </span>
                </div>
                <Slider
                  value={[100]}
                  min={0}
                  max={100}
                  step={25}
                  disabled={!notificationsEnabled}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Hourly</span>
                  <span>Daily</span>
                  <span>Weekly</span>
                  <span>Real-time</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleSaveSettings('notifications')}
                disabled={saving}
                className="ml-auto"
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="location">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    Location Settings
                  </CardTitle>
                  <CardDescription>Manage location sharing and tracking preferences</CardDescription>
                </div>
                <Switch
                  checked={locationSharing}
                  onCheckedChange={setLocationSharing}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Share Location</Label>
                  <p className="text-sm text-muted-foreground">
                    Share your real-time location with rescue teams
                  </p>
                </div>
                <Switch
                  checked={locationSharing}
                  onCheckedChange={setLocationSharing}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Background Location</Label>
                  <p className="text-sm text-muted-foreground">
                    Continue tracking location when app is closed
                  </p>
                </div>
                <Switch
                  checked={locationSharing}
                  disabled={!locationSharing}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Location History</Label>
                  <p className="text-sm text-muted-foreground">
                    Store location history for analytics
                  </p>
                </div>
                <Switch
                  checked={locationSharing}
                  disabled={!locationSharing}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Location Accuracy</Label>
                <Select defaultValue="high" disabled={!locationSharing}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select accuracy level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High (GPS)</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="low">Low (Battery Saving)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Geofencing Radius</Label>
                  <span className="text-xs text-muted-foreground">
                    {locationSharing ? '500m' : 'Disabled'}
                  </span>
                </div>
                <Slider
                  value={[50]}
                  min={0}
                  max={100}
                  step={10}
                  disabled={!locationSharing}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>100m</span>
                  <span>500m</span>
                  <span>1km</span>
                  <span>5km</span>
                </div>
              </div>
              
              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <Info className="h-5 w-5 text-blue-500" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Privacy Note</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Your location data is only shared with authorized rescue personnel during 
                        emergency situations. All data is encrypted and securely stored.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleSaveSettings('location')}
                disabled={saving}
                className="ml-auto"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Rescue Team Settings
                  </CardTitle>
                  <CardDescription>Configure team assignment and coordination preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Automatic Team Assignment</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically assign teams to emergencies based on proximity
                  </p>
                </div>
                <Switch
                  checked={autoAssignTeams}
                  onCheckedChange={setAutoAssignTeams}
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Risk Threshold for Auto-Assignment</Label>
                  <span className="text-xs text-muted-foreground">
                    {riskThreshold}%
                  </span>
                </div>
                <Slider
                  value={riskThreshold}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={setRiskThreshold}
                  disabled={!autoAssignTeams}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                  <span>Critical</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Team Assignment Priority</Label>
                <Select defaultValue="proximity" disabled={!autoAssignTeams}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proximity">Proximity</SelectItem>
                    <SelectItem value="specialization">Specialization</SelectItem>
                    <SelectItem value="availability">Availability</SelectItem>
                    <SelectItem value="balanced">Balanced Approach</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Maximum Response Distance</Label>
                <Select defaultValue="10km">
                  <SelectTrigger>
                    <SelectValue placeholder="Select maximum distance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5km">5 kilometers</SelectItem>
                    <SelectItem value="10km">10 kilometers</SelectItem>
                    <SelectItem value="25km">25 kilometers</SelectItem>
                    <SelectItem value="50km">50 kilometers</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Team Status Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Require periodic status updates from teams
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="space-y-2">
                <Label>Update Frequency</Label>
                <Select defaultValue="5min">
                  <SelectTrigger>
                    <SelectValue placeholder="Select update frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2min">Every 2 minutes</SelectItem>
                    <SelectItem value="5min">Every 5 minutes</SelectItem>
                    <SelectItem value="10min">Every 10 minutes</SelectItem>
                    <SelectItem value="15min">Every 15 minutes</SelectItem>
                    <SelectItem value="30min">Every 30 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleSaveSettings('teams')}
                disabled={saving}
                className="ml-auto"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    API & Integrations
                  </CardTitle>
                  <CardDescription>Configure external API connections and data sources</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>API Base URL</Label>
                <Input 
                  value={apiBase}
                  onChange={(e) => setApiBase(e.target.value)}
                  placeholder="https://api.example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Weather API Key</Label>
                <Input 
                  value={weatherApiKey}
                  onChange={(e) => setWeatherApiKey(e.target.value)}
                  type="password"
                  placeholder="Enter your OpenWeatherMap API key"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Google Maps API Key</Label>
                <Input 
                  value={googleMapsApiKey}
                  onChange={(e) => setGoogleMapsApiKey(e.target.value)}
                  type="password"
                  placeholder="Enter your Google Maps API key"
                />
              </div>
              
              <div className="space-y-2">
                <Label>SMS Gateway Service</Label>
                <Select defaultValue="twilio">
                  <SelectTrigger>
                    <SelectValue placeholder="Select SMS provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="twilio">Twilio</SelectItem>
                    <SelectItem value="aws_sns">AWS SNS</SelectItem>
                    <SelectItem value="msg91">MSG91</SelectItem>
                    <SelectItem value="custom">Custom Gateway</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Data Refresh Interval</Label>
                <Select defaultValue="30sec">
                  <SelectTrigger>
                    <SelectValue placeholder="Select refresh interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10sec">10 seconds</SelectItem>
                    <SelectItem value="30sec">30 seconds</SelectItem>
                    <SelectItem value="1min">1 minute</SelectItem>
                    <SelectItem value="5min">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable WebSocket Connection</Label>
                  <p className="text-sm text-muted-foreground">
                    Use WebSockets for real-time data transmission
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="rounded-md bg-amber-50 p-4">
                <div className="flex">
                  <Info className="h-5 w-5 text-amber-500" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800">API Note</h3>
                    <div className="mt-2 text-sm text-amber-700">
                      <p>
                        API keys are stored securely. Be sure to keep your API keys confidential and 
                        never share them with unauthorized personnel.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="mr-auto"
              >
                Test Connection
              </Button>
              <Button 
                onClick={() => handleSaveSettings('api')}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save API Settings'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
