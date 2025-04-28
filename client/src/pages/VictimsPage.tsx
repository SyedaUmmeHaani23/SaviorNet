import React, { useState } from 'react';
import { Users, Search, Filter, UserCheck, Clock } from 'lucide-react';
import { useDisaster } from '@/context/DisasterContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const VictimsPage: React.FC = () => {
  const { victims, availableTeams, assignTeam, markVictimRescued } = useDisaster();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Apply filters
  const filteredVictims = victims.filter(victim => {
    // Search by ID or SOS type
    const matchesSearch = victim.id.toString().includes(searchQuery) || 
                          victim.sosType.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || victim.status === statusFilter;
    
    // Type filter
    const matchesType = typeFilter === 'all' || victim.sosType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });
  
  const handleAssignTeam = (victimId: number, teamId: number) => {
    assignTeam(victimId, teamId);
  };
  
  const handleMarkRescued = (victimId: number) => {
    markVictimRescued(victimId);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-red-500">Pending</Badge>;
      case 'assigned':
        return <Badge className="bg-yellow-500">In Progress</Badge>;
      case 'rescued':
        return <Badge className="bg-green-500">Rescued</Badge>;
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };
  
  const getSOSTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'flood':
        return <Badge className="bg-blue-500">Flood</Badge>;
      case 'earthquake':
        return <Badge className="bg-amber-500">Earthquake</Badge>;
      case 'fire':
      case 'wildfire':
        return <Badge className="bg-orange-500">Fire</Badge>;
      case 'medical':
        return <Badge className="bg-green-500">Medical</Badge>;
      default:
        return <Badge className="bg-gray-500">{type}</Badge>;
    }
  };
  
  // Get unique SOS types for filter
  const sosTypes = ['all', ...new Set(victims.map(v => v.sosType))];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-dark flex items-center">
            <Users className="mr-2 h-6 w-6" />
            Victims &amp; SOS Requests
          </h1>
          <p className="text-gray-600">Manage and coordinate rescue operations for victims</p>
        </div>
      </div>
      
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by ID or SOS type..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="assigned">In Progress</SelectItem>
              <SelectItem value="rescued">Rescued</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by SOS type" />
            </SelectTrigger>
            <SelectContent>
              {sosTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs defaultValue="cards" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="cards">Cards View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cards">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVictims.map(victim => (
              <Card key={victim.id}>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-lg font-bold">Victim #{victim.id}</CardTitle>
                  {getStatusBadge(victim.status)}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">SOS Type</span>
                      {getSOSTypeBadge(victim.sosType)}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Location</span>
                      <span className="font-medium text-xs">
                        {victim.location ? `${victim.location.lat.toFixed(4)}, ${victim.location.lng.toFixed(4)}` : 'Unknown'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Time</span>
                      <span className="font-medium text-xs flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {victim.timestamp ? formatDistanceToNow(new Date(victim.timestamp), { addSuffix: true }) : 'Unknown'}
                      </span>
                    </div>
                    
                    {victim.assignedTeamId && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Assigned Team</span>
                        <span className="font-medium">Team #{victim.assignedTeamId}</span>
                      </div>
                    )}
                    
                    <div className="pt-3 flex flex-col space-y-2">
                      {victim.status === 'pending' && (
                        <Select onValueChange={(value) => handleAssignTeam(victim.id, parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Assign to Team" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTeams.length === 0 ? (
                              <SelectItem value="none" disabled>No available teams</SelectItem>
                            ) : (
                              availableTeams.map(team => (
                                <SelectItem key={team.id} value={team.id.toString()}>
                                  {team.name} ({team.specialization})
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      )}
                      
                      {victim.status === 'assigned' && (
                        <Button 
                          variant="outline" 
                          className="w-full flex items-center"
                          onClick={() => handleMarkRescued(victim.id)}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Mark as Rescued
                        </Button>
                      )}
                      
                      {victim.status === 'rescued' && (
                        <div className="text-green-600 text-sm text-center font-medium py-2 border border-green-200 rounded-md bg-green-50">
                          Rescue completed successfully
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredVictims.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">No victims found matching your filters</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="table">
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="py-3 px-4 text-left font-medium">ID</th>
                  <th className="py-3 px-4 text-left font-medium">SOS Type</th>
                  <th className="py-3 px-4 text-left font-medium">Status</th>
                  <th className="py-3 px-4 text-left font-medium">Time</th>
                  <th className="py-3 px-4 text-left font-medium">Assigned Team</th>
                  <th className="py-3 px-4 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVictims.map(victim => (
                  <tr key={victim.id} className="border-b">
                    <td className="py-3 px-4">{victim.id}</td>
                    <td className="py-3 px-4">{getSOSTypeBadge(victim.sosType)}</td>
                    <td className="py-3 px-4">{getStatusBadge(victim.status)}</td>
                    <td className="py-3 px-4 text-xs">
                      {victim.timestamp ? formatDistanceToNow(new Date(victim.timestamp), { addSuffix: true }) : 'Unknown'}
                    </td>
                    <td className="py-3 px-4">
                      {victim.assignedTeamId ? `Team #${victim.assignedTeamId}` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      {victim.status === 'pending' && (
                        <Select onValueChange={(value) => handleAssignTeam(victim.id, parseInt(value))}>
                          <SelectTrigger className="h-8 w-full">
                            <SelectValue placeholder="Assign" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTeams.length === 0 ? (
                              <SelectItem value="none" disabled>No teams</SelectItem>
                            ) : (
                              availableTeams.map(team => (
                                <SelectItem key={team.id} value={team.id.toString()}>
                                  {team.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      )}
                      
                      {victim.status === 'assigned' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleMarkRescued(victim.id)}
                        >
                          Mark Rescued
                        </Button>
                      )}
                      
                      {victim.status === 'rescued' && (
                        <span className="text-green-600 text-xs font-medium">Rescued</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredVictims.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500">No victims found matching your filters</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VictimsPage;
