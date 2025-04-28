import React, { useState } from 'react';
import { GitBranch, UserCheck, UserX, MapPin, Search } from 'lucide-react';
import { useDisaster } from '@/context/DisasterContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const RescueTeamsPage: React.FC = () => {
  const { rescueTeams, updateTeamLocation } = useDisaster();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter teams based on search query
  const filteredTeams = rescueTeams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-500">Available</Badge>;
      case 'busy':
        return <Badge className="bg-red-500">Busy</Badge>;
      case 'offline':
        return <Badge className="bg-gray-500">Offline</Badge>;
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };
  
  // Simulate team location update
  const simulateLocationUpdate = (teamId: number) => {
    // Generate a random location nearby for demo purposes
    const newLocation = {
      lat: 16.5062 + (Math.random() - 0.5) * 0.05,
      lng: 80.6480 + (Math.random() - 0.5) * 0.05
    };
    
    updateTeamLocation(teamId, newLocation);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-dark flex items-center">
            <GitBranch className="mr-2 h-6 w-6" />
            Rescue Teams
          </h1>
          <p className="text-gray-600">Manage and coordinate rescue operations</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search teams..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map(team => (
          <Card key={team.id}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-bold">{team.name}</CardTitle>
              {getStatusBadge(team.status)}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Specialization</span>
                  <span className="font-medium capitalize">{team.specialization}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Capacity</span>
                  <span className="font-medium">{team.capacity} members</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Contact</span>
                  <span className="font-medium">{team.contact}</span>
                </div>
                {team.location && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Location</span>
                    <span className="font-medium text-xs">
                      {team.location.lat.toFixed(4)}, {team.location.lng.toFixed(4)}
                    </span>
                  </div>
                )}
                <div className="pt-3 flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full flex items-center"
                    onClick={() => simulateLocationUpdate(team.id)}
                  >
                    <MapPin className="h-4 w-4 mr-1" />
                    Update Location
                  </Button>
                  {team.status === 'available' ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full flex items-center"
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Set Offline
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full flex items-center"
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Set Available
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredTeams.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">No rescue teams found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
};

export default RescueTeamsPage;
