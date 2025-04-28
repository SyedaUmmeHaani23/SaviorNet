import React, { useState } from 'react';
import { User, ArrowLeft, Bell, MapPin, LifeBuoy, Settings, Shield, LogOut } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

const ProfilePage: React.FC = () => {
  const [, setLocation] = useLocation();
  const isOnline = useOnlineStatus();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  
  return (
    <div className="bg-gray-100 min-h-screen pb-16">
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
          <h1 className="text-xl font-bold">Profile</h1>
        </div>
      </div>
      
      <div className="p-4">
        <Card className="mb-6">
          <CardContent className="pt-6 flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=144&h=144&q=80" alt="Profile picture" />
              <AvatarFallback>US</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold">Rahul Sharma</h2>
            <p className="text-gray-500 mb-2">+91 98765 43210</p>
            <div className="flex items-center mb-4">
              <Badge className={isOnline ? "bg-green-500" : "bg-red-500"}>
                {isOnline ? "Online" : "Offline"}
              </Badge>
            </div>
            <Button className="w-full">Edit Profile</Button>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Emergency Contacts</CardTitle>
            <CardDescription>People to notify in case of an emergency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Priya Sharma</p>
                <p className="text-sm text-gray-500">Wife • +91 98765 43211</p>
              </div>
              <Button variant="outline" size="sm">Call</Button>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Amit Sharma</p>
                <p className="text-sm text-gray-500">Brother • +91 98765 43212</p>
              </div>
              <Button variant="outline" size="sm">Call</Button>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="outline" className="w-full">
              Add Emergency Contact
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-gray-500" />
                <Label htmlFor="notifications" className="text-base">Notifications</Label>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                <Label htmlFor="location" className="text-base">Location Sharing</Label>
              </div>
              <Switch
                id="location"
                checked={locationSharing}
                onCheckedChange={setLocationSharing}
              />
            </div>
            
            <div 
              className="flex items-center justify-between py-2 px-2 rounded-md cursor-pointer hover:bg-gray-50"
              onClick={() => {}}
            >
              <div className="flex items-center space-x-2">
                <LifeBuoy className="h-5 w-5 text-gray-500" />
                <span>Help & Support</span>
              </div>
            </div>
            
            <div 
              className="flex items-center justify-between py-2 px-2 rounded-md cursor-pointer hover:bg-gray-50"
              onClick={() => {}}
            >
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-gray-500" />
                <span>Privacy & Security</span>
              </div>
            </div>
            
            <div 
              className="flex items-center justify-between py-2 px-2 rounded-md cursor-pointer hover:bg-gray-50"
              onClick={() => setLocation('/settings')}
            >
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-gray-500" />
                <span>Advanced Settings</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Button 
          variant="outline" 
          className="w-full mb-6 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Sign Out
        </Button>
        
        <p className="text-center text-xs text-gray-500 mb-8">
          SaviorNet v1.0.0 • Emergency Management System
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;
