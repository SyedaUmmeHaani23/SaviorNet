import {
  users, type User, type InsertUser,
  victims, type Victim, type InsertVictim,
  rescueTeams, type RescueTeam, type InsertRescueTeam,
  shelters, type Shelter, type InsertShelter,
  disasterPredictions, type DisasterPrediction, type InsertDisasterPrediction,
  alerts, type Alert, type InsertAlert
} from "@shared/schema";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Victim operations
  getVictims(): Promise<Victim[]>;
  getVictim(id: number): Promise<Victim | undefined>;
  createVictim(victim: InsertVictim): Promise<Victim>;
  updateVictimStatus(id: number, status: string, teamId?: number): Promise<Victim | undefined>;
  
  // Rescue Team operations
  getRescueTeams(): Promise<RescueTeam[]>;
  getRescueTeam(id: number): Promise<RescueTeam | undefined>;
  createRescueTeam(team: InsertRescueTeam): Promise<RescueTeam>;
  updateRescueTeamStatus(id: number, status: string): Promise<RescueTeam | undefined>;
  updateRescueTeamLocation(id: number, location: { lat: number, lng: number }): Promise<RescueTeam | undefined>;
  
  // Shelter operations
  getShelters(): Promise<Shelter[]>;
  getShelter(id: number): Promise<Shelter | undefined>;
  createShelter(shelter: InsertShelter): Promise<Shelter>;
  updateShelterOccupancy(id: number, occupancy: number): Promise<Shelter | undefined>;
  
  // Disaster Prediction operations
  getDisasterPredictions(): Promise<DisasterPrediction[]>;
  getDisasterPrediction(id: number): Promise<DisasterPrediction | undefined>;
  createDisasterPrediction(prediction: InsertDisasterPrediction): Promise<DisasterPrediction>;
  
  // Alert operations
  getAlerts(active?: boolean): Promise<Alert[]>;
  getAlert(id: number): Promise<Alert | undefined>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  deactivateAlert(id: number): Promise<Alert | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private victims: Map<number, Victim>;
  private rescueTeams: Map<number, RescueTeam>;
  private shelters: Map<number, Shelter>;
  private disasterPredictions: Map<number, DisasterPrediction>;
  private alerts: Map<number, Alert>;
  
  private userId: number;
  private victimId: number;
  private teamId: number;
  private shelterId: number;
  private predictionId: number;
  private alertId: number;

  constructor() {
    this.users = new Map();
    this.victims = new Map();
    this.rescueTeams = new Map();
    this.shelters = new Map();
    this.disasterPredictions = new Map();
    this.alerts = new Map();
    
    this.userId = 1;
    this.victimId = 1;
    this.teamId = 1;
    this.shelterId = 1;
    this.predictionId = 1;
    this.alertId = 1;
    
    // Add some initial data
    this.seedData();
  }

  // Seed with some initial data for testing
  private seedData() {
    // Add rescue teams
    const teams: InsertRescueTeam[] = [
      {
        name: "Team Alpha",
        specialization: "flood",
        status: "available",
        location: { lat: 16.5062, lng: 80.6480 }, // Near Vijayawada
        capacity: 10,
        contact: "+91 9876543210"
      },
      {
        name: "Team Bravo",
        specialization: "medical",
        status: "busy",
        location: { lat: 16.4800, lng: 80.6700 },
        capacity: 5,
        contact: "+91 9876543211"
      },
      {
        name: "Team Charlie",
        specialization: "earthquake",
        status: "available",
        location: { lat: 16.4900, lng: 80.6600 },
        capacity: 8,
        contact: "+91 9876543212"
      }
    ];
    
    teams.forEach(team => this.createRescueTeam(team));
    
    // Add shelters
    const shelters: InsertShelter[] = [
      {
        name: "Government High School",
        location: { lat: 16.5100, lng: 80.6300 },
        capacity: 200,
        currentOccupancy: 120,
        amenities: ["food", "water", "medical", "beds"],
        contactInfo: "+91 9876543213"
      },
      {
        name: "Krishna Community Center",
        location: { lat: 16.5200, lng: 80.6400 },
        capacity: 120,
        currentOccupancy: 45,
        amenities: ["food", "water", "beds"],
        contactInfo: "+91 9876543214"
      }
    ];
    
    shelters.forEach(shelter => this.createShelter(shelter));
    
    // Add predictions
    const predictions: InsertDisasterPrediction[] = [
      {
        disasterType: "flood",
        region: "Krishna River Basin",
        riskLevel: 0.8,
        severity: "high",
        description: "Expected heavy rainfall in next 24 hours. Recommend evacuation of low-lying areas.",
        predictedTimeframe: "6 hours",
        affectedAreas: ["Vijayawada", "Rajamundry", "Krishna Delta"],
        sourceData: { rainfall: "250mm", riverLevel: "rising" }
      },
      {
        disasterType: "earthquake",
        region: "Eastern Ghats",
        riskLevel: 0.45,
        severity: "medium",
        description: "Mild tremors detected in Eastern Ghats region. Pattern recognition suggests low probability of major event.",
        predictedTimeframe: "12 hours",
        affectedAreas: ["Vishakhapatnam", "East Godavari"],
        sourceData: { seismicActivity: "3.5 Richter", historicalPattern: "Low" }
      },
      {
        disasterType: "wildfire",
        region: "Forest Regions",
        riskLevel: 0.15,
        severity: "low",
        description: "Recent rainfall has reduced risk in forest regions. Continue monitoring southern zones with dry conditions.",
        predictedTimeframe: "24 hours",
        affectedAreas: ["Southern Forest Belt"],
        sourceData: { temperature: "32°C", humidity: "65%", rainfall: "recent" }
      }
    ];
    
    predictions.forEach(prediction => this.createDisasterPrediction(prediction));
    
    // Add active alert
    this.createAlert({
      predictionId: 1,
      title: "Flood Warning",
      message: "Krishna River Basin: 80% chance in 6 hours",
      severity: "critical",
      region: "Krishna River Basin",
      isActive: true
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }
  
  // Victim operations
  async getVictims(): Promise<Victim[]> {
    return Array.from(this.victims.values());
  }
  
  async getVictim(id: number): Promise<Victim | undefined> {
    return this.victims.get(id);
  }
  
  async createVictim(insertVictim: InsertVictim): Promise<Victim> {
    const id = this.victimId++;
    const victim: Victim = { ...insertVictim, id, timestamp: new Date() };
    this.victims.set(id, victim);
    return victim;
  }
  
  async updateVictimStatus(id: number, status: string, teamId?: number): Promise<Victim | undefined> {
    const victim = this.victims.get(id);
    if (!victim) return undefined;
    
    const updatedVictim: Victim = {
      ...victim,
      status,
      assignedTeamId: teamId || victim.assignedTeamId
    };
    
    this.victims.set(id, updatedVictim);
    return updatedVictim;
  }
  
  // Rescue Team operations
  async getRescueTeams(): Promise<RescueTeam[]> {
    return Array.from(this.rescueTeams.values());
  }
  
  async getRescueTeam(id: number): Promise<RescueTeam | undefined> {
    return this.rescueTeams.get(id);
  }
  
  async createRescueTeam(insertTeam: InsertRescueTeam): Promise<RescueTeam> {
    const id = this.teamId++;
    const team: RescueTeam = { ...insertTeam, id };
    this.rescueTeams.set(id, team);
    return team;
  }
  
  async updateRescueTeamStatus(id: number, status: string): Promise<RescueTeam | undefined> {
    const team = this.rescueTeams.get(id);
    if (!team) return undefined;
    
    const updatedTeam: RescueTeam = {
      ...team,
      status
    };
    
    this.rescueTeams.set(id, updatedTeam);
    return updatedTeam;
  }
  
  async updateRescueTeamLocation(id: number, location: { lat: number, lng: number }): Promise<RescueTeam | undefined> {
    const team = this.rescueTeams.get(id);
    if (!team) return undefined;
    
    const updatedTeam: RescueTeam = {
      ...team,
      location
    };
    
    this.rescueTeams.set(id, updatedTeam);
    return updatedTeam;
  }
  
  // Shelter operations
  async getShelters(): Promise<Shelter[]> {
    return Array.from(this.shelters.values());
  }
  
  async getShelter(id: number): Promise<Shelter | undefined> {
    return this.shelters.get(id);
  }
  
  async createShelter(insertShelter: InsertShelter): Promise<Shelter> {
    const id = this.shelterId++;
    const shelter: Shelter = { ...insertShelter, id };
    this.shelters.set(id, shelter);
    return shelter;
  }
  
  async updateShelterOccupancy(id: number, occupancy: number): Promise<Shelter | undefined> {
    const shelter = this.shelters.get(id);
    if (!shelter) return undefined;
    
    const updatedShelter: Shelter = {
      ...shelter,
      currentOccupancy: occupancy
    };
    
    this.shelters.set(id, updatedShelter);
    return updatedShelter;
  }
  
  // Disaster Prediction operations
  async getDisasterPredictions(): Promise<DisasterPrediction[]> {
    return Array.from(this.disasterPredictions.values());
  }
  
  async getDisasterPrediction(id: number): Promise<DisasterPrediction | undefined> {
    return this.disasterPredictions.get(id);
  }
  
  async createDisasterPrediction(insertPrediction: InsertDisasterPrediction): Promise<DisasterPrediction> {
    const id = this.predictionId++;
    const now = new Date();
    const prediction: DisasterPrediction = { 
      ...insertPrediction, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.disasterPredictions.set(id, prediction);
    return prediction;
  }
  
  // Alert operations
  async getAlerts(active?: boolean): Promise<Alert[]> {
    const allAlerts = Array.from(this.alerts.values());
    if (active !== undefined) {
      return allAlerts.filter(alert => alert.isActive === active);
    }
    return allAlerts;
  }
  
  async getAlert(id: number): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }
  
  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.alertId++;
    const alert: Alert = { ...insertAlert, id, createdAt: new Date() };
    this.alerts.set(id, alert);
    return alert;
  }
  
  async deactivateAlert(id: number): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;
    
    const updatedAlert: Alert = {
      ...alert,
      isActive: false
    };
    
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }
}

import { DatabaseStorage } from './databaseStorage';

// Choose which storage implementation to use
// For production, use DatabaseStorage
// For development or testing without a database, uncomment the MemStorage line
// export const storage = new MemStorage();
export const storage = new DatabaseStorage();
